import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, Calendar, ArrowRight } from "lucide-react"

export default async function DoctorDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: { select: { appointments: true } },
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const appointmentsToday = profile
    ? await prisma.appointment.count({
        where: {
          doctorProfileId: profile.id,
          startAt: { gte: today, lt: tomorrow },
        },
      })
    : 0

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const appointmentsMonth = profile
    ? await prisma.appointment.count({
        where: {
          doctorProfileId: profile.id,
          startAt: { gte: thisMonthStart },
        },
      })
    : 0

  const isProfileComplete = profile?.specialty && profile?.whatsapp

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Olá, Dr(a). {session.user.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Aqui está o resumo do seu consultório
        </p>
      </div>

      {!isProfileComplete && (
        <div className="mb-6 rounded-xl border border-blue-200 dark:border-cyan-900 bg-blue-50 dark:bg-cyan-950/30 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-cyan-400">
              Complete seu perfil para aparecer para os pacientes
            </p>
            <p className="text-xs text-blue-500 dark:text-cyan-600 mt-0.5">
              Adicione especialidade, WhatsApp e disponibilidade
            </p>
          </div>
          <Link
            href="/dashboard/doctor/perfil"
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-cyan-400 hover:underline shrink-0 ml-4"
          >
            Completar <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Consultas hoje", value: appointmentsToday },
          { label: "Consultas este mês", value: appointmentsMonth },
          { label: "Total de consultas", value: profile?._count.appointments ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-3xl font-bold text-blue-500 dark:text-cyan-400 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/doctor/perfil"
          className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-blue-300 dark:hover:border-cyan-700 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <User size={20} className="text-blue-500 dark:text-cyan-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Meu Perfil</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Edite suas informações, bio, preços e personalização
          </p>
        </Link>

        <Link
          href="/dashboard/doctor/disponibilidade"
          className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-blue-300 dark:hover:border-cyan-700 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-blue-500 dark:text-cyan-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Disponibilidade</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure seus horários de atendimento semanais
          </p>
        </Link>
      </div>
    </div>
  )
}