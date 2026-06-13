import { prisma } from "@/shared/lib/prisma"
import { WalletProduct } from "../model/types"
import { parseProductTags } from "@/entities/admin/api/products.action"

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

        const mappedWallets = await Promise.all(provider.wallet.map(async (walletItem) => {
            const parsed = await parseProductTags(walletItem.product);
            return {
                ...parsed,
                productType: 'WALLET' as const,
                wallet: {
                    id: walletItem.id,
                    amountOfCoins: walletItem.amountOfCoins,
                    productId: walletItem.productId,
                    launcherId: walletItem.launcherId, 
                    walletProvider: provider,
                }
            };
        }));

        return mappedWallets as WalletProduct[];
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching wallet by provider ${id}`, error)
        }
    }
}