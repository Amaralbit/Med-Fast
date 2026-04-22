import { auth } from "@/auth"
import { prisma } from "@/server/db"
import Anthropic from "@anthropic-ai/sdk"
import { getAvailableSlots } from "@/lib/slots"
import { sendNewAppointmentToDoctor } from "@/lib/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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
  const anthropic = getAnthropic()
  const { messages, doctorSlug } = await req.json() as {
    messages: Anthropic.MessageParam[]
    doctorSlug: string
  }

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

  const system = `Você é a secretária virtual do(a) Dr(a). ${doctor.user.name}${doctor.specialty ? `, especialista em ${doctor.specialty}` : ""}. Ajude pacientes a agendar consultas de forma amigável e profissional. Responda sempre em português brasileiro. Seja concisa.

Sobre o consultório:
${doctor.addressCity ? `- Local: ${doctor.addressCity}${doctor.addressState ? `/${doctor.addressState}` : ""}` : ""}
${doctor.pricePrivate ? `- Consulta particular: R$ ${Number(doctor.pricePrivate).toFixed(2)}` : ""}
- Duração: ${doctor.consultationDurationMinutes} minutos por consulta

Ao mostrar horários disponíveis, liste no máximo 5 opções de cada vez.
Para agendar, o paciente precisa estar logado. Se não estiver (você receberá NOT_AUTHENTICATED), diga educadamente que ele precisa fazer login para confirmar o agendamento.`

  const processToolCall = async (name: string, input: Record<string, unknown>): Promise<string> => {
    if (name === "check_available_slots") {
      const daysAhead = (input.days_ahead as number) || 14
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
      const endAt = new Date(startAt.getTime() + doctor.consultationDurationMinutes * 60 * 1000)

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
          notes: (input.notes as string) || null,
        },
      })

      sendNewAppointmentToDoctor({
        doctorEmail: doctor.user.email,
        doctorName: doctor.user.name,
        patientName: patientUser?.name ?? "Paciente",
        patientEmail: patientUser?.email ?? "",
        startAt,
        endAt,
        notes: (input.notes as string) || null,
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
