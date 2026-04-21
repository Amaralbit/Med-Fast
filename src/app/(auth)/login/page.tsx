"use client"

import { useActionState } from "react"
import Link from "next/link"
import { login } from "@/app/actions/auth"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {})
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(
        session.user.role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient"
      )
    }
  }, [status, session, router])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Entrar na conta
      </h2>

      <form action={action} className="space-y-4">
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
            autoComplete="current-password"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 rounded-lg bg-blue-500 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Não tem conta?{" "}
        <Link href="/register" className="text-blue-500 dark:text-cyan-400 hover:underline font-medium">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
