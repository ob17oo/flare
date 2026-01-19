import { prisma } from "@/shared/lib/prisma"
import { WalletProduct } from "../model/types"

export async function getWalletByProviderId(id: string){
    try {
        const walletId = parseInt(id)
        const provider = await prisma.walletProvider.findUnique({
            where: {
                id: walletId
            },
            include: {
                wallet: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if(!provider){
            return []
        }

        return provider.wallet.map((walletItem) => ({
            ...walletItem.product,
            productType: 'WALLET' as const,
            wallet: {
                id: walletItem.id,
                amountOfCoins: walletItem.amountOfCoins,
                productId: walletItem.productId,
                launcherId: walletItem.launcherId, 
                walletProvider: provider,
            }
        })) as WalletProduct[]
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching wallet by provider ${id}`, error)
        }
    }
}