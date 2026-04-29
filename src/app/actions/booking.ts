"use server"

import { headers } from "next/headers"
import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/rate-limit"
import { PLAN_LIMITS } from "@/lib/plan"
import { sanitizeMultilineText } from "@/lib/security/sanitize"
import { verifyActionToken } from "@/lib/security/form-protection"

export type SlotTime = { startAt: string; endAt: string; label: string }

const DAY_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
const NOTES_MAX_LENGTH = 2000

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

async function getClientIp() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1"
}

export async function getAvailableSlots(doctorProfileId: string, dateStr: string): Promise<SlotTime[]> {
  const ip = await getClientIp()
  const rl = checkRateLimit(`slots:${doctorProfileId}:${ip}`, 120, 60 * 1000)
  if (!rl.allowed) return []

  const date = new Date(`${dateStr}T00:00:00-03:00`)
  const dayOfWeek = DAY_OF_WEEK[date.getUTCDay()]

  const [profile, availability] = await Promise.all([
    prisma.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      select: { consultationDurationMinutes: true },
    }),
    prisma.weeklyAvailability.findFirst({
      where: { doctorProfileId, dayOfWeek: dayOfWeek as never },
    }),
  ])

  if (!profile || !availability) return []

  const duration = profile.consultationDurationMinutes
  const startMin = parseTime(availability.startTime)
  const endMin = parseTime(availability.endTime)
  const dayStart = new Date(`${dateStr}T00:00:00-03:00`)
  const dayEnd = new Date(`${dateStr}T23:59:59-03:00`)

  const [blockedSlots, existingAppts] = await Promise.all([
    prisma.blockedSlot.findMany({
      where: { doctorProfileId, startAt: { lte: dayEnd }, endAt: { gte: dayStart } },
    }),
    prisma.appointment.findMany({
      where: {
        doctorProfileId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lte: dayEnd },
        endAt: { gte: dayStart },
      },
    }),
  ])

  const now = new Date()
  const slots: SlotTime[] = []
  let current = startMin

  while (current + duration <= endMin) {
    const slotStart = new Date(`${dateStr}T${minutesToTime(current)}:00-03:00`)
    const slotEnd = new Date(`${dateStr}T${minutesToTime(current + duration)}:00-03:00`)

    if (slotStart > now) {
      const hasConflict =
        blockedSlots.some((b) => b.startAt < slotEnd && b.endAt > slotStart) ||
        existingAppts.some((a) => a.startAt < slotEnd && a.endAt > slotStart)

      if (!hasConflict) {
        slots.push({
          startAt: slotStart.toISOString(),
          endAt: slotEnd.toISOString(),
          label: minutesToTime(current),
        })
      }
    }

    current += duration
  }

  return slots
}

export async function bookAppointment(
  doctorProfileId: string,
  startAt: string,
  endAt: string,
  notes: string | undefined,
  actionToken: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth()
  if (!session) return { error: "Faça login para agendar" }
  if (session.user.role !== "PATIENT") return { error: "Apenas pacientes podem agendar consultas" }

  try {
    await verifyActionToken(actionToken, "patient:book-appointment", session.user.id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha de segurança na requisição" }
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!patientProfile) return { error: "Perfil de paciente não encontrado" }

  const rl = checkRateLimit(`book:${patientProfile.id}`, 10, 60 * 60 * 1000)
  if (!rl.allowed) return { error: "Muitas solicitações. Aguarde um momento." }

  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorProfileId },
    select: { plan: true },
  })
  const plan = (doctor?.plan ?? "FREE") as keyof typeof PLAN_LIMITS
  const monthCap = PLAN_LIMITS[plan].maxAppointmentsPerMonth
  if (isFinite(monthCap)) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const count = await prisma.appointment.count({
      where: { doctorProfileId, startAt: { gte: startOfMonth }, status: { notIn: ["CANCELLED"] } },
    })
    if (count >= monthCap) {
      return { error: "Este médico atingiu o limite de agendamentos do mês. Tente contato pelo WhatsApp." }
    }
  }

  const sanitizedNotes = notes ? sanitizeMultilineText(notes, NOTES_MAX_LENGTH) || null : null

  const slotStart = new Date(startAt)
  const slotEnd = new Date(endAt)

  if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) {
    return { error: "Horário inválido" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          doctorProfileId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startAt: { lt: slotEnd },
          endAt: { gt: slotStart },
        },
      })
      if (conflict) throw new Error("SLOT_TAKEN")

      await tx.appointment.create({
        data: {
          doctorProfileId,
          patientProfileId: patientProfile.id,
          startAt: slotStart,
          endAt: slotEnd,
          status: "PENDING",
          notes: sanitizedNotes,
        },
      })
    })
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_TAKEN") {
      return { error: "Este horário não está mais disponível. Escolha outro." }
    }
    throw err
  }

  revalidatePath("/dashboard/patient/consultas")
  revalidatePath("/dashboard/doctor/agendamentos")

  return { success: true }
}
