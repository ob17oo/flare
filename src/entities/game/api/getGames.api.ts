'use server'
import { prisma } from "@/shared/lib/prisma"
import { PRODUCT_TYPE } from "@prisma/client"
import { GameProduct } from "../model/types"
import { parseProductTags } from "@/entities/admin/api/products.action"

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

        const mappedGames = await Promise.all(games.map(async (game) => {
            const parsed = await parseProductTags(game);
            return {
                ...parsed,
                productType: 'GAME' as const,
                game: game.game ? {
                    ...game.game,
                    launcher: game.game.launcher
                } : null
            };
        }));

        return mappedGames as GameProduct[];

    } catch(error: unknown){
        console.log(`Error fetching games ${error}`)
        throw new Error(`Не удалось загрузить игры ${error}`)
    }
}