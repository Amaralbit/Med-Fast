export type Plan = "FREE" | "PRO" | "CLINIC"

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Grátis",
  PRO: "Pro",
  CLINIC: "Clínica",
}

export const PLAN_PRICES: Record<Plan, string> = {
  FREE: "R$ 0",
  PRO: "R$ 97/mês",
  CLINIC: "R$ 297/mês",
}

export const PLAN_LIMITS = {
  FREE: {
    maxAppointmentsPerMonth: 30,
    aiChat: false,
    documentUploads: false,
  },
  PRO: {
    maxAppointmentsPerMonth: Infinity,
    aiChat: true,
    documentUploads: true,
  },
  CLINIC: {
    maxAppointmentsPerMonth: Infinity,
    aiChat: true,
    documentUploads: true,
  },
} satisfies Record<Plan, { maxAppointmentsPerMonth: number; aiChat: boolean; documentUploads: boolean }>

export function canUploadDocuments(plan: string): boolean {
  return plan === "PRO" || plan === "CLINIC"
}

export function hasAiChat(plan: string): boolean {
  return plan === "PRO" || plan === "CLINIC"
}

/** Maps a Stripe price ID to a plan name. Falls back to FREE if unknown. */
export function planFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "PRO"
  if (priceId === process.env.STRIPE_PRICE_ID_CLINIC) return "CLINIC"
  return "FREE"
}