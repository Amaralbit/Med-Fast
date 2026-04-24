"use server"

import { prisma } from "@/server/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import { sendDocumentUploadedToPatient } from "@/lib/email"

export type MedicalState = { error?: string; success?: boolean }

// ─── Prontuário ───────────────────────────────────────────────────────────────

export async function saveConsultationNote(_: MedicalState, formData: FormData): Promise<MedicalState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  const appointmentId = formData.get("appointmentId")?.toString()
  if (!appointmentId) return { error: "Consulta não informada" }

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: "Perfil não encontrado" }

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorProfileId: profile.id },
  })
  if (!appt) return { error: "Consulta não encontrada" }

  const complaint = formData.get("complaint")?.toString().trim() || null
  const diagnosis = formData.get("diagnosis")?.toString().trim() || null
  const prescription = formData.get("prescription")?.toString().trim() || null
  const notes = formData.get("notes")?.toString().trim() || null

  await prisma.consultationNote.upsert({
    where: { appointmentId },
    create: { appointmentId, doctorProfileId: profile.id, patientProfileId: appt.patientProfileId, complaint, diagnosis, prescription, notes },
    update: { complaint, diagnosis, prescription, notes },
  })

  revalidatePath(`/dashboard/doctor/agendamentos/${appointmentId}`)
  return { success: true }
}

// ─── Documentos ───────────────────────────────────────────────────────────────

export async function uploadMedicalDocument(_: MedicalState, formData: FormData): Promise<MedicalState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  const appointmentId = formData.get("appointmentId")?.toString()
  const title = formData.get("title")?.toString().trim()
  const type = formData.get("type")?.toString()
  const file = formData.get("file") as File | null

  if (!appointmentId || !title || !type || !file || file.size === 0)
    return { error: "Preencha todos os campos" }
  if (file.type !== "application/pdf")
    return { error: "Apenas arquivos PDF são aceitos" }
  if (file.size > 10 * 1024 * 1024)
    return { error: "Arquivo muito grande (máx. 10 MB)" }
  if (!["PRESCRIPTION", "CERTIFICATE", "OTHER"].includes(type))
    return { error: "Tipo de documento inválido" }

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  })
  if (!profile) return { error: "Perfil não encontrado" }

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorProfileId: profile.id },
    include: { patientProfile: { include: { user: { select: { name: true, email: true } } } } },
  })
  if (!appt) return { error: "Consulta não encontrada" }

  const blob = await put(
    `medfast/${profile.id}/${appointmentId}/${Date.now()}-${file.name}`,
    file,
    { access: "public" },
  )

  await prisma.medicalDocument.create({
    data: {
      appointmentId,
      doctorProfileId: profile.id,
      patientProfileId: appt.patientProfileId,
      type: type as "PRESCRIPTION" | "CERTIFICATE" | "OTHER",
      title,
      fileUrl: blob.url,
    },
  })

  revalidatePath(`/dashboard/doctor/agendamentos/${appointmentId}`)
  revalidatePath("/dashboard/patient/consultas")

  sendDocumentUploadedToPatient({
    patientEmail: appt.patientProfile.user.email,
    patientName: appt.patientProfile.user.name,
    doctorName: profile.user.name,
    documentTitle: title,
    documentType: type,
    fileUrl: blob.url,
  }).catch(() => {})

  return { success: true }
}

export async function deleteMedicalDocument(documentId: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return

  const doc = await prisma.medicalDocument.findFirst({
    where: { id: documentId, doctorProfileId: profile.id },
  })
  if (!doc) return

  try { await del(doc.fileUrl) } catch { /* blob may already be gone */ }
  await prisma.medicalDocument.delete({ where: { id: documentId } })
  revalidatePath(`/dashboard/doctor/agendamentos/${doc.appointmentId}`)
  revalidatePath("/dashboard/patient/consultas")
}