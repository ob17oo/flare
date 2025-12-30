import { prisma } from "@/shared/lib/prisma";

export async function getAllGames(){
    try {
        const games = await prisma.product.findMany()
        if(!games) return null

        return games

    } catch(error: unknown){
        console.log(`Произошла ошибка ${error}`)
        return null   
    }
}