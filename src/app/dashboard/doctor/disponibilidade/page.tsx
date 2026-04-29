import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import { AvailabilityManager } from "./availability-manager"
import { BlockedSlotManager } from "./blocked-slot-manager"
import { createActionToken } from "@/lib/security/form-protection"

export default async function DisponibilidadePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      availabilities: { orderBy: { dayOfWeek: "asc" } },
      blockedSlots: { orderBy: { startAt: "asc" } },
    },
  })

  if (!profile) redirect("/dashboard/doctor")

  const [availabilityCreateToken, blockedCreateToken] = await Promise.all([
    createActionToken("doctor:add-availability", session.user.id),
    createActionToken("doctor:add-blocked-slot", session.user.id),
  ])
  const availabilities = await Promise.all(
    profile.availabilities.map(async (av) => ({
      ...av,
      removeActionToken: await createActionToken("doctor:remove-availability", session.user.id),
    }))
  )
  const blockedSlots = await Promise.all(
    profile.blockedSlots.map(async (slot) => ({
      ...slot,
      removeActionToken: await createActionToken("doctor:remove-blocked-slot", session.user.id),
    }))
  )

  return (
    <div className="p-8 max-w-3xl space-y-12">
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disponibilidade</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure os dias e horários que você atende.
          </p>
        </div>
        <AvailabilityManager
          availabilities={availabilities}
          consultationDuration={profile.consultationDurationMinutes}
          createActionToken={availabilityCreateToken}
        />
      </div>

      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bloqueios</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bloqueie períodos específicos — férias, eventos, folgas. Nesses horários nenhum paciente conseguirá agendar.
          </p>
        </div>
        <BlockedSlotManager blockedSlots={blockedSlots} createActionToken={blockedCreateToken} />
      </div>
    </div>
  )
}
