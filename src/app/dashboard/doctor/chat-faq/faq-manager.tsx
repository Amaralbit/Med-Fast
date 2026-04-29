"use client"

import { useActionState } from "react"
import type { ProfileState } from "@/app/actions/doctor"
import { addChatQuestion, removeChatQuestion } from "@/app/actions/doctor"
import { Trash2, Plus, MessageCircle, Phone } from "lucide-react"
import { ActionTokenInput } from "@/components/action-token-input"

type Question = { id: string; question: string; answer: string; removeActionToken: string }

type Props = {
  questions: Question[]
  whatsapp: string | null
  createActionToken: string
}

const initialState: ProfileState = {}

export function FaqManager({ questions, whatsapp, createActionToken }: Props) {
  const [state, formAction, pending] = useActionState(addChatQuestion, initialState)

  return (
    <div className="space-y-6">
      {/* Lista atual */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800">

        {/* Item fixo: WhatsApp */}
        <div className="flex items-start gap-4 p-4">
          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0 mt-0.5">
            <Phone size={14} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Falar pelo WhatsApp
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {whatsapp
                ? `Redireciona para wa.me/${whatsapp}`
                : "Configure seu WhatsApp no perfil para ativar este botão"}
            </p>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shrink-0">
            Obrigatório
          </span>
        </div>

        {/* Perguntas cadastradas */}
        {questions.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <MessageCircle size={28} className="mx-auto text-gray-300 dark:text-zinc-700 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-600">
              Nenhuma pergunta cadastrada ainda
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="flex items-start gap-4 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle size={14} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {q.question}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {q.answer}
                </p>
              </div>
              <form action={removeChatQuestion}>
                <input type="hidden" name="id" value={q.id} />
                <ActionTokenInput token={q.removeActionToken} />
                <button
                  type="submit"
                  title="Remover"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      {/* Formulário de nova pergunta */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus size={15} />
          Nova pergunta
        </h2>

        <form action={formAction} className="space-y-3">
          <ActionTokenInput token={createActionToken} />
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Pergunta
            </label>
            <input
              name="question"
              placeholder="Ex: Quais convênios vocês aceitam?"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Resposta
            </label>
            <textarea
              name="answer"
              rows={3}
              placeholder="Ex: Aceitamos Unimed, Bradesco Saúde e consultas particulares."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {state?.error && (
            <p className="text-xs text-red-500">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-xs text-green-600 dark:text-green-400">Pergunta adicionada!</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            {pending ? "Salvando..." : "Adicionar pergunta"}
          </button>
        </form>
      </div>
    </div>
  )
}
