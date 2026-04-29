import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DoctorNav } from "./doctor-nav"

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") redirect("/login")

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-zinc-950">
      <DoctorNav userName={session.user.name} />

      {/* pt-14 offsets the fixed mobile top bar; removed on lg */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}