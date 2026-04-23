import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, User, Calendar, HeartPulse, LogOut, ClipboardList, CalendarDays, MessageCircle } from "lucide-react"

const navItems = [
  { href: "/dashboard/doctor", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/doctor/agendamentos", label: "Agendamentos", icon: ClipboardList },
  { href: "/dashboard/doctor/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/dashboard/doctor/perfil", label: "Meu Perfil", icon: User },
  { href: "/dashboard/doctor/disponibilidade", label: "Disponibilidade", icon: Calendar },
  { href: "/dashboard/doctor/convenios", label: "Convênios", icon: HeartPulse },
  { href: "/dashboard/doctor/chat-faq", label: "Chat FAQ", icon: MessageCircle },
]

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") redirect("/login")

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-800">
          <span className="text-lg font-bold text-blue-500 dark:text-cyan-400">MedFast</span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            Dr(a). {session.user.name}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-200 dark:border-zinc-800">
          <form
            action={async () => {
              "use server"
              await signOut({ redirect: false })
              redirect("/login")
            }}
          >
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}