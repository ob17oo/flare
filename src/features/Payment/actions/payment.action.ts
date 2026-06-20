'use server'

import { authOptions } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

interface PaymentActionProps{
    productId: number,
    promocode?: string,
    email: string
}

export async function paymentAction(data: PaymentActionProps){
    try{
        const serverSession = await getServerSession(authOptions)
        
        if(!serverSession?.user){
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
                            where: { status: 'SUCCESS' },
                            select: { id: true }
                        }
                    }
                }
            }
        })

        if(!user){
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


        const product = await prisma.product.findUnique({
            where: { id: data.productId }
        })

        if(!product || !product.isActive || product.stock <= 0){
            throw new Error('PRODUCT_NOT_FOUND')
        }

        let promocode = null
        let discount = 0
        if(data.promocode){
            promocode = await prisma.promocode.findUnique({
                where: { code: data.promocode.toUpperCase() }
            })
            if(!promocode || !promocode.isActive || (promocode.maxUses - promocode.usesCount) <= 0){
                throw new Error('PROMOCODE_NOT_FOUND')
            }

            discount = promocode.discount
        }
    
        const totalDiscountPercent = Math.min(discount + referralDiscount, 100)
        const discountAmount = Math.round(product.price * totalDiscountPercent / 100)
        const finalPrice = Math.max(product.price - discountAmount, 0)
        
        if(user.balance < finalPrice){
            throw new Error('NOT_ENOUGH_MONEY')
        }

        const transaction = await prisma.$transaction(async (tx) => {
            // Re-verify inside the transaction to prevent race conditions under serializable isolation
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
                where: { id: data.productId }
            })

            if (!txProduct || !txProduct.isActive || txProduct.stock <= 0) {
                throw new Error('PRODUCT_NOT_FOUND')
            }

            if (data.promocode) {
                const txPromocode = await tx.promocode.findUnique({
                    where: { code: data.promocode.toUpperCase() }
                })
                if (!txPromocode || !txPromocode.isActive || (txPromocode.maxUses - txPromocode.usesCount) <= 0) {
                    throw new Error('PROMOCODE_NOT_FOUND')
                }
            }

            await tx.user.update({
                where: {
                    id: userId
                },
                data: {
                    balance: {
                        decrement: finalPrice
                    },
                    spent: {
                        increment: finalPrice
                    }
                },
            })
            
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    productId: data.productId,
                    email: data.email,
                    promo: data.promocode || null,
                    status: 'PROCESSING'
                },
                select: {
                    id: true,
                    createdAt: true,
                    status: true,
                    product: {
                        select: {
                            title: true,
                            price: true,
                            image_url: true,
                        }
                    },
                    promoCode: {
                        select: {
                            discount: true,
                            code: true
                        }
                    }
                }
            })

            await tx.product.update({
                where: {
                    id: data.productId
                },
                data: {
                    stock: {
                        decrement: 1
                    }
                }
            })

            if(data.promocode){
                await tx.promocode.update({
                    where: {
                        code: data.promocode.toUpperCase()
                    },
                    data: {
                        usesCount: {
                            increment: 1
                        }
                    }
                })
            }

            return order

        },{
            timeout: 10000,
            maxWait: 2000,
            isolationLevel: 'Serializable'
        })
        
        revalidatePath('/orders')
        revalidatePath('/profile')

        return {
            success: true,
            data: transaction,
            message: 'Заказ успешно сформирован'
        }

    }catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log('Order creating error', error)
        }

        let userMessage = 'Произошла неизвестная ошибка'
        if(error instanceof Error){
            const errorMap: Record<string, string> = {
                'USER_NOT_AUTHORIZED': 'Пользователь не авторизован',
                'USER_NOT_FOUND': 'Пользователь не найден',
                'PRODUCT_NOT_FOUND' : 'Продукт не найден',
                'NOT_ENOUGH_MONEY' : 'Недостаточно средств',
                'PROMOCODE_NOT_FOUND' : 'Промокод не найден'
            }
            const errorCode = error.message.split(':')[0]
            userMessage = errorMap[errorCode] || error.message
        }
        return {
            success: false,
            message: userMessage
        }
    }
}