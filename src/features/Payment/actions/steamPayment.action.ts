'use server'

import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

interface SteamPaymentActionProps {
  steamLogin: string
  amount: number
  calculatedPrice: number
  promocode?: string
  paymentMethod: 'balance' | 'card' | 'sbp' | 'qiwi'
}

export async function steamPaymentAction(data: SteamPaymentActionProps) {
  try {
    const serverSession = await getServerSession(authOptions)

    if (!serverSession?.user) {
      throw new Error('USER_NOT_AUTHORIZED')
    }

    const userId = serverSession.user.id

    // Check user & balance
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { balance: true }
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

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
    const placeholderProduct = steamProvider.wallet[0].product

    let promocode = null
    let discount = 0
    if (data.promocode) {
      promocode = await prisma.promocode.findFirst({
        where: {
          code: data.promocode,
          isActive: true,
          maxUses: { gt: 0 }
        }
      })
      if (!promocode) {
        throw new Error('PROMOCODE_NOT_FOUND')
      }
      discount = promocode.discount
    }

    // Calculate dynamic price with promo code discount
    const discountAmount = Math.round(data.calculatedPrice * discount / 100)
    const finalPrice = data.calculatedPrice - discountAmount

    // If payment method is balance, deduct from account balance
    if (data.paymentMethod === 'balance') {
      if (user.balance < finalPrice) {
        throw new Error('NOT_ENOUGH_MONEY')
      }

      await prisma.$transaction(async (tx) => {
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
            email: `${data.steamLogin}@steam.topup`, // Save steam login in email or custom format
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

        if (promocode) {
          await tx.promocode.update({
            where: { id: promocode.id },
            data: {
              maxUses: { decrement: 1 }
            }
          })
        }
      })
    } else {
      // Mock payment for non-balance methods (card, sbp, qiwi)
      // Since it's a mock payment, we don't deduct account balance,
      // but we can still create an order for the user as a record!
      await prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            userId: userId,
            productId: placeholderProduct.id,
            email: `${data.steamLogin}@steam.topup`,
            promo: data.promocode || null,
            status: 'PROCESSING'
          }
        })

        if (promocode) {
          await tx.promocode.update({
            where: { id: promocode.id },
            data: {
              maxUses: { decrement: 1 }
            }
          })
        }
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

    if (error instanceof Error) {
      const errorMap: Record<string, string> = {
        'USER_NOT_AUTHORIZED': 'Пользователь не авторизован',
        'USER_NOT_FOUND': 'Пользователь не найден',
        'STEAM_PRODUCT_NOT_FOUND': 'Услуга пополнения Steam временно недоступна в базе данных',
        'NOT_ENOUGH_MONEY': 'Недостаточно средств на балансе Flare',
        'PROMOCODE_NOT_FOUND': 'Промокод не найден'
      }
      const errorCode = error.message.split(':')[0]
      const userMessage = errorMap[errorCode] || error.message
      throw new Error(`TOPUP ERROR ${userMessage}`)
    }
    throw new Error(`Topup: Неизвестная ошибка`)
  }
}
