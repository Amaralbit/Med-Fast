"use client"

import { useActionState } from "react"
import { addHealthPlan, removeHealthPlan } from "@/app/actions/doctor"
import { Trash2, Plus } from "lucide-react"
import { ActionTokenInput } from "@/components/action-token-input"

type LinkedPlan = { id: string; name: string; removeActionToken: string }
type SuggestedPlan = { id: string; name: string; addActionToken: string }

type Props = {
  linkedPlans: LinkedPlan[]
  suggestedPlans: SuggestedPlan[]
  createActionToken: string
}

export function HealthPlanManager({ linkedPlans, suggestedPlans, createActionToken }: Props) {
  const [state, action, pending] = useActionState(addHealthPlan, {})

  return (
    <div className="space-y-6">
      {/* Planos cadastrados */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Convênios aceitos</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {linkedPlans.length === 0 ? "Nenhum convênio cadastrado" : `${linkedPlans.length} convênio${linkedPlans.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {linkedPlans.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-600">
            Adicione os planos de saúde que você aceita
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {linkedPlans.map((plan) => (
              <li key={plan.id} className="flex items-center justify-between px-6 py-3.5">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{plan.name}</span>
                <form action={removeHealthPlan}>
                  <input type="hidden" name="healthPlanId" value={plan.id} />
                  <ActionTokenInput token={plan.removeActionToken} />
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

      {/* Sugestões rápidas (planos já existentes no sistema) */}
      {suggestedPlans.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Adicionar rápido</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Planos já cadastrados por outros médicos
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPlans.map((plan) => (
              <form key={plan.id} action={action}>
                <input type="hidden" name="name" value={plan.name} />
                <ActionTokenInput token={plan.addActionToken} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-cyan-500 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors"
                >
                  <Plus size={13} />
                  {plan.name}
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* Adicionar novo */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Adicionar convênio</h2>

        <form action={action} className="flex gap-3">
          <ActionTokenInput token={createActionToken} />
          <input
            name="name"
            placeholder="Ex: Unimed, Bradesco Saúde, SulAmérica..."
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 rounded-lg bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 text-white text-sm font-medium transition-colors disabled:opacity-60 shrink-0"
          >
            {pending ? "..." : "Adicionar"}
          </button>
        </form>

        {state?.error && (
          <p className="mt-3 text-sm text-red-500">{state.error}</p>
        )}
        {state?.success && (
          <p className="mt-3 text-sm text-green-500">Convênio adicionado!</p>
        )}
      </div>
    </div>
  )
}
