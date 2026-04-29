import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { GoogleGenAI, Type } from "@google/genai"
import type { Tool } from "@google/genai"
import { getAvailableSlots } from "@/lib/slots"
import { sendNewAppointmentToDoctor } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import { hasAiChat, PLAN_LIMITS } from "@/lib/plan"
import { verifyActionToken } from "@/lib/security/form-protection"
import { ACTION_TOKEN_HEADER } from "@/lib/security/form-protection-shared"
import { sanitizeMultilineText } from "@/lib/security/sanitize"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NOTES_MAX = 2000
const SLUG_RE = /^[a-z0-9-]+$/
const MAX_MESSAGES = 50
const MAX_MESSAGE_CHARS = 10_000

function normalizeApiKey(raw: string | undefined) {
  if (!raw) return null
  const trimmed = raw.trim()
  const unquoted =
    trimmed.length >= 2 &&
    ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
      ? trimmed.slice(1, -1).trim()
      : trimmed

  return unquoted.length > 0 ? unquoted : null
}

function getGemini() {
  const apiKey = normalizeApiKey(process.env.GEMINI_API_KEY) ?? normalizeApiKey(process.env.GOOGLE_API_KEY)
  if (!apiKey) throw new Error("Gemini API key is not configured")
  return new GoogleGenAI({ apiKey })
}

const TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "check_available_slots",
        description: "Verifica os horarios disponiveis para agendamento nos proximos dias",
        parameters: {
          type: Type.OBJECT,
          properties: {
            days_ahead: { type: Type.NUMBER, description: "Quantos dias a frente verificar (padrao: 14)" },
          },
        },
      },
      {
        name: "book_appointment",
        description: "Agenda uma consulta para o paciente logado no sistema",
        parameters: {
          type: Type.OBJECT,
          properties: {
            slot_datetime: { type: Type.STRING, description: "ISO 8601, ex: 2026-04-22T09:00:00.000Z" },
            notes: { type: Type.STRING, description: "Motivo da consulta (opcional)" },
          },
          required: ["slot_datetime"],
        },
      },
    ],
  },
]

type ChatMessage = { role: "user" | "assistant"; content: string }

function getSameOriginHost(req: Request) {
  const origin = req.headers.get("origin")
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
  if (!origin || !host) return true

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  if (!getSameOriginHost(req)) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1"
  const rl = checkRateLimit(`chat:${ip}`, 8, 60 * 1000)
  if (!rl.allowed) {
    return Response.json(
      { error: "Muitas requisições. Aguarde um momento." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  const session = await auth()
  try {
    await verifyActionToken(
      req.headers.get(ACTION_TOKEN_HEADER),
      "public:ai-chat",
      session?.user.id ?? "anon",
      2 * 60 * 60 * 1000
    )
  } catch {
    return Response.json({ error: "Falha de segurança na requisição" }, { status: 403 })
  }

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

  if (!Array.isArray(rawMessages) || rawMessages.length === 0 || rawMessages.length > MAX_MESSAGES) {
    return Response.json({ error: "Mensagens inválidas" }, { status: 400 })
  }

  let messages: ChatMessage[]
  try {
    messages = rawMessages.map((m) => {
      if (typeof m !== "object" || m === null) throw new Error("invalid")
      const msg = m as Record<string, unknown>
      if (msg.role !== "user" && msg.role !== "assistant") throw new Error("invalid-role")
      if (typeof msg.content !== "string") throw new Error("invalid-content")
      return {
        role: msg.role as "user" | "assistant",
        content: sanitizeMultilineText(msg.content, MAX_MESSAGE_CHARS),
      }
    })
  } catch {
    return Response.json({ error: "Mensagens inválidas" }, { status: 400 })
  }

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

  const systemInstruction = `Você é a secretária virtual do(a) Dr(a). ${doctor.user.name}${doctor.specialty ? `, especialista em ${doctor.specialty}` : ""}. Ajude pacientes a agendar consultas de forma amigável e profissional. Responda sempre em português brasileiro. Seja concisa.

Sobre o consultório:
${doctor.addressCity ? `- Local: ${doctor.addressCity}${doctor.addressState ? `/${doctor.addressState}` : ""}` : ""}
${doctor.pricePrivate ? `- Consulta particular: R$ ${Number(doctor.pricePrivate).toFixed(2)}` : ""}
- Duração: ${doctor.consultationDurationMinutes} minutos por consulta

Ao mostrar horários disponíveis, liste no máximo 5 opções de cada vez.
Para agendar, o paciente precisa estar logado. Se não estiver (você receberá NOT_AUTHENTICATED), diga educadamente que ele precisa fazer login para confirmar o agendamento.`

  const processToolCall = async (name: string, args: Record<string, unknown>): Promise<string> => {
    if (name === "check_available_slots") {
      const daysAhead = Math.min(Math.max(1, Number(args.days_ahead) || 14), 30)
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

      const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } })
      if (!patientProfile) return JSON.stringify({ error: "NO_PROFILE" })

      const startAt = new Date(args.slot_datetime as string)
      if (isNaN(startAt.getTime())) return JSON.stringify({ error: "INVALID_DATETIME" })

      const endAt = new Date(startAt.getTime() + doctor.consultationDurationMinutes * 60 * 1000)
      const notes =
        typeof args.notes === "string" ? sanitizeMultilineText(args.notes, NOTES_MAX) || null : null

      const plan = (doctor.plan ?? "FREE") as keyof typeof PLAN_LIMITS
      const monthCap = PLAN_LIMITS[plan].maxAppointmentsPerMonth
      if (isFinite(monthCap)) {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const count = await prisma.appointment.count({
          where: { doctorProfileId: doctor.id, startAt: { gte: startOfMonth }, status: { notIn: ["CANCELLED"] } },
        })
        if (count >= monthCap) return JSON.stringify({ error: "MONTHLY_LIMIT_REACHED" })
      }

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
        data: { doctorProfileId: doctor.id, patientProfileId: patientProfile.id, startAt, endAt, status: "PENDING", notes },
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

      return JSON.stringify({ success: true, bookedAt: startAt.toISOString() })
    }

    return "Ferramenta desconhecida"
  }

  const ai = getGemini()
  const contents: { role: string; parts: Array<{ text?: string; functionResponse?: object }> }[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))

  let requiresAuth = false

  try {
    for (let i = 0; i < 5; i++) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: { systemInstruction, tools: TOOLS },
      })

      const parts = response.candidates?.[0]?.content?.parts ?? []
      const functionCallParts = parts.filter((p) => p.functionCall)
      const textParts = parts.filter((p) => p.text)

      if (functionCallParts.length === 0) {
        const text = textParts.map((p) => p.text ?? "").join("")
        return Response.json({ message: text, requiresAuth })
      }

      contents.push({ role: "model", parts })

      const functionResponses = await Promise.all(
        functionCallParts.map(async (part) => {
          const { name, args } = part.functionCall!
          const result = await processToolCall(name ?? "", (args ?? {}) as Record<string, unknown>)
          if (result.includes("NOT_AUTHENTICATED")) requiresAuth = true
          return { functionResponse: { name: name ?? "", response: { result } } }
        })
      )

      contents.push({ role: "user", parts: functionResponses })
    }
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    const message = err instanceof Error ? err.message : String(err)
    if (status === 429) {
      return Response.json({ message: "Muitas mensagens em pouco tempo. Aguarde um momento e tente novamente.", requiresAuth })
    }
    if (
      message.includes("Gemini API key is not configured") ||
      message.includes("API key should be set") ||
      (status === 403 && message.includes("unregistered callers"))
    ) {
      return Response.json(
        { message: "O chat com IA está temporariamente indisponível por configuração da chave do Gemini.", requiresAuth },
        { status: 503 }
      )
    }
    console.error("[chat]", err)
    return Response.json({ message: "Desculpe, ocorreu um erro. Tente novamente.", requiresAuth }, { status: 500 })
  }

  return Response.json({ message: "Desculpe, ocorreu um erro. Tente novamente.", requiresAuth }, { status: 500 })
}
