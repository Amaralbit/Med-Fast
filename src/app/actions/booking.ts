"use server"

import { headers } from "next/headers"
import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/rate-limit"
import { PLAN_LIMITS } from "@/lib/plan"
import { getAvailableSlotsForDate } from "@/lib/slots"
import { sanitizeMultilineText } from "@/lib/security/sanitize"
import { verifyActionToken } from "@/lib/security/form-protection"

export type SlotTime = { startAt: string; endAt: string; label: string }

const NOTES_MAX_LENGTH = 2000

async function getClientIp() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1"
}

export async function getAvailableSlots(doctorProfileId: string, dateStr: string): Promise<SlotTime[]> {
  const ip = await getClientIp()
  const rl = checkRateLimit(`slots:${doctorProfileId}:${ip}`, 120, 60 * 1000)
  if (!rl.allowed) return []

  const [profile, availabilities, blockedSlots, existingAppts] = await Promise.all([
    prisma.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      select: { consultationDurationMinutes: true },
    }),
    prisma.weeklyAvailability.findMany({
      where: { doctorProfileId },
    }),
    prisma.blockedSlot.findMany({
      where: {
        doctorProfileId,
        startAt: { lte: new Date(`${dateStr}T23:59:59-03:00`) },
        endAt: { gte: new Date(`${dateStr}T00:00:00-03:00`) },
      },
    }),
    prisma.appointment.findMany({
      where: {
        doctorProfileId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lte: new Date(`${dateStr}T23:59:59-03:00`) },
        endAt: { gte: new Date(`${dateStr}T00:00:00-03:00`) },
      },
    }),
  ])

  if (!profile || availabilities.length === 0) return []

  return getAvailableSlotsForDate(
    availabilities,
    existingAppts,
    blockedSlots,
    profile.consultationDurationMinutes,
    dateStr
  )
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
