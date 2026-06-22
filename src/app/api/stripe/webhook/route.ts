import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/shared/lib/stripe"
import { prisma } from "@/shared/lib/prisma"
import Stripe from "stripe"
import { generateProductKey } from "@/shared/lib/utils/productKey"

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
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Unknown error"
    console.error(`[Stripe Webhook Error] Signature verification failed: ${errMsg}`)
    return NextResponse.json({ error: `Webhook Error: ${errMsg}` }, { status: 400 })
  }

  console.log(`[Stripe Webhook] Received event type: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Only process balance top-up deposits
        if (session.metadata?.purpose === 'deposit') {
          const userId = session.metadata.userId
          const rubAmount = session.metadata.rubAmount || session.metadata.amount
          const amount = rubAmount ? parseInt(rubAmount, 10) : NaN

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

            if (existingDeposit) {
              if (existingDeposit.status === 'SUCCESS') {
                console.log(`[Stripe Webhook Idempotency] Deposit ${session.id} already marked as success. Skipping.`)
                return
              }

              // Atomic check-and-update status
              const updateResult = await tx.deposit.updateMany({
                where: { id: existingDeposit.id, status: 'PENDING' },
                data: { status: 'SUCCESS' }
              })

              if (updateResult.count === 0) {
                console.log(`[Stripe Webhook Concurrency] Deposit ${session.id} status update raced. Skipping balance credit.`)
                return
              }
            } else {
              // Create deposit record if it doesn't exist for some reason
              try {
                await tx.deposit.create({
                  data: {
                    userId,
                    amount,
                    stripeId: session.id,
                    status: 'SUCCESS'
                  }
                })
              } catch (err) {
                console.warn(`[Stripe Webhook Concurrency] Failed to create deposit (likely unique constraint conflict):`, err)
                return
              }
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
        } else if (session.metadata?.purpose === 'product_purchase') {
          const userId = session.metadata.userId
          const productIdStr = session.metadata.productId
          const productId = productIdStr ? parseInt(productIdStr, 10) : NaN
          const email = session.metadata.email
          const promocode = session.metadata.promocode || null

          if (!userId || isNaN(productId) || !email) {
            console.error("[Stripe Webhook Error] Invalid product purchase metadata in session:", session.id)
            break
          }

          // Fetch the order first to check if it's already PAID using stripeId (session.id)
          const order = await prisma.order.findUnique({
            where: { stripeId: session.id },
            include: { product: true }
          })

          if (!order) {
            console.error(`[Stripe Webhook Error] Order with stripeId ${session.id} not found.`)
            break
          }

          if (order.status === 'SUCCESS' || order.status === 'PAID') {
            console.log(`[Stripe Webhook Idempotency] Order #${order.id} is already marked as SUCCESS or PAID. Skipping.`)
            break
          }

          // Define variables to hold info needed for sending the email outside the transaction
          let ticketInfo: {
            toEmail: string
            productTitle: string
            purchaseDate: string
            orderId: string | number
            price: number | string
            paymentMethod: string
            status: string
            productKey: string
          } | null = null

          try {
            await prisma.$transaction(async (tx) => {
              // 1. Lock and re-fetch the order inside the transaction to prevent race conditions
              const txOrder = await tx.order.findUnique({
                where: { id: order.id },
                include: { product: true }
              })

              if (!txOrder) {
                throw new Error('ORDER_NOT_FOUND')
              }

              if (txOrder.status === 'SUCCESS' || txOrder.status === 'PAID') {
                console.log(`[Stripe Webhook Transaction] Order #${order.id} already marked SUCCESS or PAID.`)
                return
              }

              // 2. Lock and fetch the deposit
              const existingDeposit = await tx.deposit.findUnique({
                where: { stripeId: session.id }
              })

              if (existingDeposit && (existingDeposit.status === 'SUCCESS' || existingDeposit.status === 'PAID')) {
                console.log(`[Stripe Webhook Transaction] Deposit ${session.id} already marked SUCCESS or PAID.`)
                return
              }

              // Update Order and Deposit status to SUCCESS
              await tx.order.update({
                where: { id: order.id },
                data: { status: 'SUCCESS' }
              })

              if (existingDeposit) {
                await tx.deposit.update({
                  where: { id: existingDeposit.id },
                  data: { status: 'PAID' }
                })
              } else {
                await tx.deposit.create({
                  data: {
                    userId,
                    amount: txOrder.product.price,
                    stripeId: session.id,
                    status: 'PAID'
                  }
                })
              }

              // Decrement product stock
              await tx.product.update({
                where: { id: productId },
                data: { stock: { decrement: 1 } }
              })

              // Increment promocode usesCount if applicable
              if (promocode) {
                await tx.promocode.update({
                  where: { code: promocode.toUpperCase() },
                  data: { usesCount: { increment: 1 } }
                })
              }

              // Generate digital product key
              if (!email.endsWith('@steam.topup')) {
                const productKey = generateProductKey()

                // Create digital ticket
                await tx.ticket.create({
                  data: {
                    userId,
                    orderId: order.id,
                    productKey,
                  }
                })
              }
            }, {
              timeout: 10000,
              maxWait: 2000,
              isolationLevel: 'Serializable'
            })

            console.log(`[Stripe Webhook Success] Fulfilled product purchase for user ${userId}, product ${productId}, order ${order.id}`)
          } catch (err: unknown) {
            console.error(`[Stripe Webhook Error] Transaction failed for product purchase:`, err)
            throw err
          }
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
  } catch (error: unknown) {
    console.error("[Stripe Webhook Error] Handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
