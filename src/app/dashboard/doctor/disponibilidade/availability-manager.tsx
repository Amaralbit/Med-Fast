"use client"

import { useActionState } from "react"
import { addAvailability, removeAvailability } from "@/app/actions/doctor"
import type { WeeklyAvailabilityModel as WeeklyAvailability } from "@/generated/prisma/models/WeeklyAvailability"
import { Trash2 } from "lucide-react"

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
}

const DAY_ORDER = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]

type Props = {
  availabilities: WeeklyAvailability[]
  consultationDuration: number
}

export function AvailabilityManager({ availabilities, consultationDuration }: Props) {
  const [state, action, pending] = useActionState(addAvailability, {})

  const sorted = [...availabilities].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  )

  return (
    <div className="space-y-6">
      {/* Horários cadastrados */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Horários cadastrados</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Duração por consulta: <strong>{consultationDuration} min</strong>
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-600">
            Nenhum horário cadastrado ainda
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {sorted.map((av) => (
              <li key={av.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {DAY_LABELS[av.dayOfWeek]}
                  </span>
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {av.startTime} – {av.endTime}
                  </span>
                </div>
                <form
                  action={async () => {
                    await removeAvailability(av.id)
                  }}
                >
                  <button
                    type="submit"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Adicionar horário */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Adicionar horário</h2>

        <form action={action} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dia</label>
            <select name="dayOfWeek" className="input">
              {DAY_ORDER.map((d) => (
                <option key={d} value={d}>{DAY_LABELS[d]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início</label>
            <input type="time" name="startTime" defaultValue="08:00" className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fim</label>
            <input type="time" name="endTime" defaultValue="17:00" className="input" />
          </div>

          {state?.error && (
            <p className="col-span-full text-sm text-red-500">{state.error}</p>
          )}

          <div className="col-span-full">
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2.5 rounded-lg bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {pending ? "Adicionando..." : "Adicionar horário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
