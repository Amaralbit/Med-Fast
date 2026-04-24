"use client"

import { useActionState } from "react"
import { addBlockedSlot, removeBlockedSlot } from "@/app/actions/doctor"
import type { ProfileState } from "@/app/actions/doctor"
import { Trash2, Plus, BanIcon } from "lucide-react"

type BlockedSlot = {
  id: string
  startAt: Date
  endAt: Date
  reason: string | null
}

type Props = { blockedSlots: BlockedSlot[] }

const tz = "America/Sao_Paulo"

function fmtDateTime(date: Date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: tz,
  })
}

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz })
}

const initial: ProfileState = {}

export function BlockedSlotManager({ blockedSlots }: Props) {
  const [state, formAction, pending] = useActionState(addBlockedSlot, initial)

  const upcoming = blockedSlots
    .filter((s) => s.endAt > new Date())
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

  return (
    <div className="space-y-6">
      {/* Lista de bloqueios */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800">
        {upcoming.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <BanIcon size={28} className="mx-auto text-gray-300 dark:text-zinc-700 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-600">Nenhum bloqueio ativo</p>
          </div>
        ) : (
          upcoming.map((slot) => (
            <div key={slot.id} className="flex items-start gap-4 p-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center shrink-0 mt-0.5">
                <BanIcon size={14} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {fmtDateTime(slot.startAt)} → {fmtDateTime(slot.endAt)}
                </p>
                {slot.reason && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{slot.reason}</p>
                )}
              </div>
              <form action={async () => { await removeBlockedSlot(slot.id) }}>
                <button
                  type="submit"
                  title="Remover bloqueio"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      {/* Formulário */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus size={15} />
          Novo bloqueio
        </h2>

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Data início
              </label>
              <input
                type="date"
                name="startDate"
                min={todayStr()}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Hora início
              </label>
              <input
                type="time"
                name="startTime"
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Data fim
              </label>
              <input
                type="date"
                name="endDate"
                min={todayStr()}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Hora fim
              </label>
              <input
                type="time"
                name="endTime"
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Motivo (opcional)
            </label>
            <input
              type="text"
              name="reason"
              placeholder="Ex: Férias, Congresso médico..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
          {state?.success && (
            <p className="text-xs text-green-600 dark:text-green-400">Bloqueio adicionado!</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            <BanIcon size={14} />
            {pending ? "Salvando..." : "Bloquear período"}
          </button>
        </form>
      </div>
    </div>
  )
}