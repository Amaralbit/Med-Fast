import { auth } from "@/auth"
import { prisma } from "@/server/db"
import Anthropic from "@anthropic-ai/sdk"
import { getAvailableSlots } from "@/lib/slots"
import { sendNewAppointmentToDoctor } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import { hasAiChat } from "@/lib/plan"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NOTES_MAX = 2000
const SLUG_RE = /^[a-z0-9-]+$/
const MAX_MESSAGES = 50
const MAX_MESSAGE_CHARS = 10_000

function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  return new Anthropic({ apiKey })
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "check_available_slots",
    description: "Verifica os horários disponíveis para agendamento nos próximos dias",
    input_schema: {
      type: "object",
      properties: {
        days_ahead: { type: "number", description: "Quantos dias à frente verificar (padrão: 14)" },
      },
      required: [],
    },
  },
  {
    name: "book_appointment",
    description: "Agenda uma consulta para o paciente logado no sistema",
    input_schema: {
      type: "object",
      properties: {
        slot_datetime: { type: "string", description: "ISO 8601, ex: 2026-04-22T09:00:00.000Z" },
        notes: { type: "string", description: "Motivo da consulta (opcional)" },
      },
      required: ["slot_datetime"],
    },
  },
]

export async function POST(req: Request) {
  // ── CORS: only accept same-origin requests ─────────────────────────────────
  const origin = req.headers.get("origin")
  const host = req.headers.get("host")
  if (origin && host && !origin.includes(host)) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // ── Rate limiting: 20 chat requests per minute per IP ──────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1"
  const rl = checkRateLimit(`chat:${ip}`, 20, 60 * 1000)
  if (!rl.allowed) {
    return Response.json(
      { error: "Muitas requisições. Aguarde um momento." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    )
  }

  // ── Input validation ────────────────────────────────────────────────────────
  let body: { messages?: unknown; doctorSlug?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 })
  }

  const { messages: rawMessages, doctorSlug } = body

  if (typeof doctorSlug !== "string" || !SLUG_RE.test(doctorSlug) || doctorSlug.length > 100) {
    return Response.json({ error: "Slug inválido" }, { status: 400 })
  }

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return Response.json({ error: "Mensagens inválidas" }, { status: 400 })
  }

  if (rawMessages.length > MAX_MESSAGES) {
    return Response.json({ error: "Histórico muito longo" }, { status: 400 })
  }

  // Validate each message shape and truncate oversized content
  const messages: Anthropic.MessageParam[] = rawMessages.map((m) => {
    if (typeof m !== "object" || m === null) throw new Error("invalid")
    const msg = m as Record<string, unknown>
    if (msg.role !== "user" && msg.role !== "assistant") throw new Error("invalid role")
    if (typeof msg.content !== "string") throw new Error("invalid content")
    return {
      role: msg.role as "user" | "assistant",
      content: (msg.content as string).slice(0, MAX_MESSAGE_CHARS),
    }
  })

  const anthropic = getAnthropic()
  const session = await auth()

  const doctor = await prisma.doctorProfile.findUnique({
    where: { slug: doctorSlug, isPublished: true },
    include: {
      user: { select: { name: true, email: true } },
      availabilities: true,
      appointments: {
        where: { startAt: { gte: new Date() }, status: { notIn: ["CANCELLED"] } },
        select: { startAt: true, endAt: true },
      },
      blockedSlots: {
        where: { endAt: { gte: new Date() } },
        select: { startAt: true, endAt: true },
      },
    },
  })

  if (!doctor) return Response.json({ error: "Médico não encontrado" }, { status: 404 })

  if (!hasAiChat(doctor.plan)) {
    return Response.json({ error: "Chat com IA não disponível neste plano." }, { status: 403 })
  }

  const system = `Você é a secretária virtual do(a) Dr(a). ${doctor.user.name}${doctor.specialty ? `, especialista em ${doctor.specialty}` : ""}. Ajude pacientes a agendar consultas de forma amigável e profissional. Responda sempre em português brasileiro. Seja concisa.

Sobre o consultório:
${doctor.addressCity ? `- Local: ${doctor.addressCity}${doctor.addressState ? `/${doctor.addressState}` : ""}` : ""}
${doctor.pricePrivate ? `- Consulta particular: R$ ${Number(doctor.pricePrivate).toFixed(2)}` : ""}
- Duração: ${doctor.consultationDurationMinutes} minutos por consulta

Ao mostrar horários disponíveis, liste no máximo 5 opções de cada vez.
Para agendar, o paciente precisa estar logado. Se não estiver (você receberá NOT_AUTHENTICATED), diga educadamente que ele precisa fazer login para confirmar o agendamento.`

  const processToolCall = async (name: string, input: Record<string, unknown>): Promise<string> => {
    if (name === "check_available_slots") {
      // Clamp days_ahead to prevent excessive computation
      const daysAhead = Math.min(Math.max(1, Number(input.days_ahead) || 14), 30)
      const slots = getAvailableSlots(
        doctor.availabilities,
        doctor.appointments,
        doctor.blockedSlots,
        doctor.consultationDurationMinutes,
        daysAhead
      )
      if (slots.length === 0) return "Não há horários disponíveis nos próximos dias."
      return JSON.stringify(slots.slice(0, 20))
    }

    if (name === "book_appointment") {
      if (!session?.user) return JSON.stringify({ error: "NOT_AUTHENTICATED" })

      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (!patientProfile) return JSON.stringify({ error: "NO_PROFILE" })

      const startAt = new Date(input.slot_datetime as string)
      if (isNaN(startAt.getTime())) return JSON.stringify({ error: "INVALID_DATETIME" })

      const endAt = new Date(startAt.getTime() + doctor.consultationDurationMinutes * 60 * 1000)

      // Sanitize and cap notes supplied by the AI
      const notes = typeof input.notes === "string"
        ? input.notes.trim().slice(0, NOTES_MAX) || null
        : null

      const conflict = await prisma.appointment.findFirst({
        where: {
          doctorProfileId: doctor.id,
          status: { notIn: ["CANCELLED"] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      })
      if (conflict) return JSON.stringify({ error: "SLOT_TAKEN" })

      const patientUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      })

      await prisma.appointment.create({
        data: {
          doctorProfileId: doctor.id,
          patientProfileId: patientProfile.id,
          startAt,
          endAt,
          status: "PENDING",
          notes,
        },
      })

      sendNewAppointmentToDoctor({
        doctorEmail: doctor.user.email,
        doctorName: doctor.user.name,
        patientName: patientUser?.name ?? "Paciente",
        patientEmail: patientUser?.email ?? "",
        startAt,
        endAt,
        notes,
      }).catch(() => {})

      return JSON.stringify({
        success: true,
        bookedAt: startAt.toISOString(),
      })
    }

    return "Ferramenta desconhecida"
  }

  // Agentic loop — max 5 iterations to prevent runaway
  const currentMessages: Anthropic.MessageParam[] = [...messages]
  let requiresAuth = false

  for (let i = 0; i < 5; i++) {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system,
      tools: TOOLS,
      messages: currentMessages,
    })

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
      return Response.json({ message: text, requiresAuth })
    }

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      )

      currentMessages.push({ role: "assistant", content: response.content })

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const result = await processToolCall(block.name, block.input as Record<string, unknown>)
          if (result.includes("NOT_AUTHENTICATED")) requiresAuth = true
          return { type: "tool_result", tool_use_id: block.id, content: result }
        })
      )

      currentMessages.push({ role: "user", content: toolResults })
      continue
    }

    break
  }

  return Response.json({ message: "Desculpe, ocorreu um erro. Tente novamente.", requiresAuth })
}