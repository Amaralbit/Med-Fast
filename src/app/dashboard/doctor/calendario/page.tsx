import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

const HOURS_START = 7
const HOURS_END = 21
const SLOT_MINUTES = 30

const DOW_MAP: Record<number, string> = {
  0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY",
  4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-cyan-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  NO_SHOW:   "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
}

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

type Props = { searchParams: Promise<{ week?: string }> }

export default async function CalendarioPage({ searchParams }: Props) {
  const session = await auth()
  if (!session) redirect("/login")

  const { week: weekParam } = await searchParams

  const today = new Date()
  const referenceDate = weekParam
    ? new Date(weekParam + "T12:00:00")
    : today
  const monday = getMondayOf(referenceDate)
  const weekEnd = addDays(monday, 7)

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      availabilities: true,
      appointments: {
        where: {
          startAt: { gte: monday, lt: weekEnd },
          status: { notIn: ["CANCELLED"] },
        },
        include: {
          patientProfile: { include: { user: { select: { name: true } } } },
        },
        orderBy: { startAt: "asc" },
      },
    },
  })
  if (!profile) redirect("/dashboard/doctor")

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  const totalSlots = ((HOURS_END - HOURS_START) * 60) / SLOT_MINUTES
  const timeSlots = Array.from({ length: totalSlots }, (_, i) => {
    const totalMinutes = HOURS_START * 60 + i * SLOT_MINUTES
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return { h, m, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` }
  })

  // Build grid: dayKey → slotLabel → appointment info
  type CellInfo = { name: string; status: string; isFirst: boolean }
  const grid: Record<string, Record<string, CellInfo>> = {}

  for (const appt of profile.appointments) {
    const start = new Date(appt.startAt)
    const end = new Date(appt.endAt)
    const dayKey = toDateKey(start)
    if (!grid[dayKey]) grid[dayKey] = {}

    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const firstSlotIndex = Math.floor((startMinutes - HOURS_START * 60) / SLOT_MINUTES)
    const lastSlotIndex = Math.ceil((endMinutes - HOURS_START * 60) / SLOT_MINUTES)

    for (let s = firstSlotIndex; s < lastSlotIndex; s++) {
      if (s < 0 || s >= totalSlots) continue
      const slotH = HOURS_START + Math.floor((s * SLOT_MINUTES) / 60)
      const slotM = (s * SLOT_MINUTES) % 60
      const slotKey = `${String(slotH).padStart(2, "0")}:${String(slotM).padStart(2, "0")}`
      grid[dayKey][slotKey] = {
        name: appt.patientProfile.user.name ?? "Paciente",
        status: appt.status,
        isFirst: s === firstSlotIndex,
      }
    }
  }

  function isWithinAvailability(day: Date, h: number, m: number): boolean {
    const dowEnum = DOW_MAP[day.getDay()]
    return profile!.availabilities.some((av) => {
      if (av.dayOfWeek !== dowEnum) return false
      const [ah, am] = av.startTime.split(":").map(Number)
      const [eh, em] = av.endTime.split(":").map(Number)
      const slotMin = h * 60 + m
      return slotMin >= ah * 60 + am && slotMin + SLOT_MINUTES <= eh * 60 + em
    })
  }

  const prevMonday = addDays(monday, -7)
  const nextMonday = addDays(monday, 7)
  const todayKey = toDateKey(today)

  const weekLabel =
    monday.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }) +
    " – " +
    addDays(monday, 6).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendário</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visão semanal da sua agenda</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`?week=${toDateKey(prevMonday)}`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-64 text-center">
            {weekLabel}
          </span>
          <Link
            href={`?week=${toDateKey(nextMonday)}`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <Link
            href={`?week=${toDateKey(getMondayOf(today))}`}
            className="ml-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Hoje
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto">
        <div style={{ minWidth: 560 }}>
          {/* Day headers */}
          <div className="grid border-b border-gray-200 dark:border-zinc-800" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
            <div className="border-r border-gray-200 dark:border-zinc-800 h-14" />
            {weekDays.map((day) => {
              const isToday = toDateKey(day) === todayKey
              return (
                <div
                  key={day.toISOString()}
                  className={`h-14 border-r border-gray-200 dark:border-zinc-800 last:border-r-0 flex flex-col items-center justify-center gap-0.5 ${
                    isToday ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    {day.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                  </span>
                  <span
                    className={`text-base font-bold leading-none ${
                      isToday
                        ? "w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white text-sm"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Time rows */}
          {timeSlots.map(({ h, m, label }) => (
            <div
              key={label}
              className="grid border-b border-gray-100 dark:border-zinc-800/40 last:border-b-0"
              style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
            >
              {/* Hour label — only on :00 */}
              <div className="border-r border-gray-200 dark:border-zinc-800 flex items-start justify-end pr-2 pt-0.5 h-8">
                {m === 0 && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-600 tabular-nums">{label}</span>
                )}
              </div>

              {weekDays.map((day) => {
                const dayKey = toDateKey(day)
                const cell = grid[dayKey]?.[label]
                const available = isWithinAvailability(day, h, m)

                return (
                  <div
                    key={dayKey}
                    className={`h-8 border-r border-gray-100 dark:border-zinc-800/40 last:border-r-0 overflow-hidden ${
                      cell
                        ? (STATUS_COLORS[cell.status] ?? "bg-blue-100 text-blue-800")
                        : available
                        ? "bg-emerald-50 dark:bg-emerald-950/10"
                        : ""
                    } ${m === 0 ? "border-t border-gray-100 dark:border-zinc-800/60" : ""}`}
                  >
                    {cell?.isFirst && (
                      <p className="text-[10px] font-semibold leading-none truncate px-1.5 pt-1">
                        {cell.name.split(" ")[0]}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Legenda:</span>
        {[
          { cls: "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/40", label: "Disponível" },
          { cls: "bg-yellow-100 border border-yellow-200 dark:bg-yellow-900/50 dark:border-yellow-800/40", label: "Pendente" },
          { cls: "bg-blue-100 border border-blue-200 dark:bg-blue-900/50 dark:border-blue-800/40", label: "Confirmado" },
          { cls: "bg-green-100 border border-green-200 dark:bg-green-900/50 dark:border-green-800/40", label: "Concluído" },
          { cls: "bg-red-100 border border-red-200 dark:bg-red-900/50 dark:border-red-800/40", label: "Não compareceu" },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${cls}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}