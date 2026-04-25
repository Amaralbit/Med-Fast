import { getStripe } from "@/lib/stripe"
import { prisma } from "@/server/db"
import { planFromPriceId } from "@/lib/plan"
import type Stripe from "stripe"

export const runtime = "nodejs"

// Stripe requires the raw body to verify the signature — disable body parsing
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return Response.json({ error: "Missing signature or secret" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret)
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const doctorProfileId = session.client_reference_id
        const customerId = session.customer as string | null
        const subscriptionId = session.subscription as string | null

        if (!doctorProfileId || !subscriptionId) break

        // Retrieve the subscription to find the price and determine the plan
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id ?? ""
        const plan = planFromPriceId(priceId)

        await prisma.doctorProfile.update({
          where: { id: doctorProfileId },
          data: {
            plan,
            stripeCustomerId: customerId ?? undefined,
            stripeSubscriptionId: subscriptionId,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id ?? ""
        const plan =
          subscription.status === "active" || subscription.status === "trialing"
            ? planFromPriceId(priceId)
            : "FREE"

        await prisma.doctorProfile.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { plan },
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await prisma.doctorProfile.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
            planExpiresAt: null,
          },
        })
        break
      }
    }
  } catch (err) {
    console.error("[stripe-webhook]", event.type, err)
    return Response.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return Response.json({ received: true })
}