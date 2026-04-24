"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Search, X } from "lucide-react"

export function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [specialty, setSpecialty] = useState(params.get("specialty") ?? "")
  const [city, setCity] = useState(params.get("city") ?? "")

  function apply() {
    const q = new URLSearchParams()
    if (specialty.trim()) q.set("specialty", specialty.trim())
    if (city.trim()) q.set("city", city.trim())
    const qs = q.toString()
    router.push(qs ? `/dashboard/patient?${qs}` : "/dashboard/patient")
  }

  function clear() {
    setSpecialty("")
    setCity("")
    router.push("/dashboard/patient")
  }

  const hasFilter = !!specialty.trim() || !!city.trim()

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        placeholder="Especialidade (ex: Cardiologia)"
        className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
        placeholder="Cidade"
        className="w-40 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={apply}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 dark:bg-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Search size={14} />
        Buscar
      </button>
      {hasFilter && (
        <button
          onClick={clear}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  )
}