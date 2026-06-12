import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/shared/lib/stripe"
import { prisma } from "@/shared/lib/prisma"
import Stripe from "stripe"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("[Stripe Webhook Error] STRIPE_WEBHOOK_SECRET is not configured.")
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 })
  }

  if (!sig) {
    console.error("[Stripe Webhook Error] stripe-signature header is missing.")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`[Stripe Webhook Error] Signature verification failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.log(`[Stripe Webhook] Received event type: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Only process balance top-up deposits
        if (session.metadata?.purpose === 'deposit') {
          const userId = session.metadata.userId
          const amount = parseInt(session.metadata.rubAmount || session.metadata.amount, 10)

          if (!userId || isNaN(amount)) {
            console.error("[Stripe Webhook Error] Invalid metadata in session:", session.id)
            break
          }

          // Use transaction with serialization or atomic updates to prevent double-spending/race conditions
          await prisma.$transaction(async (tx) => {
            // Find existing deposit
            const existingDeposit = await tx.deposit.findUnique({
              where: { stripeId: session.id }
            })

            if (existingDeposit && existingDeposit.status === 'SUCCESS') {
              console.log(`[Stripe Webhook Idempotency] Deposit ${session.id} already marked as success. Skipping.`)
              return
            }

            if (existingDeposit) {
              // Update status to SUCCESS
              await tx.deposit.update({
                where: { id: existingDeposit.id },
                data: { status: 'SUCCESS' }
              })
            } else {
              // Create deposit record if it doesn't exist for some reason
              await tx.deposit.create({
                data: {
                  userId,
                  amount,
                  stripeId: session.id,
                  status: 'SUCCESS'
                }
              })
            }

            // Increment user balance
            await tx.user.update({
              where: { id: userId },
              data: {
                balance: { increment: amount }
              }
            })

            console.log(`[Stripe Webhook Success] Credited ${amount} RUB to user ${userId} balance.`)
          })
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`[Stripe Webhook Success] PaymentIntent ${paymentIntent.id} succeeded.`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.warn(`[Stripe Webhook Failed] PaymentIntent ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message}`)
        
        // Find matching deposit and mark as CANCELLED
        const deposit = await prisma.deposit.findFirst({
          where: { stripeId: paymentIntent.id }
        })
        if (deposit && deposit.status === 'PENDING') {
          await prisma.deposit.update({
            where: { id: deposit.id },
            data: { status: 'CANCELLED' }
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.warn(`[Stripe Webhook Refund] Charge ${charge.id} was refunded.`)

        // Find deposit that corresponds to this payment session
        // Stripe charges are linked to payment intents which are linked to checkout sessions
        const paymentIntentId = charge.payment_intent as string
        if (paymentIntentId) {
          await prisma.$transaction(async (tx) => {
            const deposit = await tx.deposit.findFirst({
              where: {
                OR: [
                  { stripeId: paymentIntentId },
                  // If stripeId matches checkout session, find by userId/amount matching
                ]
              }
            })

            if (deposit && deposit.status === 'SUCCESS') {
              // Mark deposit as CANCELLED (or create custom REFUNDED state, since we have STATUS enum, we can use CANCELLED)
              await tx.deposit.update({
                where: { id: deposit.id },
                data: { status: 'CANCELLED' }
              })

              // Deduct from user's balance
              await tx.user.update({
                where: { id: deposit.userId },
                data: {
                  balance: { decrement: deposit.amount }
                }
              })
              console.log(`[Stripe Webhook Refund Success] Deducted ${deposit.amount} RUB from user ${deposit.userId} due to refund.`)
            }
          })
        }
        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error("[Stripe Webhook Error] Handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
