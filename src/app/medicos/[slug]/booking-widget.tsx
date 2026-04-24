"use client"

import { useState, useTransition } from "react"
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react"
import { getAvailableSlots, bookAppointment } from "@/app/actions/booking"
import type { SlotTime } from "@/app/actions/booking"

type DayOfWeek = "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY"

type Props = {
  doctorProfileId: string
  doctorName: string
  colorPrimary: string
  availableDays: DayOfWeek[]
  isLoggedIn: boolean
  isPatient: boolean
}

const DOW_INDEX: Record<DayOfWeek, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function BookingWidget({ doctorProfileId, doctorName, colorPrimary, availableDays, isLoggedIn, isPatient }: Props) {
  const [step, setStep] = useState<"date" | "time" | "confirm" | "done">("date")
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<SlotTime[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotTime | null>(null)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() + weekOffset * 7)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const availableDayIndices = new Set(availableDays.map((d) => DOW_INDEX[d]))

  function handleSelectDate(date: Date) {
    const dateStr = toDateStr(date)
    setSelectedDate(dateStr)
    setStep("time")
    setSlots([])
    setSelectedSlot(null)
    setError(null)
    startTransition(async () => {
      const result = await getAvailableSlots(doctorProfileId, dateStr)
      setSlots(result)
    })
  }

  function handleSelectSlot(slot: SlotTime) {
    setSelectedSlot(slot)
    setStep("confirm")
    setError(null)
  }

  function handleBook() {
    if (!selectedSlot) return
    setError(null)
    startTransition(async () => {
      const result = await bookAppointment(doctorProfileId, selectedSlot.startAt, selectedSlot.endAt, notes || undefined)
      if (result.error) {
        setError(result.error)
      } else {
        setStep("done")
      }
    })
  }

  if (!isLoggedIn || !isPatient) {
    return (
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} style={{ color: colorPrimary }} />
          <h2 className="font-semibold text-gray-900 dark:text-white">Agendar Consulta</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isLoggedIn
            ? "Apenas pacientes podem agendar consultas online."
            : "Faça login como paciente para agendar uma consulta."}
        </p>
        {!isLoggedIn && (
          <a
            href={`/login?next=/medicos/${encodeURIComponent(doctorName)}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colorPrimary }}
          >
            Fazer login para agendar
          </a>
        )}
      </section>
    )
  }

  if (step === "done") {
    return (
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <div className="flex flex-col items-center py-6 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${colorPrimary}22` }}
          >
            <Check size={28} style={{ color: colorPrimary }} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Consulta agendada!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Aguarde a confirmação de {doctorName}. Acompanhe em <strong>Minhas Consultas</strong>.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <a
              href="/dashboard/patient/consultas"
              className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colorPrimary }}
            >
              Ver minhas consultas
            </a>
            <button
              onClick={() => { setStep("date"); setSelectedDate(null); setSelectedSlot(null); setNotes("") }}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              Agendar outro horário
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} style={{ color: colorPrimary }} />
        <h2 className="font-semibold text-gray-900 dark:text-white">Agendar Consulta</h2>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-xs mb-5">
        {(["date", "time", "confirm"] as const).map((s, i) => {
          const labels = ["1. Data", "2. Horário", "3. Confirmar"]
          const isActive = step === s
          const isDone = (step === "time" && i === 0) || (step === "confirm" && i <= 1)
          return (
            <span key={s} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300 dark:text-zinc-700">›</span>}
              <span
                className={isActive || isDone ? "font-semibold" : "text-gray-400 dark:text-zinc-600"}
                style={isActive || isDone ? { color: colorPrimary } : {}}
              >
                {labels[i]}
              </span>
            </span>
          )
        })}
      </div>

      {/* Step 1: Date picker */}
      {step === "date" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
              disabled={weekOffset === 0}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {days[0].getDate()} {MONTH_NAMES[days[0].getMonth()]} – {days[6].getDate()} {MONTH_NAMES[days[6].getMonth()]}
            </span>
            <button
              onClick={() => setWeekOffset((o) => Math.min(3, o + 1))}
              disabled={weekOffset === 3}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date) => {
              const isPast = date < today
              const hasAvailability = availableDayIndices.has(date.getDay())
              const isDisabled = isPast || !hasAvailability
              const dateStr = toDateStr(date)
              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={dateStr}
                  onClick={() => !isDisabled && handleSelectDate(date)}
                  disabled={isDisabled}
                  className={`flex flex-col items-center py-2.5 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? "text-white"
                      : isDisabled
                      ? "text-gray-300 dark:text-zinc-700 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                  style={isSelected ? { backgroundColor: colorPrimary } : {}}
                >
                  <span className="font-medium">{DAY_NAMES[date.getDay()]}</span>
                  <span className="text-base font-bold mt-0.5">{date.getDate()}</span>
                </button>
              )
            })}
          </div>

          {availableDays.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-zinc-600 mt-4">
              Este médico ainda não configurou sua disponibilidade.
            </p>
          )}
        </div>
      )}

      {/* Step 2: Time slots */}
      {step === "time" && (
        <div>
          <button
            onClick={() => setStep("date")}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors"
          >
            <ChevronLeft size={14} /> Voltar
          </button>

          {isPending ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : slots.length === 0 ? (
            <div className="py-8 text-center">
              <Clock size={24} className="mx-auto text-gray-300 dark:text-zinc-700 mb-2" />
              <p className="text-sm text-gray-400 dark:text-zinc-600">
                Nenhum horário disponível para este dia.
              </p>
              <button
                onClick={() => setStep("date")}
                className="mt-3 text-xs underline text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Escolher outra data
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                <Clock size={12} />
                Selecione um horário disponível
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.startAt}
                    onClick={() => handleSelectSlot(slot)}
                    className="py-2 px-3 rounded-lg border text-sm font-medium transition-colors hover:text-white"
                    style={{
                      borderColor: `${colorPrimary}66`,
                      color: colorPrimary,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = colorPrimary }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent" }}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && selectedSlot && (
        <div>
          <button
            onClick={() => setStep("time")}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors"
          >
            <ChevronLeft size={14} /> Voltar
          </button>

          <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: `${colorPrimary}12` }}>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{doctorName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date(selectedSlot.startAt).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                timeZone: "America/Sao_Paulo",
              })}
              {" às "}
              {new Date(selectedSlot.startAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo",
              })}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Ex: Primeira consulta, tenho alergia a..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <button
            onClick={handleBook}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: colorPrimary }}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isPending ? "Agendando..." : "Confirmar agendamento"}
          </button>
        </div>
      )}
    </section>
  )
}