"use server"

import { z } from "zod"
import { prisma } from "@/server/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"

const profileSchema = z.object({
  specialty: z.string().min(2, "Informe a especialidade").max(100, "Especialidade muito longa"),
  crm: z.string().max(20, "CRM inválido").optional(),
  bio: z.string().max(2000, "Bio muito longa (máx. 2000 caracteres)").optional(),
  whatsapp: z.string().max(20, "WhatsApp inválido").optional(),
  consultationDurationMinutes: z.coerce.number().min(15).max(240),
  pricePrivate: z.coerce.number().min(0).max(99999).optional(),
  colorPrimary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  colorAccent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  addressStreet: z.string().max(200).optional(),
  addressCity: z.string().max(100).optional(),
  addressState: z.string().max(2).optional(),
  addressZip: z.string().max(10).optional(),
  isPublished: z.coerce.boolean().optional(),
})

export type ProfileState = { error?: string; success?: boolean }

export async function saveProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  const raw = Object.fromEntries(formData.entries())
  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { pricePrivate, ...rest } = parsed.data

  await prisma.doctorProfile.update({
    where: { userId: session.user.id },
    data: {
      ...rest,
      pricePrivate: pricePrivate ?? null,
    },
  })

  revalidatePath("/dashboard/doctor/perfil")
  revalidatePath("/dashboard/doctor")
  return { success: true }
}

// ─── Disponibilidade ───────────────────────────────────────────────────────

const availabilitySchema = z.object({
  dayOfWeek: z.enum(["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export async function addAvailability(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  const parsed = availabilitySchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: "Perfil não encontrado" }

  await prisma.weeklyAvailability.create({
    data: { doctorProfileId: profile.id, ...parsed.data },
  })

  revalidatePath("/dashboard/doctor/disponibilidade")
  return { success: true }
}

export async function removeAvailability(id: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return

  await prisma.weeklyAvailability.deleteMany({
    where: { id, doctorProfileId: profile.id },
  })

  revalidatePath("/dashboard/doctor/disponibilidade")
}

// ─── Convênios ────────────────────────────────────────────────────────────────

export async function addHealthPlan(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  const name = formData.get("name")?.toString().trim()
  if (!name || name.length < 2) return { error: "Informe o nome do convênio" }
  if (name.length > 100) return { error: "Nome do convênio muito longo (máx. 100 caracteres)" }

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: "Perfil não encontrado" }

  const plan = await prisma.healthPlan.upsert({
    where: { name },
    create: { name },
    update: {},
  })

  const existing = await prisma.doctorHealthPlan.findUnique({
    where: { doctorProfileId_healthPlanId: { doctorProfileId: profile.id, healthPlanId: plan.id } },
  })
  if (existing) return { error: "Convênio já cadastrado" }

  await prisma.doctorHealthPlan.create({
    data: { doctorProfileId: profile.id, healthPlanId: plan.id },
  })

  revalidatePath("/dashboard/doctor/convenios")
  return { success: true }
}

export async function removeHealthPlan(healthPlanId: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return

  await prisma.doctorHealthPlan.deleteMany({
    where: { doctorProfileId: profile.id, healthPlanId },
  })

  revalidatePath("/dashboard/doctor/convenios")
}

// ─── Agendamentos ─────────────────────────────────────────────────────────────

import {
  sendAppointmentConfirmedToPatient,
  sendAppointmentCancelledToPatient,
} from "@/lib/email"

async function getOwnProfile(userId: string) {
  return prisma.doctorProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  })
}

export async function confirmAppointment(appointmentId: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  const profile = await getOwnProfile(session.user.id)
  if (!profile) return

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorProfileId: profile.id, status: "PENDING" },
    include: { patientProfile: { include: { user: { select: { name: true, email: true } } } } },
  })
  if (!appt) return

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CONFIRMED" },
  })

  revalidatePath("/dashboard/doctor/agendamentos")

  sendAppointmentConfirmedToPatient({
    patientEmail: appt.patientProfile.user.email,
    patientName: appt.patientProfile.user.name,
    doctorName: profile.user.name,
    doctorSpecialty: profile.specialty,
    doctorSlug: profile.slug,
    startAt: appt.startAt,
    endAt: appt.endAt,
  }).catch(() => {})
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  const profile = await getOwnProfile(session.user.id)
  if (!profile) return

  const appt = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorProfileId: profile.id,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: { patientProfile: { include: { user: { select: { name: true, email: true } } } } },
  })
  if (!appt) return

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  })

  revalidatePath("/dashboard/doctor/agendamentos")

  sendAppointmentCancelledToPatient({
    patientEmail: appt.patientProfile.user.email,
    patientName: appt.patientProfile.user.name,
    doctorName: profile.user.name,
    startAt: appt.startAt,
  }).catch(() => {})
}

export async function completeAppointment(appointmentId: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  const profile = await getOwnProfile(session.user.id)
  if (!profile) return

  await prisma.appointment.updateMany({
    where: { id: appointmentId, doctorProfileId: profile.id, status: "CONFIRMED" },
    data: { status: "COMPLETED" },
  })

  revalidatePath("/dashboard/doctor/agendamentos")
}

// ─── Bloqueios manuais ────────────────────────────────────────────────────────

export async function addBlockedSlot(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  const startDate = formData.get("startDate")?.toString()
  const startTime = formData.get("startTime")?.toString()
  const endDate = formData.get("endDate")?.toString()
  const endTime = formData.get("endTime")?.toString()
  const reason = formData.get("reason")?.toString().trim().slice(0, 200) || null

  if (!startDate || !startTime || !endDate || !endTime)
    return { error: "Preencha data e horário de início e fim" }

  const startAt = new Date(`${startDate}T${startTime}:00-03:00`)
  const endAt = new Date(`${endDate}T${endTime}:00-03:00`)

  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()))
    return { error: "Data ou horário inválidos" }
  if (endAt <= startAt) return { error: "O fim deve ser depois do início" }

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: "Perfil não encontrado" }

  await prisma.blockedSlot.create({
    data: { doctorProfileId: profile.id, startAt, endAt, reason },
  })

  revalidatePath("/dashboard/doctor/disponibilidade")
  return { success: true }
}

export async function removeBlockedSlot(id: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return

  await prisma.blockedSlot.deleteMany({ where: { id, doctorProfileId: profile.id } })
  revalidatePath("/dashboard/doctor/disponibilidade")
}

// ─── Chat FAQ ─────────────────────────────────────────────────────────────────

export async function addChatQuestion(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  const question = formData.get("question")?.toString().trim()
  const answer = formData.get("answer")?.toString().trim()
  if (!question || question.length < 3) return { error: "Informe a pergunta" }
  if (question.length > 500) return { error: "Pergunta muito longa (máx. 500 caracteres)" }
  if (!answer || answer.length < 3) return { error: "Informe a resposta" }
  if (answer.length > 2000) return { error: "Resposta muito longa (máx. 2000 caracteres)" }

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: "Perfil não encontrado" }

  const lastQuestion = await prisma.chatQuestion.findFirst({
    where: { doctorProfileId: profile.id },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  await prisma.chatQuestion.create({
    data: {
      doctorProfileId: profile.id,
      question,
      answer,
      order: (lastQuestion?.order ?? -1) + 1,
    },
  })

  revalidatePath("/dashboard/doctor/chat-faq")
  return { success: true }
}

export async function removeChatQuestion(id: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return

  await prisma.chatQuestion.deleteMany({
    where: { id, doctorProfileId: profile.id },
  })

  revalidatePath("/dashboard/doctor/chat-faq")
}

// ─── Foto de perfil ───────────────────────────────────────────────────────────

export async function uploadProfilePhoto(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  const file = formData.get("photo") as File | null
  if (!file || file.size === 0) return { error: "Selecione uma foto" }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return { error: "Apenas JPEG, PNG ou WebP" }
  if (file.size > 5 * 1024 * 1024) return { error: "Foto muito grande (máx. 5 MB)" }

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: "Perfil não encontrado" }

  if (profile.profilePhotoUrl) {
    try { await del(profile.profilePhotoUrl) } catch { /* já removida */ }
  }

  // Derive extension from MIME type to prevent extension spoofing
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }
  const ext = mimeToExt[file.type] ?? "jpg"
  const blob = await put(`medfast/profiles/${profile.id}/photo-${Date.now()}.${ext}`, file, { access: "public" })

  await prisma.doctorProfile.update({
    where: { id: profile.id },
    data: { profilePhotoUrl: blob.url },
  })

  revalidatePath("/dashboard/doctor/perfil")
  revalidatePath(`/medicos/${profile.slug}`)
  revalidatePath("/dashboard/patient")
  return { success: true }
}