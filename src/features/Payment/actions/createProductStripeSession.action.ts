'use server'

import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { stripe } from "@/shared/lib/stripe"
import { getServerSession } from "next-auth"
import { getAppUrl } from "@/shared/lib/utils"

interface CreateProductStripeSessionProps {
  productId: number
  email: string
  promocode?: string | undefined
}

export async function createProductStripeSessionAction(data: CreateProductStripeSessionProps) {
  try {
    const serverSession = await getServerSession(authOptions)

    if (!serverSession?.user) {
      throw new Error('USER_NOT_AUTHORIZED')
    }

    const userId = serverSession.user.id

    // Fetch user and referrals to calculate discount
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referrals: {
          include: {
            orders: {
              where: { status: { in: ['SUCCESS', 'PAID'] } },
              select: { id: true }
            }
          }
        }
      }
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    // Calculate referral discount
    const activeReferrals = user.referrals?.filter(ref => ref.orders.length > 0).length || 0
    let referralDiscount = 0
    if (activeReferrals >= 20) referralDiscount = 20
    else if (activeReferrals >= 15) referralDiscount = 15
    else if (activeReferrals >= 10) referralDiscount = 10
    else if (activeReferrals >= 5) referralDiscount = 5
    else if (activeReferrals >= 3) referralDiscount = 3
    else if (activeReferrals >= 1) referralDiscount = 1

    // Fetch product details
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    })

    if (!product || !product.isActive || product.stock <= 0) {
      throw new Error('PRODUCT_NOT_FOUND')
    }

    // Validate promocode if provided
    let discount = 0
    if (data.promocode) {
      const promo = await prisma.promocode.findUnique({
        where: { code: data.promocode.toUpperCase() }
      })
      if (!promo || !promo.isActive || (promo.maxUses - promo.usesCount) <= 0) {
        throw new Error('PROMOCODE_NOT_FOUND')
      }
      discount = promo.discount
    }

    // Calculate total discount and final price
    const totalDiscountPercent = Math.min(discount + referralDiscount, 100)
    const discountAmount = Math.round(product.price * totalDiscountPercent / 100)
    const finalPrice = Math.max(product.price - discountAmount, 0)

    const appUrl = getAppUrl()

    // Create a Checkout Session in Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'rub',
            product_data: {
              name: product.title,
              description: `Покупка товара на Flare. Получатель: ${data.email}`,
              ...(product.image_url ? { images: [product.image_url.startsWith('http') ? product.image_url : `${appUrl}${product.image_url}`] } : {})
            },
            unit_amount: finalPrice * 100, // Stripe expects cents/kopecks
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/profile/tickets?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
      metadata: {
        purpose: 'product_purchase',
        userId,
        productId: product.id.toString(),
        email: data.email,
        promocode: data.promocode?.trim() || '',
        finalPrice: finalPrice.toString(),
      }
    })

    if (!session.url) {
      throw new Error('STRIPE_SESSION_CREATION_FAILED')
    }

    // Save pending Order and Deposit inside transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Check if product is still available
      const txProduct = await tx.product.findUnique({
        where: { id: data.productId }
      })
      if (!txProduct || !txProduct.isActive || txProduct.stock <= 0) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      // Create PENDING order
      await tx.order.create({
        data: {
          userId,
          productId: data.productId,
          email: data.email,
          promo: data.promocode || null,
          status: 'PENDING',
          stripeId: session.id,
        }
      })

      // Create PENDING deposit (payment record)
      await tx.deposit.create({
        data: {
          userId,
          amount: finalPrice,
          stripeId: session.id,
          status: 'PENDING'
        }
      })
    })

    console.log(`[Stripe Product Purchase] Checkout Session created: ${session.id} for user ${userId}, product ${product.title}`)

    return {
      success: true,
      url: session.url
    }

  } catch (error: unknown) {
    console.error('[Stripe Error] Failed to create product checkout session:', error)
    if (error instanceof Error) {
      const errorMap: Record<string, string> = {
        'USER_NOT_AUTHORIZED': 'Пользователь не авторизован',
        'USER_NOT_FOUND': 'Пользователь не найден',
        'PRODUCT_NOT_FOUND': 'Продукт распродан или недоступен',
        'PROMOCODE_NOT_FOUND': 'Промокод недействителен',
        'STRIPE_SESSION_CREATION_FAILED': 'Не удалось создать сессию оплаты'
      }
      const userMessage = errorMap[error.message] || error.message
      throw new Error(`STRIPE_SESSION_ERROR: ${userMessage}`)
    }
    throw new Error('STRIPE_SESSION_ERROR: Неизвестная ошибка')
  }
}
