import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import { PLAN_LABELS, PLAN_PRICES, type Plan } from "@/lib/plan"
import { Check, Zap, Building2, Sparkles } from "lucide-react"

const FEATURES = {
  FREE: [
    "Perfil público publicado",
    "Agendamento online (até 30/mês)",
    "Calendário de consultas",
    "Chat FAQ configurável",
    "Disponibilidade semanal",
  ],
  PRO: [
    "Tudo do plano Grátis",
    "Agendamentos ilimitados",
    "Secretária Virtual com IA (Claude)",
    "Upload de documentos (receitas, atestados)",
    "Prontuário digital",
  ],
  CLINIC: [
    "Tudo do plano Pro",
    "Suporte prioritário",
    "Onboarding personalizado",
    "Multi-médico em breve",
    "SLA garantido",
  ],
}

export default async function BillingPage() {
  const session = await auth()
  if (!session || session.user.role !== "DOCTOR") redirect("/login")

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, plan: true, planExpiresAt: true, stripeSubscriptionId: true, user: { select: { email: true } } },
  })
  if (!profile) redirect("/dashboard/doctor")

  const currentPlan = (profile.plan ?? "FREE") as Plan

  const paymentLinkPro = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PRO
  const paymentLinkClinic = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_CLINIC

  function buildLink(base: string | undefined): string | null {
    if (!base) return null
    const url = new URL(base)
    url.searchParams.set("prefilled_email", profile!.user.email)
    url.searchParams.set("client_reference_id", profile!.id)
    return url.toString()
  }

  const upgradeLinks: Record<Plan, string | null> = {
    FREE: null,
    PRO: buildLink(paymentLinkPro),
    CLINIC: buildLink(paymentLinkClinic),
  }

  const plans: { key: Plan; icon: React.ReactNode; color: string }[] = [
    { key: "FREE", icon: <Sparkles size={20} />, color: "text-gray-500" },
    { key: "PRO", icon: <Zap size={20} />, color: "text-blue-500 dark:text-cyan-400" },
    { key: "CLINIC", icon: <Building2 size={20} />, color: "text-violet-500" },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plano e Cobrança</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Seu plano atual:{" "}
          <span className="font-semibold text-blue-500 dark:text-cyan-400">
            {PLAN_LABELS[currentPlan]} — {PLAN_PRICES[currentPlan]}
          </span>
          {profile.planExpiresAt && (
            <span className="text-gray-400 ml-2">
              · renova em {new Date(profile.planExpiresAt).toLocaleDateString("pt-BR")}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(({ key, icon, color }) => {
          const isCurrentPlan = currentPlan === key
          const link = upgradeLinks[key]
          const isUpgrade = key === "PRO" || key === "CLINIC"

          return (
            <div
              key={key}
              className={`relative bg-white dark:bg-zinc-900 rounded-2xl border p-6 flex flex-col ${
                isCurrentPlan
                  ? "border-blue-500 dark:border-cyan-400 shadow-lg shadow-blue-500/10"
                  : "border-gray-200 dark:border-zinc-800"
              }`}
            >
              {isCurrentPlan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 dark:bg-cyan-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Plano atual
                </span>
              )}

              <div className={`flex items-center gap-2 mb-4 ${color}`}>
                {icon}
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {PLAN_LABELS[key]}
                </span>
              </div>

              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {PLAN_PRICES[key]}
              </p>
              {key !== "FREE" && (
                <p className="text-xs text-gray-400 mb-5">cobrado mensalmente via Stripe</p>
              )}
              {key === "FREE" && <div className="mb-5" />}

              <ul className="space-y-2.5 flex-1 mb-6">
                {FEATURES[key].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check size={15} className="shrink-0 mt-0.5 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed"
                >
                  Plano atual
                </button>
              ) : isUpgrade && link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center text-white transition-opacity hover:opacity-90 ${
                    key === "CLINIC"
                      ? "bg-violet-500"
                      : "bg-blue-500 dark:bg-cyan-500"
                  }`}
                >
                  Assinar {PLAN_LABELS[key]}
                </a>
              ) : isUpgrade && !link ? (
                <p className="text-center text-xs text-gray-400">Em breve</p>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed"
                >
                  Grátis sempre
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Cancel / manage subscription */}
      {currentPlan !== "FREE" && profile.stripeSubscriptionId && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Para cancelar ou alterar seu plano, entre em contato:{" "}
            <a
              href="mailto:suporte@medfast.app"
              className="text-blue-500 dark:text-cyan-400 font-medium hover:underline"
            >
              suporte@medfast.app
            </a>
          </p>
        </div>
      )}

      {/* How it works */}
      <div className="mt-10 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Como funciona</h3>
        <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
          <li>Clique em &ldquo;Assinar&rdquo; e finalize o pagamento via Stripe (cartão ou PIX).</li>
          <li>Após a confirmação, seu plano é ativado automaticamente em até 2 minutos.</li>
          <li>O valor é cobrado mensalmente no cartão informado. Cancele a qualquer momento.</li>
        </ol>
      </div>
    </div>
  )
}