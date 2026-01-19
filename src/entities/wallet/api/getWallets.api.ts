import { prisma } from "@/shared/lib/prisma"
import { PRODUCT_TYPE } from "@prisma/client"
import { WalletProduct } from "../model/types"

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

        return wallets.map((wallet) => ({
            ...wallet,
            productType: 'WALLET' as const,
            wallet: wallet.wallet ? {
                ...wallet.wallet,
                walletProvider: wallet.wallet.walletProvider
            } : null
        })) as WalletProduct[]
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'development'){
            console.log(`Error fetching wallets: `, error)
        }
        throw new Error(`Произошла ошибка при загрузке кошельков`)
    }
}