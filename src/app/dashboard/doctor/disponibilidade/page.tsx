import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import { AvailabilityManager } from "./availability-manager"

export default async function DisponibilidadePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: { availabilities: { orderBy: { dayOfWeek: "asc" } } },
  })

  if (!profile) redirect("/dashboard/doctor")

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disponibilidade</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure os dias e horários que você atende. A IA usará esses horários para agendar consultas.
        </p>
      </div>

      <AvailabilityManager
        availabilities={profile.availabilities}
        consultationDuration={profile.consultationDurationMinutes}
      />
    </div>
  )
}