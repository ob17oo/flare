'use server'
import { prisma } from "@/shared/lib/prisma"

export async function getAllServicesPlatform(){
    try {
        const servicePlatform = await prisma.servicePlatform.findMany()
        return servicePlatform
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching services platform: ${error}`)
        }
        throw new Error(`Не удалось загрузить платформы сервисов ${error}`)
    }
}