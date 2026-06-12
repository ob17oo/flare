'use server'

import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { stripe } from "@/shared/lib/stripe"
import { getServerSession } from "next-auth"

interface CreateStripeSessionProps {
  amount: number // Amount in RUB
}

export async function createStripeSessionAction(data: CreateStripeSessionProps) {
  try {
    const serverSession = await getServerSession(authOptions)

    if (!serverSession?.user) {
      throw new Error('USER_NOT_AUTHORIZED')
    }

    const userId = serverSession.user.id

    // Check bounds in RUB (100 ₽ to 150,000 ₽)
    if (data.amount < 100 || data.amount > 150000) {
      throw new Error('INVALID_AMOUNT')
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Create a Checkout Session in RUB
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'rub',
            product_data: {
              name: 'Пополнение баланса Flare',
              description: `Зачисление на баланс: ${data.amount.toLocaleString('ru-RU')} ₽`,
            },
            unit_amount: data.amount * 100, // Stripe expects amount in cents/kopecks
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/balance/topup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/balance/topup/cancel`,
      metadata: {
        userId,
        rubAmount: data.amount.toString(),
        purpose: 'deposit'
      }
    })

    if (!session.url) {
      throw new Error('STRIPE_SESSION_CREATION_FAILED')
    }

    // Record the initiated pending deposit in the database (stored in RUB)
    await prisma.deposit.create({
      data: {
        userId,
        amount: data.amount,
        stripeId: session.id,
        status: 'PENDING'
      }
    })

    console.log(`[Stripe] Checkout Session created: ${session.id} for user ${userId}, amount ${data.amount} RUB`)

    return {
      success: true,
      url: session.url
    }

  } catch (error: unknown) {
    console.error('[Stripe Error] Failed to create checkout session:', error)
    if (error instanceof Error) {
      const errorMap: Record<string, string> = {
        'USER_NOT_AUTHORIZED': 'Пользователь не авторизован',
        'INVALID_AMOUNT': 'Сумма должна быть от 100 ₽ до 150 000 ₽',
        'STRIPE_SESSION_CREATION_FAILED': 'Не удалось создать сессию оплаты'
      }
      const userMessage = errorMap[error.message] || error.message
      throw new Error(`STRIPE_SESSION_ERROR: ${userMessage}`)
    }
    throw new Error('STRIPE_SESSION_ERROR: Неизвестная ошибка')
  }
}
