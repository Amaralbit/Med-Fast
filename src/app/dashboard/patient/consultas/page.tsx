import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { cancelPatientAppointment } from "@/app/actions/patient"
import { Clock, CalendarX, ExternalLink, X } from "lucide-react"

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: "Aguardando confirmação", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  CONFIRMED: { label: "Confirmado",             className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-cyan-400" },
  COMPLETED: { label: "Concluído",              className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Cancelado",              className: "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-500" },
  NO_SHOW:   { label: "Não compareceu",         className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
}

const TABS = [
  { key: "upcoming", label: "Próximas",  statuses: ["PENDING", "CONFIRMED"] as AppointmentStatus[] },
  { key: "past",     label: "Histórico", statuses: ["COMPLETED", "CANCELLED", "NO_SHOW"] as AppointmentStatus[] },
]

type Props = { searchParams: Promise<{ tab?: string }> }

export default async function ConsultasPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect("/login")

  const { tab = "upcoming" } = await searchParams
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0]

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!patientProfile) redirect("/dashboard/patient")

  const appointments = await prisma.appointment.findMany({
    where: {
      patientProfileId: patientProfile.id,
      status: { in: activeTab.statuses },
    },
    include: {
      doctorProfile: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { startAt: activeTab.key === "upcoming" ? "asc" : "desc" },
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Minhas Consultas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Acompanhe o status dos seus agendamentos
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

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 py-16 text-center">
          <CalendarX size={32} className="mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-600 mb-4">
            {tab === "upcoming"
              ? "Você não tem consultas agendadas"
              : "Nenhum histórico ainda"}
          </p>
          {tab === "upcoming" && (
            <Link
              href="/dashboard/patient"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 dark:bg-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Buscar médicos
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const status = appt.status as AppointmentStatus
            const cfg = STATUS_CONFIG[status]
            const doctor = appt.doctorProfile
            const start = new Date(appt.startAt)
            const end = new Date(appt.endAt)
            const canCancel = status === "PENDING" || status === "CONFIRMED"

            return (
              <div
                key={appt.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: date + doctor */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Date block */}
                    <div className="shrink-0 w-14 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                        {start.getDate().toString().padStart(2, "0")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                        {start.toLocaleDateString("pt-BR", { month: "short" })}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">
                        {start.getFullYear()}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${doctor.colorPrimary}, ${doctor.colorAccent})`,
                          }}
                        >
                          {doctor.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {doctor.user.name}
                          </p>
                          {doctor.specialty && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock size={12} className="text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {" – "}
                          {end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {" · "}
                          {start.toLocaleDateString("pt-BR", { weekday: "long" })}
                        </span>
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 italic">
                          &ldquo;{appt.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.className}`}>
                      {cfg.label}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/medicos/${doctor.slug}`}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors"
                      >
                        <ExternalLink size={12} />
                        Ver perfil
                      </Link>

                      {canCancel && (
                        <form
                          action={async () => {
                            "use server"
                            await cancelPatientAppointment(appt.id)
                          }}
                        >
                          <button
                            type="submit"
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={12} />
                            Cancelar
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}