'use server'
import { prisma } from "@/shared/lib/prisma"

export async function getAllServicesPlatform(){
    try {
        const servicePlatform = await prisma.servicePlatform.findMany({
            include: {
                servicePlans: true
            }
        })
        return servicePlatform || []
    } catch(error: unknown){
        console.log(`Error fetching services platform ${error}`)
        throw new Error('Не удалось загрузить платформы сервисов')
    }
}