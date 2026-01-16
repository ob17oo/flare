'use server'

import { prisma } from "@/shared/lib/prisma"
import { string } from "zod"
import { ServicePlanProduct } from "../model/types"

export async function getServiceById(id: string){
    try {
        const serviceId = parseInt(id)
        const service = await prisma.servicePlatform.findFirst({
            where: {
                id: serviceId,
            },
            include: {
                servicePlans: {
                    include: {
                        product: {
                            select: {
                            id: true,
                            title: true,
                            price: true,
                            image_url: true,
                            description: true,
                            productEdition: true,
                            stock: true,
                            rating: true,
                            isActive: true
                            }
                        }
                    },
                }
            }
        })

        if(!service){
            return null
        }

        return service
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching service ${error}`)
        }
        throw new Error(`Не удалось загрузить игру`)
    }
}