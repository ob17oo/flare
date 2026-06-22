'use server'

import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

interface SteamPaymentActionProps {
  steamLogin: string
  amount: number
  calculatedPrice: number
  promocode?: string | undefined
  paymentMethod: 'balance' | 'card' | 'sbp' | 'qiwi'
}

export async function steamPaymentAction(data: SteamPaymentActionProps) {
  try {
    const serverSession = await getServerSession(authOptions)

    if (!serverSession?.user) {
      throw new Error('USER_NOT_AUTHORIZED')
    }

    const userId = serverSession.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        balance: true,
        referrals: {
          include: {
            orders: {
              where: {
                status: {
                  in: ['SUCCESS', 'PAID']
                }
              },
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
    const activeReferrals = user.referrals?.filter(ref => ref.orders.length > 0).length || 0;
    let referralDiscount = 0;
    if (activeReferrals >= 20) referralDiscount = 20;
    else if (activeReferrals >= 15) referralDiscount = 15;
    else if (activeReferrals >= 10) referralDiscount = 10;
    else if (activeReferrals >= 5) referralDiscount = 5;
    else if (activeReferrals >= 3) referralDiscount = 3;
    else if (activeReferrals >= 1) referralDiscount = 1;

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

    // Use the first steam wallet product as the item placeholder for database integrity
    const firstWallet = steamProvider.wallet[0]
    if (!firstWallet) {
      throw new Error('STEAM_PRODUCT_NOT_FOUND')
    }
    const placeholderProduct = firstWallet.product

    let promocode = null
    let discount = 0
    if (data.promocode) {
      promocode = await prisma.promocode.findUnique({
        where: { code: data.promocode.toUpperCase() }
      })
      if (!promocode || !promocode.isActive || (promocode.maxUses - promocode.usesCount) <= 0) {
        throw new Error('PROMOCODE_NOT_FOUND')
      }
      discount = promocode.discount
    }

    // Calculate 8% commission on top of the base amount
    const basePrice = data.amount + Math.round(data.amount * 0.08);

    // Calculate dynamic price with promo code discount + referral discount
    const totalDiscountPercent = Math.min(discount + referralDiscount, 100)
    const discountAmount = Math.round(basePrice * totalDiscountPercent / 100)
    const finalPrice = Math.max(basePrice - discountAmount, 0)

    // If payment method is balance, deduct from account balance
    if (data.paymentMethod === 'balance') {
      if (user.balance < finalPrice) {
        throw new Error('NOT_ENOUGH_MONEY')
      }

      await prisma.$transaction(async (tx) => {
        // Re-verify inside the transaction to prevent race conditions
        const txUser = await tx.user.findUnique({
          where: { id: userId },
          select: { balance: true }
        })
        if (!txUser) {
          throw new Error('USER_NOT_FOUND')
        }
        if (txUser.balance < finalPrice) {
          throw new Error('NOT_ENOUGH_MONEY')
        }

        const txProduct = await tx.product.findUnique({
          where: { id: placeholderProduct.id }
        })
        if (!txProduct || !txProduct.isActive || txProduct.stock <= 0) {
          throw new Error('STEAM_PRODUCT_NOT_FOUND')
        }

        if (data.promocode) {
          const txPromocode = await tx.promocode.findUnique({
            where: { code: data.promocode.toUpperCase() }
          })
          if (!txPromocode || !txPromocode.isActive || (txPromocode.maxUses - txPromocode.usesCount) <= 0) {
            throw new Error('PROMOCODE_NOT_FOUND')
          }
        }

        // Deduct balance
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: { decrement: finalPrice },
            spent: { increment: finalPrice }
          }
        })

        // Create order
        await tx.order.create({
          data: {
            userId: userId,
            productId: placeholderProduct.id,
            email: `${data.steamLogin}@steam.topup`,
            promo: data.promocode || null,
            status: 'PROCESSING'
          }
        })

        // Decrement placeholder product stock
        await tx.product.update({
          where: { id: placeholderProduct.id },
          data: {
            stock: { decrement: 1 }
          }
        })

        if (data.promocode) {
          await tx.promocode.update({
            where: { code: data.promocode.toUpperCase() },
            data: {
              usesCount: { increment: 1 }
            }
          })
        }
      }, {
        timeout: 10000,
        maxWait: 2000,
        isolationLevel: 'Serializable'
      })
    } else {
      // Mock payment for non-balance methods (card, sbp, qiwi)
      await prisma.$transaction(async (tx) => {
        const txProduct = await tx.product.findUnique({
          where: { id: placeholderProduct.id }
        })
        if (!txProduct || !txProduct.isActive) {
          throw new Error('STEAM_PRODUCT_NOT_FOUND')
        }

        if (data.promocode) {
          const txPromocode = await tx.promocode.findUnique({
            where: { code: data.promocode.toUpperCase() }
          })
          if (!txPromocode || !txPromocode.isActive || (txPromocode.maxUses - txPromocode.usesCount) <= 0) {
            throw new Error('PROMOCODE_NOT_FOUND')
          }
        }

        await tx.order.create({
          data: {
            userId: userId,
            productId: placeholderProduct.id,
            email: `${data.steamLogin}@steam.topup`,
            promo: data.promocode || null,
            status: 'PROCESSING'
          }
        })

        if (data.promocode) {
          await tx.promocode.update({
            where: { code: data.promocode.toUpperCase() },
            data: {
              usesCount: { increment: 1 }
            }
          })
        }
      }, {
        timeout: 10000,
        maxWait: 2000,
        isolationLevel: 'Serializable'
      })
    }

    revalidatePath('/orders')
    revalidatePath('/profile')

    return {
      success: true,
      message: 'Пополнение успешно оформлено'
    }

  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Steam topup order error', error)
    }

    let userMessage = 'Произошла неизвестная ошибка'
    if (error instanceof Error) {
      const errorMap: Record<string, string> = {
        'USER_NOT_AUTHORIZED': 'Пользователь не авторизован',
        'USER_NOT_FOUND': 'Пользователь не найден',
        'STEAM_PRODUCT_NOT_FOUND': 'Услуга пополнения Steam временно недоступна в базе данных',
        'NOT_ENOUGH_MONEY': 'Недостаточно средств на балансе Flare',
        'PROMOCODE_NOT_FOUND': 'Промокод не найден'
      }
      const errorCode = error.message.split(':')[0] ?? ""
      userMessage = errorMap[errorCode] || error.message
    }
    return {
      success: false,
      message: userMessage
    }
  }
}
