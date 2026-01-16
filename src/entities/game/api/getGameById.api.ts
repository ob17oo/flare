'use server'
import { prisma } from "@/shared/lib/prisma"
import { GameProduct } from "../model/types"

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

        if(!gamesById || gamesById.productType !== 'GAME'){
            return null
        }

        const gameProduct: GameProduct = {
            ...gamesById,
            productType: 'GAME' as const,
            game: gamesById.game ? {
                ...gamesById.game,
                launcher: gamesById.game.launcher
            } : null
        } 
        
        return gameProduct
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching game ${error}`)
        }
        throw new Error('Не удалось загрузить игры')
    }
}