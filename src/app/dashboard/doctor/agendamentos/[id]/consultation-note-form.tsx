"use client"

import { useActionState } from "react"
import { saveConsultationNote } from "@/app/actions/medical"
import { ClipboardList, Save } from "lucide-react"
import { ActionTokenInput } from "@/components/action-token-input"

type Note = {
  complaint: string | null
  diagnosis: string | null
  prescription: string | null
  notes: string | null
} | null

type Props = { appointmentId: string; note: Note; actionToken: string }

const textarea =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"

export function ConsultationNoteForm({ appointmentId, note, actionToken }: Props) {
  const [state, formAction, pending] = useActionState(saveConsultationNote, {})

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <ClipboardList size={15} />
        Prontuário
      </p>

      <form action={formAction} className="space-y-4">
        <ActionTokenInput token={actionToken} />
        <input type="hidden" name="appointmentId" value={appointmentId} />

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Queixa principal</label>
          <textarea name="complaint" defaultValue={note?.complaint ?? ""} rows={2} maxLength={10000}
            placeholder="Descrição da queixa do paciente..." className={textarea} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Diagnóstico</label>
          <textarea name="diagnosis" defaultValue={note?.diagnosis ?? ""} rows={2} maxLength={10000}
            placeholder="Diagnóstico ou hipótese diagnóstica..." className={textarea} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Prescrição</label>
          <textarea name="prescription" defaultValue={note?.prescription ?? ""} rows={3} maxLength={10000}
            placeholder="Medicamentos, dosagens, orientações..." className={textarea} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Observações</label>
          <textarea name="notes" defaultValue={note?.notes ?? ""} rows={2} maxLength={10000}
            placeholder="Outras anotações relevantes..." className={textarea} />
        </div>

        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state?.success && <p className="text-xs text-green-600 dark:text-green-400">Prontuário salvo!</p>}

        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          {pending ? "Salvando..." : "Salvar prontuário"}
        </button>
      </form>
    </div>
  )
}
