'use server'
import { prisma } from "@/shared/lib/prisma"
import { ServicePlanProduct } from "../model/types"
import { parseProductTags } from "@/entities/admin/api/products.action"

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

        const mappedPlans = await Promise.all(platform.servicePlans.map(async (plan) => {
            const parsed = await parseProductTags(plan.product);
            return {
                ...parsed,
                productType: 'SERVICE_PLANS' as const,
                servicePlans: {
                    id: plan.id,
                    productId: plan.productId,
                    subTitle: plan.subTitle,
                    duration: plan.duration,
                    serviceId: plan.serviceId,
                    servicePlatform: platform
                }
            };
        }));

        return mappedPlans as ServicePlanProduct[];
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching service plan for platform ${id}:`, error)
        }
        throw new Error(`Не удалось загрузить планы подписки`)
    }
}