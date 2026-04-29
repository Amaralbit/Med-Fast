"use client"

import { useActionState, useTransition } from "react"
import { uploadMedicalDocument, deleteMedicalDocument } from "@/app/actions/medical"
import { FileText, Download, Trash2, Plus } from "lucide-react"
import { ActionTokenInput } from "@/components/action-token-input"

type Doc = { id: string; type: string; title: string; fileUrl: string; createdAt: Date; deleteActionToken: string }
type Props = { appointmentId: string; documents: Doc[]; uploadActionToken: string }

const tz = "America/Sao_Paulo"
const DOC_LABEL: Record<string, string> = { PRESCRIPTION: "Receita", CERTIFICATE: "Atestado", OTHER: "Documento" }

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: tz })
}

export function DocumentSection({ appointmentId, documents, uploadActionToken }: Props) {
  const [state, formAction, pending] = useActionState(uploadMedicalDocument, {})
  const [, startTransition] = useTransition()

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800">
        {documents.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <FileText size={24} className="mx-auto text-gray-300 dark:text-zinc-700 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-600">Nenhum documento enviado</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {DOC_LABEL[doc.type] ?? doc.type} · {fmtDate(doc.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Baixar"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                >
                  <Download size={15} />
                </a>
                <button
                  onClick={() => startTransition(async () => { await deleteMedicalDocument(doc.id, doc.deleteActionToken) })}
                  title="Remover"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload form */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus size={15} />
          Enviar documento
        </p>

        <form action={formAction} className="space-y-3">
          <ActionTokenInput token={uploadActionToken} />
          <input type="hidden" name="appointmentId" value={appointmentId} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo</label>
              <select
                name="type"
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PRESCRIPTION">Receita</option>
                <option value="CERTIFICATE">Atestado</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Título</label>
              <input
                type="text"
                name="title"
                required
                maxLength={200}
                placeholder="Ex: Receita antibiótico"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Arquivo PDF (máx. 10 MB)
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf,application/pdf"
              required
              className="w-full text-sm text-gray-900 dark:text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-950/30 dark:file:text-cyan-400 hover:file:opacity-90"
            />
          </div>

          {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
          {state?.success && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Documento enviado! O paciente foi notificado por e-mail.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            <FileText size={14} />
            {pending ? "Enviando..." : "Enviar documento"}
          </button>
        </form>
      </div>
    </div>
  )
}
