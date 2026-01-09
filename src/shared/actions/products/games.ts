import { prisma } from "@/shared/lib/prisma";
import { PRODUCT_TYPE } from "@prisma/client";

export async function getAllGames(){
    try {
        const games = await prisma.product.findMany({
            where: {
                productType: PRODUCT_TYPE.GAME,
                isActive: true
            },
            include: {
                game: {
                    include: {
                        launcher: true
                    }
                }
            }
        })
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
                id: gameId,
                productType: PRODUCT_TYPE.GAME,
            },
            include: {
                game: {
                    include: {
                        launcher: true
                    }
                }
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