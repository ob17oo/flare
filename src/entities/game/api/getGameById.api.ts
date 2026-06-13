'use server'
import { prisma } from "@/shared/lib/prisma"
import { GameProduct } from "../model/types"
import { parseProductTags } from "@/entities/admin/api/products.action"

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

        const parsed = await parseProductTags(gamesById);

        const gameProduct: GameProduct = {
            ...parsed,
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