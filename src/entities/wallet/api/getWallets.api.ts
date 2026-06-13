import { prisma } from "@/shared/lib/prisma"
import { PRODUCT_TYPE } from "@prisma/client"
import { WalletProduct } from "../model/types"
import { parseProductTags } from "@/entities/admin/api/products.action"

export async function getWallets(){
    try {
        const wallets = await prisma.product.findMany({
          where: {
            productType: PRODUCT_TYPE.WALLET,
            isActive: true
          },
          include: {
            wallet: {
                include: {
                    walletProvider: true
                }
            }
          }
        })

        const mappedWallets = await Promise.all(wallets.map(async (wallet) => {
            const parsed = await parseProductTags(wallet);
            return {
                ...parsed,
                productType: 'WALLET' as const,
                wallet: wallet.wallet ? {
                    ...wallet.wallet,
                    walletProvider: wallet.wallet.walletProvider
                } : null
            };
        }));

        return mappedWallets as WalletProduct[];
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching wallets: `, error)
        }
        throw new Error(`Произошла ошибка при загрузке кошельков`)
    }
}