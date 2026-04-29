import { Resend } from "resend"
import { escapeHtml, safeExternalUrl } from "@/lib/security/sanitize"

const FROM = process.env.EMAIL_FROM ?? "MedFast <onboarding@resend.dev>"
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  return new Resend(apiKey)
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#3B82F6,#06B6D4);padding:24px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">MedFast</span>
          </td>
        </tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr>
          <td style="background:#f4f4f5;padding:20px 32px;text-align:center;">
            <span style="color:#9ca3af;font-size:12px;">MedFast - Secretaria virtual para consultorios</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">${escapeHtml(value)}</td>
  </tr>`
}

function ctaButton(text: string, href: string) {
  const safeHref = safeExternalUrl(href)
  if (!safeHref) return ""
  return `<a href="${escapeHtml(safeHref)}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#3B82F6;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${escapeHtml(text)}</a>`
}

export async function sendNewAppointmentToDoctor(params: {
  doctorEmail: string
  doctorName: string
  patientName: string
  patientEmail: string
  startAt: Date
  endAt: Date
  notes?: string | null
}) {
  const { doctorEmail, patientName, patientEmail, startAt, endAt, notes } = params

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Nova consulta agendada</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Um paciente agendou uma consulta pelo chatbot.</p>
    <table cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:16px 20px;width:100%;border:1px solid #e5e7eb;">
      ${infoRow("Paciente", patientName)}
      ${infoRow("E-mail", patientEmail)}
      ${infoRow("Data", formatDate(startAt))}
      ${infoRow("Horario", `${formatTime(startAt)} - ${formatTime(endAt)}`)}
      ${notes ? infoRow("Motivo", notes) : ""}
    </table>
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">Acesse o painel para confirmar ou cancelar a consulta.</p>
    ${ctaButton("Ver agendamentos", `${BASE_URL}/dashboard/doctor/agendamentos`)}
  `

  await getResend().emails.send({
    from: FROM,
    to: doctorEmail,
    subject: `Nova consulta - ${patientName} em ${formatDate(startAt)}`,
    html: baseTemplate(content),
  })
}

export async function sendAppointmentConfirmedToPatient(params: {
  patientEmail: string
  patientName: string
  doctorName: string
  doctorSpecialty?: string | null
  doctorSlug: string
  startAt: Date
  endAt: Date
}) {
  const { patientEmail, patientName, doctorName, doctorSpecialty, startAt, endAt } = params

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Consulta confirmada!</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Ola, ${escapeHtml(patientName)}. Sua consulta foi confirmada.</p>
    <table cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;padding:16px 20px;width:100%;border:1px solid #bbf7d0;">
      ${infoRow("Medico", doctorName)}
      ${doctorSpecialty ? infoRow("Especialidade", doctorSpecialty) : ""}
      ${infoRow("Data", formatDate(startAt))}
      ${infoRow("Horario", `${formatTime(startAt)} - ${formatTime(endAt)}`)}
    </table>
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">Anote na agenda e chegue com 10 minutos de antecedencia.</p>
    ${ctaButton("Ver minhas consultas", `${BASE_URL}/dashboard/patient/consultas`)}
  `

  await getResend().emails.send({
    from: FROM,
    to: patientEmail,
    subject: `Consulta confirmada - ${formatDate(startAt)} com ${doctorName}`,
    html: baseTemplate(content),
  })
}

export async function sendAppointmentCancelledToPatient(params: {
  patientEmail: string
  patientName: string
  doctorName: string
  startAt: Date
}) {
  const { patientEmail, patientName, doctorName, startAt } = params

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Consulta cancelada</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Ola, ${escapeHtml(patientName)}. Infelizmente sua consulta foi cancelada.</p>
    <table cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;padding:16px 20px;width:100%;border:1px solid #fecaca;">
      ${infoRow("Medico", doctorName)}
      ${infoRow("Data cancelada", formatDate(startAt))}
    </table>
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">Voce pode agendar um novo horario diretamente com o medico.</p>
    ${ctaButton("Buscar medicos", `${BASE_URL}/dashboard/patient`)}
  `

  await getResend().emails.send({
    from: FROM,
    to: patientEmail,
    subject: `Consulta cancelada - ${formatDate(startAt)}`,
    html: baseTemplate(content),
  })
}

export async function sendDocumentUploadedToPatient(params: {
  patientEmail: string
  patientName: string
  doctorName: string
  documentTitle: string
  documentType: string
  fileUrl: string
}) {
  const { patientEmail, patientName, doctorName, documentTitle, documentType, fileUrl } = params
  const typeLabel = ({ PRESCRIPTION: "Receita", CERTIFICATE: "Atestado", OTHER: "Documento" } as Record<string, string>)[documentType] ?? "Documento"

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Novo documento disponivel</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Ola, ${escapeHtml(patientName)}. O Dr. ${escapeHtml(doctorName)} enviou um documento para voce.</p>
    <table cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-radius:8px;padding:16px 20px;width:100%;border:1px solid #bae6fd;">
      ${infoRow("Tipo", typeLabel)}
      ${infoRow("Titulo", documentTitle)}
      ${infoRow("Enviado por", `Dr. ${doctorName}`)}
    </table>
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">Voce tambem pode acessar o documento direto nas suas consultas.</p>
    ${ctaButton("Baixar documento", fileUrl)}
  `

  await getResend().emails.send({
    from: FROM,
    to: patientEmail,
    subject: `${typeLabel} disponivel - Dr. ${doctorName}`,
    html: baseTemplate(content),
  })
}

export async function sendAppointmentCancelledToDoctor(params: {
  doctorEmail: string
  doctorName: string
  patientName: string
  startAt: Date
}) {
  const { doctorEmail, patientName, startAt } = params

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Consulta cancelada pelo paciente</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Um paciente cancelou o agendamento.</p>
    <table cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;padding:16px 20px;width:100%;border:1px solid #fecaca;">
      ${infoRow("Paciente", patientName)}
      ${infoRow("Data cancelada", formatDate(startAt))}
    </table>
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">O horario voltou a ficar disponivel na agenda.</p>
    ${ctaButton("Ver agendamentos", `${BASE_URL}/dashboard/doctor/agendamentos`)}
  `

  await getResend().emails.send({
    from: FROM,
    to: doctorEmail,
    subject: `Consulta cancelada - ${patientName} em ${formatDate(startAt)}`,
    html: baseTemplate(content),
  })
}
