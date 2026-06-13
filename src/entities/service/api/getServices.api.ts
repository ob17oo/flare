'use server'
import { prisma } from "@/shared/lib/prisma"
import { PRODUCT_TYPE } from "@prisma/client"
import { ServicePlanProduct } from "../model/types"
import { parseProductTags } from "@/entities/admin/api/products.action"

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
                },
            },
        })

        if(!services){
            return null
        }
        
        const mappedServices = await Promise.all(services.map(async (service) => {
            const parsed = await parseProductTags(service);
            return {
                ...parsed,
                productType: 'SERVICE_PLANS' as const,
                servicePlans: service.servicePlans ? {
                    ...service.servicePlans,
                    servicePlatfrom: service.servicePlans.servicePlatform
                } : null
            };
        }));

        return mappedServices as ServicePlanProduct[];
    } catch(error: unknown){
        console.log(`Error fetching services ${error}`)
        throw new Error('Не удалось загрузить сервисы')
    }
}