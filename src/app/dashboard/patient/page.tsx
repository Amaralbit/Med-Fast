import { prisma } from "@/server/db"
import Link from "next/link"
import { MapPin, Clock, CreditCard } from "lucide-react"

export default async function PatientDashboard() {
  const doctors = await prisma.doctorProfile.findMany({
    where: { isPublished: true },
    include: {
      user: { select: { name: true } },
      healthPlans: { include: { healthPlan: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Encontre um médico</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Clique em um médico para ver o perfil e agendar pelo chat
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 p-16 text-center">
          <p className="text-gray-400 dark:text-gray-600 text-sm">
            Nenhum médico disponível no momento
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/medicos/${doctor.slug}`}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 hover:shadow-md hover:border-blue-200 dark:hover:border-cyan-800 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${doctor.colorPrimary}, ${doctor.colorAccent})` }}
                >
                  {doctor.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {doctor.user.name}
                  </p>
                  {doctor.specialty && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                {doctor.pricePrivate && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <CreditCard size={13} />
                    <span>R$ {Number(doctor.pricePrivate).toFixed(2).replace(".", ",")} — particular</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={13} />
                  <span>{doctor.consultationDurationMinutes} min por consulta</span>
                </div>
                {doctor.addressCity && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={13} />
                    <span>{doctor.addressCity}{doctor.addressState ? `, ${doctor.addressState}` : ""}</span>
                  </div>
                )}
              </div>

              {doctor.healthPlans.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                  {doctor.healthPlans.slice(0, 3).map(({ healthPlan }) => (
                    <span
                      key={healthPlan.id}
                      className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400"
                    >
                      {healthPlan.name}
                    </span>
                  ))}
                  {doctor.healthPlans.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-zinc-800 text-gray-500">
                      +{doctor.healthPlans.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}