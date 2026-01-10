'use server'
import { prisma } from "@/shared/lib/prisma";
import { GameProduct } from "@/shared/types/product.types";
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

        return games.map((game) => ({
            ...game,
            productType: 'GAME' as const,
            game: game.game ? {
                ...game.game,
                launcher: game.game.launcher
            } : null
        })) as GameProduct[]

    } catch(error: unknown){
        console.log(`Произошла ошибка ${error}`)
        return []   
    }
}
export async function getGameById(id: string){
    try {
        const gameId = parseInt(id)
        const gamesById = await prisma.product.findUnique({
            where: {
                id: gameId,
                productType: 'GAME' as const,
            },
            include: {
                game: {
                    include: {
                        launcher: true
                    }
                }
            }
            
        })

        return gamesById || []
    } catch(error: unknown){
        console.log(`Произошла ошибка ${error}`)
        return []
    }
}