'use server'

import { prisma } from "@/shared/lib/prisma"
import { ServicePlanProduct } from "@/shared/types/product.types"
import { PRODUCT_TYPE } from "@prisma/client"

export async function getAllServices(){
    try {
        const services = await prisma.product.findMany({
            where: {
                productType: PRODUCT_TYPE.SERVICE_PLANS,
                isActive: true,
            },
            include: {
                servicePlans: {
                    include: {
                        servicePlatform: true
                    }
                }
            }
        })

        return services.map((service) => ({
            ...service,
            productType: 'SERVICE_PLANS' as const,
            servicePlans: service.servicePlans ? {
                ...service.servicePlans,
                servicePlatfrom: service.servicePlans.servicePlatform
            } : null
        })) as ServicePlanProduct[]
    } catch(error: unknown){
        console.log(`Error fetching games ${error}`)
        throw new Error('Не удалось загрузить сервисы')
    }
}