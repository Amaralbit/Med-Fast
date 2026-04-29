"use server"

import { prisma } from "@/server/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import { headers } from "next/headers"
import { sendDocumentUploadedToPatient } from "@/lib/email"
import { canUploadDocuments } from "@/lib/plan"
import { checkRateLimit } from "@/lib/rate-limit"
import { getActionTokenValue, verifyActionToken } from "@/lib/security/form-protection"
import { sanitizeMultilineText, sanitizePlainText } from "@/lib/security/sanitize"

export type MedicalState = { error?: string; success?: boolean }

const TEXT_MAX = 10_000
const TITLE_MAX = 200

function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, "_")
    .replace(/\.{2,}/g, "_")
    .replace(/^\./, "_")
    .slice(0, 100) || "arquivo"
}

async function getClientIp() {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1"
}

export async function saveConsultationNote(_: MedicalState, formData: FormData): Promise<MedicalState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  try {
    await verifyActionToken(getActionTokenValue(formData), "medical:save-note", session.user.id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha de segurança na requisição" }
  }

  const appointmentId = formData.get("appointmentId")?.toString()
  if (!appointmentId) return { error: "Consulta não informada" }

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return { error: "Perfil não encontrado" }

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorProfileId: profile.id },
  })
  if (!appt) return { error: "Consulta não encontrada" }

  const complaint = formData.get("complaint")?.toString()
  const diagnosis = formData.get("diagnosis")?.toString()
  const prescription = formData.get("prescription")?.toString()
  const notes = formData.get("notes")?.toString()

  await prisma.consultationNote.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      doctorProfileId: profile.id,
      patientProfileId: appt.patientProfileId,
      complaint: complaint ? sanitizeMultilineText(complaint, TEXT_MAX) || null : null,
      diagnosis: diagnosis ? sanitizeMultilineText(diagnosis, TEXT_MAX) || null : null,
      prescription: prescription ? sanitizeMultilineText(prescription, TEXT_MAX) || null : null,
      notes: notes ? sanitizeMultilineText(notes, TEXT_MAX) || null : null,
    },
    update: {
      complaint: complaint ? sanitizeMultilineText(complaint, TEXT_MAX) || null : null,
      diagnosis: diagnosis ? sanitizeMultilineText(diagnosis, TEXT_MAX) || null : null,
      prescription: prescription ? sanitizeMultilineText(prescription, TEXT_MAX) || null : null,
      notes: notes ? sanitizeMultilineText(notes, TEXT_MAX) || null : null,
    },
  })

  revalidatePath(`/dashboard/doctor/agendamentos/${appointmentId}`)
  return { success: true }
}

export async function uploadMedicalDocument(_: MedicalState, formData: FormData): Promise<MedicalState> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return { error: "Não autorizado" }

  try {
    await verifyActionToken(getActionTokenValue(formData), "medical:upload-document", session.user.id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha de segurança na requisição" }
  }

  const appointmentId = formData.get("appointmentId")?.toString()
  const rawTitle = formData.get("title")?.toString()
  const type = formData.get("type")?.toString()
  const file = formData.get("file") as File | null

  if (!appointmentId || !rawTitle || !type || !file || file.size === 0) {
    return { error: "Preencha todos os campos" }
  }

  const title = sanitizePlainText(rawTitle, TITLE_MAX)
  if (!title) return { error: "Título inválido" }

  if (file.type !== "application/pdf") return { error: "Apenas arquivos PDF são aceitos" }
  if (file.size > 10 * 1024 * 1024) return { error: "Arquivo muito grande (máx. 10 MB)" }
  if (!["PRESCRIPTION", "CERTIFICATE", "OTHER"].includes(type)) return { error: "Tipo de documento inválido" }

  const ip = await getClientIp()
  const rl = checkRateLimit(`medical-upload:${session.user.id}:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) return { error: "Muitos uploads em pouco tempo. Aguarde um pouco." }

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  })
  if (!profile) return { error: "Perfil não encontrado" }

  if (!canUploadDocuments(profile.plan)) {
    return { error: "Upload de documentos disponível nos planos Pro e Clínica. Faça upgrade em Plano e Cobrança." }
  }

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorProfileId: profile.id },
    include: { patientProfile: { include: { user: { select: { name: true, email: true } } } } },
  })
  if (!appt) return { error: "Consulta não encontrada" }

  const safeFilename = sanitizeFilename(file.name)
  const blob = await put(`medfast/${profile.id}/${appointmentId}/${Date.now()}-${safeFilename}`, file, {
    access: "public",
  })

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

export async function deleteMedicalDocument(documentId: string, actionToken: string): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") return

  await verifyActionToken(actionToken, "medical:delete-document", session.user.id)

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return

  const doc = await prisma.medicalDocument.findFirst({
    where: { id: documentId, doctorProfileId: profile.id },
  })
  if (!doc) return

  try {
    await del(doc.fileUrl)
  } catch {
    // ignore
  }
  await prisma.medicalDocument.delete({ where: { id: documentId } })
  revalidatePath(`/dashboard/doctor/agendamentos/${doc.appointmentId}`)
  revalidatePath("/dashboard/patient/consultas")
}
