import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { confirmAppointment, cancelAppointment, completeAppointment } from "@/app/actions/doctor"
import { Check, X, CheckCheck, Clock, CalendarX, ArrowRight } from "lucide-react"
import { createActionToken } from "@/lib/security/form-protection"
import { ActionTokenInput } from "@/components/action-token-input"

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Pendente",   className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  CONFIRMED: { label: "Confirmado", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-cyan-400" },
  COMPLETED: { label: "Concluído",  className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Cancelado",  className: "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-500" },
  NO_SHOW:   { label: "Não compareceu", className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
}

const TABS: { key: string; label: string; statuses: AppointmentStatus[] }[] = [
  { key: "upcoming",  label: "Próximas",   statuses: ["PENDING", "CONFIRMED"] },
  { key: "past",      label: "Histórico",  statuses: ["COMPLETED", "CANCELLED", "NO_SHOW"] },
]

type Props = { searchParams: Promise<{ tab?: string }> }

export default async function AgendamentosPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect("/login")

  const { tab = "upcoming" } = await searchParams
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0]

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) redirect("/dashboard/doctor")

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorProfileId: profile.id,
      status: { in: activeTab.statuses },
    },
    include: {
      patientProfile: { include: { user: { select: { name: true, email: true, phone: true } } } },
    },
    orderBy: { startAt: activeTab.key === "upcoming" ? "asc" : "desc" },
  })
  const appointmentsWithTokens = await Promise.all(
    appointments.map(async (appt) => ({
      ...appt,
      confirmActionToken: await createActionToken("doctor:confirm-appointment", session.user.id),
      cancelActionToken: await createActionToken("doctor:cancel-appointment", session.user.id),
      completeActionToken: await createActionToken("doctor:complete-appointment", session.user.id),
    }))
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agendamentos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gerencie as consultas agendadas pelos seus pacientes
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl w-fit mb-6">
        {TABS.map((t) => (
          <a
            key={t.key}
            href={`?tab=${t.key}`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              t.key === tab
                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* List */}
      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 py-16 text-center">
          <CalendarX size={32} className="mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-600">
            {tab === "upcoming" ? "Nenhum agendamento pendente ou confirmado" : "Nenhum histórico ainda"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointmentsWithTokens.map((appt) => {
            const status = appt.status as AppointmentStatus
            const cfg = STATUS_CONFIG[status]
            const patient = appt.patientProfile.user
            const start = new Date(appt.startAt)
            const end = new Date(appt.endAt)
            const tz = "America/Sao_Paulo"

            const startDay = start.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: tz })
            const startMonth = start.toLocaleDateString("pt-BR", { month: "short", timeZone: tz })
            const timeLabel = `${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: tz })} – ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: tz })}`

            return (
              <div
                key={appt.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: date + patient */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="shrink-0 w-14 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                        {startDay}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                        {startMonth}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{patient.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{patient.email}</p>
                      {patient.phone && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{patient.phone}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{timeLabel}</span>
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 italic">
                          &ldquo;{appt.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}>
                      {cfg.label}
                    </span>
                    <Link
                      href={`/dashboard/doctor/agendamentos/${appt.id}`}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors"
                    >
                      Detalhes <ArrowRight size={11} />
                    </Link>

                    {status === "PENDING" && (
                      <div className="flex gap-1.5">
                        <form action={confirmAppointment}>
                          <input type="hidden" name="appointmentId" value={appt.id} />
                          <ActionTokenInput token={appt.confirmActionToken} />
                          <button
                            type="submit"
                            title="Confirmar"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                        </form>
                        <form action={cancelAppointment}>
                          <input type="hidden" name="appointmentId" value={appt.id} />
                          <ActionTokenInput token={appt.cancelActionToken} />
                          <button
                            type="submit"
                            title="Cancelar"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </form>
                      </div>
                    )}

                    {status === "CONFIRMED" && (
                      <div className="flex gap-1.5">
                        <form action={completeAppointment}>
                          <input type="hidden" name="appointmentId" value={appt.id} />
                          <ActionTokenInput token={appt.completeActionToken} />
                          <button
                            type="submit"
                            title="Marcar como concluída"
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          >
                            <CheckCheck size={16} />
                          </button>
                        </form>
                        <form action={cancelAppointment}>
                          <input type="hidden" name="appointmentId" value={appt.id} />
                          <ActionTokenInput token={appt.cancelActionToken} />
                          <button
                            type="submit"
                            title="Cancelar"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
