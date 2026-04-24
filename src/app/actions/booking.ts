"use server"

import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { revalidatePath } from "next/cache"

export type SlotTime = { startAt: string; endAt: string; label: string }

const DAY_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

export async function getAvailableSlots(doctorProfileId: string, dateStr: string): Promise<SlotTime[]> {
  // dateStr = "YYYY-MM-DD" treated as Brazil time (UTC-3)
  const date = new Date(dateStr + "T00:00:00-03:00")
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
  notes?: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth()
  if (!session) return { error: "Faça login para agendar" }
  if (session.user.role !== "PATIENT") return { error: "Apenas pacientes podem agendar consultas" }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!patientProfile) return { error: "Perfil de paciente não encontrado" }

  const slotStart = new Date(startAt)
  const slotEnd = new Date(endAt)

  // Guard against double-booking
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorProfileId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: slotEnd },
      endAt: { gt: slotStart },
    },
  })
  if (conflict) return { error: "Este horário não está mais disponível. Escolha outro." }

  await prisma.appointment.create({
    data: {
      doctorProfileId,
      patientProfileId: patientProfile.id,
      startAt: slotStart,
      endAt: slotEnd,
      status: "PENDING",
      notes: notes?.trim() || null,
    },
  })

  revalidatePath("/dashboard/patient/consultas")
  revalidatePath("/dashboard/doctor/agendamentos")

  return { success: true }
}