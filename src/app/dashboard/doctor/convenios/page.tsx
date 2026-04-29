import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import { HealthPlanManager } from "./health-plan-manager"
import { createActionToken } from "@/lib/security/form-protection"

export default async function ConveniosPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      healthPlans: { include: { healthPlan: true }, orderBy: { healthPlan: { name: "asc" } } },
    },
  })

  if (!profile) redirect("/dashboard/doctor")

  const allPlans = await prisma.healthPlan.findMany({ orderBy: { name: "asc" } })
  const linkedIds = new Set(profile.healthPlans.map((p) => p.healthPlanId))
  const unlinkedPlans = allPlans.filter((p) => !linkedIds.has(p.id))
  const createActionTokenValue = await createActionToken("doctor:add-health-plan", session.user.id)
  const linkedPlans = await Promise.all(
    profile.healthPlans.map(async (p) => ({
      id: p.healthPlanId,
      name: p.healthPlan.name,
      removeActionToken: await createActionToken("doctor:remove-health-plan", session.user.id),
    }))
  )
  const suggestedPlans = await Promise.all(
    unlinkedPlans.map(async (p) => ({
      ...p,
      addActionToken: await createActionToken("doctor:add-health-plan", session.user.id),
    }))
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Convênios</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gerencie os planos de saúde que você aceita. Eles aparecem no seu perfil público.
        </p>
      </div>

      <HealthPlanManager
        linkedPlans={linkedPlans}
        suggestedPlans={suggestedPlans}
        createActionToken={createActionTokenValue}
      />
    </div>
  )
}
