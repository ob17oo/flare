'use server'

import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { stripe } from "@/shared/lib/stripe"
import { getServerSession } from "next-auth"
import { getAppUrl } from "@/shared/lib/utils"

interface CreateSteamStripeSessionProps {
  steamLogin: string
  amount: number
  calculatedPrice: number
  promocode?: string | undefined
}

export async function createSteamStripeSessionAction(data: CreateSteamStripeSessionProps) {
  try {
    const serverSession = await getServerSession(authOptions)

    if (!serverSession?.user) {
      throw new Error('USER_NOT_AUTHORIZED')
    }

    const userId = serverSession.user.id

    // Find any valid Steam wallet product to link the order to
    const steamProvider = await prisma.walletProvider.findFirst({
      where: { title: { contains: 'Steam' } },
      include: {
        wallet: {
          include: {
            product: true
          }
        }
      }
    })

    if (!steamProvider || steamProvider.wallet.length === 0) {
      throw new Error('STEAM_PRODUCT_NOT_FOUND')
    }

    const firstWallet = steamProvider.wallet[0]
    if (!firstWallet) {
      throw new Error('STEAM_PRODUCT_NOT_FOUND')
    }
    const placeholderProduct = firstWallet.product
    const appUrl = getAppUrl()
    const email = `${data.steamLogin}@steam.topup`

    // Create a Checkout Session in Stripe using the dynamically calculated price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'rub',
            product_data: {
              name: `Пополнение баланса Steam`,
              description: `Логин Steam: ${data.steamLogin}. Сумма к зачислению: ${data.amount} ₽`,
              images: placeholderProduct.image_url ? [placeholderProduct.image_url.startsWith('http') ? placeholderProduct.image_url : `${appUrl}${placeholderProduct.image_url}`] : []
            },
            unit_amount: data.calculatedPrice * 100, // Stripe expects cents/kopecks
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/profile?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/steam-topup`,
      metadata: {
        purpose: 'product_purchase',
        userId,
        productId: placeholderProduct.id.toString(),
        email,
        promocode: data.promocode?.trim() || '',
        finalPrice: data.calculatedPrice.toString(),
      }
    })

    if (!session.url) {
      throw new Error('STRIPE_SESSION_CREATION_FAILED')
    }

    // Save pending Order and Deposit inside transaction
    await prisma.$transaction(async (tx) => {
      // Create PENDING order
      await tx.order.create({
        data: {
          userId,
          productId: placeholderProduct.id,
          email,
          promo: data.promocode || null,
          status: 'PENDING',
          stripeId: session.id,
        }
      })

      // Create PENDING deposit
      await tx.deposit.create({
        data: {
          userId,
          amount: data.calculatedPrice,
          stripeId: session.id,
          status: 'PENDING'
        }
      })
    })

    console.log(`[Stripe Steam Topup] Checkout Session created: ${session.id} for user ${userId}, login ${data.steamLogin}`)

    return {
      success: true,
      url: session.url
    }

  } catch (error: unknown) {
    console.error('[Stripe Steam Error] Failed to create steam checkout session:', error)
    if (error instanceof Error) {
      const errorMap: Record<string, string> = {
        'USER_NOT_AUTHORIZED': 'Пользователь не авторизован',
        'USER_NOT_FOUND': 'Пользователь не найден',
        'STEAM_PRODUCT_NOT_FOUND': 'Услуга пополнения Steam временно недоступна в базе данных',
        'STRIPE_SESSION_CREATION_FAILED': 'Не удалось создать сессию оплаты'
      }
      const userMessage = errorMap[error.message] || error.message
      throw new Error(`STRIPE_SESSION_ERROR: ${userMessage}`)
    }
    throw new Error('STRIPE_SESSION_ERROR: Неизвестная ошибка')
  }
}
