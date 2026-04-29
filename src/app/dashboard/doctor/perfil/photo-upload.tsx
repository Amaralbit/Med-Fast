"use client"

import { useActionState, useRef } from "react"
import { uploadProfilePhoto } from "@/app/actions/doctor"
import { Camera, Loader2 } from "lucide-react"
import { ActionTokenInput } from "@/components/action-token-input"

type Props = { currentPhotoUrl: string | null; doctorName: string; actionToken: string }

export function PhotoUpload({ currentPhotoUrl, doctorName, actionToken }: Props) {
  const [state, formAction, pending] = useActionState(uploadProfilePhoto, {})
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-5 mb-8 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
      <div className="relative shrink-0">
        {currentPhotoUrl ? (
          <img
            src={currentPhotoUrl}
            alt={doctorName}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl font-bold text-blue-500 dark:text-cyan-400">
            {doctorName.charAt(0).toUpperCase()}
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 dark:bg-cyan-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow disabled:opacity-50"
        >
          {pending ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
        </button>
      </div>

      <div>
        <p className="font-medium text-gray-900 dark:text-white text-sm">{doctorName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">JPEG, PNG ou WebP · máx. 5 MB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="mt-2 text-xs text-blue-500 dark:text-cyan-400 hover:underline disabled:opacity-50"
        >
          {pending ? "Enviando..." : currentPhotoUrl ? "Trocar foto" : "Adicionar foto"}
        </button>
        {state?.error && <p className="text-xs text-red-500 mt-1">{state.error}</p>}
        {state?.success && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Foto atualizada!</p>}

        <form action={formAction}>
          <ActionTokenInput token={actionToken} />
          <input
            ref={inputRef}
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) e.target.form?.requestSubmit() }}
          />
        </form>
      </div>
    </div>
  )
}
