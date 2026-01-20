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

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            },
            select: {
                balance: true
            }
        })

        if(!user){
            throw new Error('USER_NOT_FOUND')
        }


        const product = await prisma.product.findFirst({
            where: {
                id: data.productId,
                isActive: true,
                stock: { gt: 0 }
            }
        })

        if(!product){
            throw new Error('PRODUCT_NOT_FOUND')
        }

        let promocode = null
        let discount = 0
        if(data.promocode){
            promocode = await prisma.promocode.findFirst({
                where: {
                    code: data.promocode,
                    isActive: true,
                    maxUses: { gt: 0 }
                }
            })
            if(!promocode){
                throw new Error('PROMOCODE_NOT_FOUND')
            }

            discount = promocode.discount
        }
    
        const discountAmount = Math.round(product.price * discount / 100)
        const finalPrice = product.price - discountAmount
        
        if(user.balance < finalPrice){
            throw new Error('NOT_ENOUGH_MONEY')
        }

        const transaction = await prisma.$transaction(async (tx) => {

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
            
            const order = await prisma.order.create({
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

            if(promocode){
                await tx.promocode.update({
                    where: {
                        id: promocode.id
                    },
                    data: {
                        maxUses: {
                            decrement: 1
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

        if(error instanceof Error){
            const errorMap: Record<string, string> = {
                'USER_NOT_AUTHORIZED': 'Пользователь не авторизован',
                'USER_NOT_FOUND': 'Пользователь не найден',
                'PRODUCT_NOT_FOUND' : 'Продукт не найден',
                'NOT_ENOUGH_MONEY' : 'Недостаточно средств',
                'PROMOCODE_NOT_FOUND' : 'Промокод не найден'
            }
            const errorCode = error.message.split(':')[0]
            const userMessage = errorMap[errorCode] || error.message

            throw new Error(`CREATING ORDER ERROR ${userMessage}`)
        }
        throw new Error(`Creating order: Неизвестная ошибка`)
    }
}