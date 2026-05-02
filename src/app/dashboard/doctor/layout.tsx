import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DoctorNav } from "./doctor-nav"
import { createActionToken } from "@/lib/security/form-protection"
import { DashboardDecorations } from "../dashboard-decorations"

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") redirect("/login")
  const signOutActionToken = await createActionToken("auth:signout", session.user.id)

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-zinc-950">
      <DoctorNav userName={session.user.name} signOutActionToken={signOutActionToken} />

      {/* pt-14 offsets the fixed mobile top bar; removed on lg */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 relative">
        <DashboardDecorations />
        {children}
      </main>
    </div>
  )
}
