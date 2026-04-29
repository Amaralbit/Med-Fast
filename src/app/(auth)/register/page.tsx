"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { register } from "@/app/actions/auth"
import { Stethoscope, User } from "lucide-react"

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, {})
  const [role, setRole] = useState<"DOCTOR" | "PATIENT">("PATIENT")

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Criar conta
      </h2>

      <form action={action} className="space-y-4">
        {/* Seletor de perfil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Você é...
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["PATIENT", "DOCTOR"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  role === r
                    ? "border-blue-500 dark:border-cyan-400 bg-blue-50 dark:bg-cyan-900/20 text-blue-600 dark:text-cyan-400"
                    : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600"
                }`}
              >
                {r === "PATIENT" ? <User size={20} /> : <Stethoscope size={20} />}
                {r === "PATIENT" ? "Paciente" : "Médico"}
              </button>
            ))}
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome completo
          </label>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            E-mail
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Senha
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400"
          />
        </div>

        <div className="flex items-start gap-2.5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-zinc-600 accent-blue-500 dark:accent-cyan-400 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed cursor-pointer">
            Li e concordo com a{" "}
            <Link href="/privacidade" target="_blank" className="text-blue-500 dark:text-cyan-400 hover:underline">
              Política de Privacidade
            </Link>{" "}
            e os{" "}
            <Link href="/termos" target="_blank" className="text-blue-500 dark:text-cyan-400 hover:underline">
              Termos de Uso
            </Link>
            , incluindo o tratamento dos meus dados pessoais conforme a LGPD.
          </label>
        </div>

        {state?.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 rounded-lg bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {pending ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Já tem conta?{" "}
        <Link href="/login" className="text-blue-500 dark:text-cyan-400 hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  )
}
