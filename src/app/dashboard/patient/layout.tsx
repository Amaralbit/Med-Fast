import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Stethoscope, ClipboardList, LogOut } from "lucide-react"
import { createActionToken } from "@/lib/security/form-protection"
import { ActionTokenInput } from "@/components/action-token-input"
import { signOutAction } from "@/app/actions/auth"
import { DashboardDecorations } from "../dashboard-decorations"

const navItems = [
  { href: "/dashboard/patient", label: "Médicos", icon: Stethoscope },
  { href: "/dashboard/patient/consultas", label: "Minhas Consultas", icon: ClipboardList },
]

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== "PATIENT") redirect("/login")
  const signOutActionToken = await createActionToken("auth:signout", session.user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 relative">
      <DashboardDecorations />
      {/* Top nav */}
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-base font-bold text-blue-500 dark:text-cyan-400">MedFast</span>
            <nav className="flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors"
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {session.user.name}
            </span>
            <form action={signOutAction}>
              <ActionTokenInput token={signOutActionToken} />
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:block">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
