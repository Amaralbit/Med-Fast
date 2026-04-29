"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, User, Calendar, HeartPulse, LogOut,
  ClipboardList, CalendarDays, MessageCircle, CreditCard, Menu, X,
} from "lucide-react"
import { signOutAction } from "@/app/actions/auth"

const navItems = [
  { href: "/dashboard/doctor", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/doctor/agendamentos", label: "Agendamentos", icon: ClipboardList },
  { href: "/dashboard/doctor/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/dashboard/doctor/perfil", label: "Meu Perfil", icon: User },
  { href: "/dashboard/doctor/disponibilidade", label: "Disponibilidade", icon: Calendar },
  { href: "/dashboard/doctor/convenios", label: "Convênios", icon: HeartPulse },
  { href: "/dashboard/doctor/chat-faq", label: "Chat FAQ", icon: MessageCircle },
  { href: "/dashboard/doctor/billing", label: "Plano e Cobrança", icon: CreditCard },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active
                ? "bg-blue-50 dark:bg-cyan-950/30 text-blue-500 dark:text-cyan-400 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-cyan-400"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function DoctorNav({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex-col">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-800">
          <span className="text-lg font-bold text-blue-500 dark:text-cyan-400">MedFast</span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">Dr(a). {userName}</p>
        </div>
        <NavLinks pathname={pathname} />
        <div className="px-3 py-4 border-t border-gray-200 dark:border-zinc-800">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
        <span className="text-base font-bold text-blue-500 dark:text-cyan-400">MedFast</span>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-base font-bold text-blue-500 dark:text-cyan-400">MedFast</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">Dr(a). {userName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="px-3 py-4 border-t border-gray-200 dark:border-zinc-800">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </form>
            </div>
          </aside>
        </>
      )}
    </>
  )
}