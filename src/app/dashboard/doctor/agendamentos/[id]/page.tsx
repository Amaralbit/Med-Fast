import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Mail, Phone } from "lucide-react"
import { ConsultationNoteForm } from "./consultation-note-form"
import { DocumentSection } from "./document-section"
import { createActionToken } from "@/lib/security/form-protection"

const STATUS_CONFIG = {
  PENDING:   { label: "Pendente",        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  CONFIRMED: { label: "Confirmado",      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-cyan-400" },
  COMPLETED: { label: "Concluído",       className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Cancelado",       className: "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-500" },
  NO_SHOW:   { label: "Não compareceu",  className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
}

const tz = "America/Sao_Paulo"
const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: tz })
const fmtTime = (d: Date) =>
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: tz })

type Props = { params: Promise<{ id: string }> }

export default async function AppointmentDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect("/dashboard/doctor")

  const appt = await prisma.appointment.findFirst({
    where: { id, doctorProfileId: profile.id },
    include: {
      patientProfile: { include: { user: { select: { name: true, email: true, phone: true } } } },
      consultationNote: true,
      documents: { orderBy: { createdAt: "desc" } },
    },
  })
  if (!appt) redirect("/dashboard/doctor/agendamentos")

  const history = await prisma.appointment.findMany({
    where: {
      doctorProfileId: profile.id,
      patientProfileId: appt.patientProfileId,
      status: "COMPLETED",
      NOT: { id },
    },
    include: { consultationNote: true },
    orderBy: { startAt: "desc" },
    take: 5,
  })

  const patient = appt.patientProfile.user
  const status = appt.status as keyof typeof STATUS_CONFIG
  const cfg = STATUS_CONFIG[status]
  const start = new Date(appt.startAt)
  const end = new Date(appt.endAt)
  const noteActionToken = await createActionToken("medical:save-note", session.user.id)
  const uploadActionToken = await createActionToken("medical:upload-document", session.user.id)
  const documents = await Promise.all(
    appt.documents.map(async (doc) => ({
      ...doc,
      deleteActionToken: await createActionToken("medical:delete-document", session.user.id),
    }))
  )

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <Link
        href="/dashboard/doctor/agendamentos"
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para agendamentos
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{patient.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Mail size={11} />{patient.email}</span>
              {patient.phone && <span className="flex items-center gap-1"><Phone size={11} />{patient.phone}</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <Clock size={14} />
              <span className="capitalize">{fmtDate(start)} · {fmtTime(start)} – {fmtTime(end)}</span>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.className}`}>
            {cfg.label}
          </span>
        </div>
        {appt.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">&ldquo;{appt.notes}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Patient history */}
      {history.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Histórico — {history.length} consulta{history.length > 1 ? "s" : ""} anterior{history.length > 1 ? "es" : ""}
          </h2>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 capitalize">
                  {fmtDate(new Date(h.startAt))}
                </p>
                {h.consultationNote ? (
                  <div className="space-y-1.5">
                    {h.consultationNote.complaint && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Queixa: </span>
                        {h.consultationNote.complaint}
                      </p>
                    )}
                    {h.consultationNote.diagnosis && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Diagnóstico: </span>
                        {h.consultationNote.diagnosis}
                      </p>
                    )}
                    {h.consultationNote.prescription && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Prescrição: </span>
                        {h.consultationNote.prescription}
                      </p>
                    )}
                    {h.consultationNote.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Obs.: </span>
                        {h.consultationNote.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-600">Sem prontuário registrado</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consultation notes */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Prontuário desta consulta</h2>
        <ConsultationNoteForm appointmentId={appt.id} note={appt.consultationNote} actionToken={noteActionToken} />
      </div>

      {/* Documents */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Documentos</h2>
        <DocumentSection appointmentId={appt.id} documents={documents} uploadActionToken={uploadActionToken} />
      </div>
    </div>
  )
}
