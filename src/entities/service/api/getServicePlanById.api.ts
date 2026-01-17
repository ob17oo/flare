'use server'
import { prisma } from "@/shared/lib/prisma"
import { ServicePlanProduct } from "../model/types"

export async function getServicePlanById(id: string){
    try {
        const planId = parseInt(id)

        const product = await prisma.product.findUnique({
            where: {
                id: planId,
                productType: 'SERVICE_PLANS' as const,
            },
            include: {
                servicePlans: {
                    include: {
                        servicePlatform: true
                    }
                }
            }
        })

        if(!product || product.productType !== 'SERVICE_PLANS'){
            return null
        }

        return {
            ...product,
            productType: 'SERVICE_PLANS' as const,
            servicePlans: product.servicePlans ? {
                ...product.servicePlans,
                servicePlatform: product.servicePlans.servicePlatform
            } : null
        } as ServicePlanProduct

    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching service plans ${id}:`, error)
        }
        throw new Error(`Не удалось загрузить план подписки`)
    }
}