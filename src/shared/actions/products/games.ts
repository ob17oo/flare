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
export async function getGameById(id: string){
    try {
        const gameId = parseInt(id)
        const gamesById = await prisma.product.findUnique({
            where: {
                id: gameId 
            }
        })

        if(!gamesById){
            return null
        }

        return gamesById
    } catch(error: unknown){
        console.log(`Произошла ошибка ${error}`)
        return null
    }
}