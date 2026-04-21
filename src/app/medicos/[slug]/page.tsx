import { prisma } from "@/server/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { MapPin, Clock, CreditCard, Phone, Calendar } from "lucide-react"
import { ChatWidget } from "./chat-widget"

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
}

const DAY_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

type Props = { params: Promise<{ slug: string }> }

export default async function DoctorPublicPage({ params }: Props) {
  const { slug } = await params

  const [doctor] = await Promise.all([
    prisma.doctorProfile.findUnique({
      where: { slug },
      include: {
        user: { select: { name: true } },
        healthPlans: { include: { healthPlan: true } },
        availabilities: true,
        chatQuestions: { orderBy: { order: "asc" } },
      },
    }),
    auth(),
  ])

  if (!doctor || !doctor.isPublished) notFound()

  const sortedAvailabilities = [...doctor.availabilities].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  )

  const address = [doctor.addressStreet, doctor.addressCity, doctor.addressState]
    .filter(Boolean)
    .join(", ")

  const primary = doctor.colorPrimary
  const accent = doctor.colorAccent

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950" style={{ "--color-primary": primary, "--color-accent": accent } as React.CSSProperties}>

      {/* Hero */}
      <div className="w-full py-16 px-4" style={{ background: `linear-gradient(135deg, ${primary}22 0%, ${accent}22 100%)` }}>
        <div className="max-w-3xl mx-auto flex items-center gap-6">
          <div
            className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
          >
            {doctor.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {doctor.user.name}
            </h1>
            {doctor.specialty && (
              <p className="text-lg mt-1" style={{ color: primary }}>
                {doctor.specialty}
              </p>
            )}
            {doctor.crm && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{doctor.crm}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Bio */}
        {doctor.bio && (
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Sobre</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {doctor.bio}
            </p>
          </section>
        )}

        {/* Info rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctor.pricePrivate && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primary}22` }}>
                <CreditCard size={18} style={{ color: primary }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Consulta particular</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  R$ {Number(doctor.pricePrivate).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primary}22` }}>
              <Clock size={18} style={{ color: primary }} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Duração da consulta</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {doctor.consultationDurationMinutes} minutos
              </p>
            </div>
          </div>

          {address && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 flex items-center gap-3 sm:col-span-2">
              <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${primary}22` }}>
                <MapPin size={18} style={{ color: primary }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Endereço</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{address}</p>
                {doctor.addressZip && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">CEP {doctor.addressZip}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Disponibilidade */}
        {sortedAvailabilities.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} style={{ color: primary }} />
              <h2 className="font-semibold text-gray-900 dark:text-white">Horários de atendimento</h2>
            </div>
            <ul className="space-y-2">
              {sortedAvailabilities.map((av) => (
                <li key={av.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {DAY_LABELS[av.dayOfWeek]}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                    {av.startTime} – {av.endTime}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Convênios */}
        {doctor.healthPlans.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Convênios aceitos</h2>
            <div className="flex flex-wrap gap-2">
              {doctor.healthPlans.map(({ healthPlan }) => (
                <span
                  key={healthPlan.id}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${primary}18`, color: primary }}
                >
                  {healthPlan.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        {doctor.whatsapp && (
          <div className="pb-4">
            <a
              href={`https://wa.me/${doctor.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              <Phone size={18} />
              Entrar em contato pelo WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* Floating chat widget */}
      <ChatWidget
        colorPrimary={primary}
        doctorName={doctor.user.name}
        whatsapp={doctor.whatsapp}
        questions={doctor.chatQuestions}
      />
    </div>
  )
}