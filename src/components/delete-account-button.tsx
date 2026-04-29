"use client"

import { useState, useTransition } from "react"
import { Trash2, X, AlertTriangle } from "lucide-react"
import { deleteAccount } from "@/app/actions/account"

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setConfirmed(false)
    setError(null)
    setOpen(true)
  }

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount()
      if (result?.error) setError(result.error)
    })
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <Trash2 size={15} />
        Excluir minha conta
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isPending && setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-zinc-800 p-6">
            <button
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Excluir conta</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 mb-5 text-sm text-red-700 dark:text-red-400 space-y-1.5">
              <p className="font-medium">Ao excluir sua conta, você perderá permanentemente:</p>
              <ul className="space-y-1 pl-1">
                <li className="flex gap-2"><span className="shrink-0">•</span>Todos os seus dados de perfil</li>
                <li className="flex gap-2"><span className="shrink-0">•</span>Todo o histórico de agendamentos</li>
                <li className="flex gap-2"><span className="shrink-0">•</span>Todos os documentos médicos associados</li>
                <li className="flex gap-2"><span className="shrink-0">•</span>Acesso à plataforma</li>
              </ul>
            </div>

            <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-zinc-600 accent-red-500 cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Entendo que esta ação é <strong>permanente e irreversível</strong> e desejo excluir minha conta.
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!confirmed || isPending}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? "Excluindo..." : "Excluir permanentemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}