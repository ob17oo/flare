'use server'
import { prisma } from "@/shared/lib/prisma"
import { ServicePlanProduct } from "../model/types"

export async function getServicePlansByPlatformId(id: string){
    try {
        const platformId = parseInt(id)

        if(isNaN(platformId)){
            return []
        }

        const platform = await prisma.servicePlatform.findUnique({
            where: {
                id: platformId
            },
            include: {
                servicePlans: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if(!platform){
            return []
        }

        return platform.servicePlans.map((plan) => ({
            ...plan.product,
            productType: 'SERVICE_PLANS' as const,
            servicePlans: {
                id: plan.id,
                productId: plan.productId,
                subTitle: plan.subTitle,
                duration: plan.duration,
                serviceId: plan.serviceId,
                servicePlatform: platform
            }
        })) as ServicePlanProduct[]
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching service plan for platform ${id}:`, error)
        }
        throw new Error(`Не удалось загрузить планы подписки`)
    }
}