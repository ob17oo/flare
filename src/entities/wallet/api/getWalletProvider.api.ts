import { prisma } from "@/shared/lib/prisma"

export async function getAllWalletProvider(){
    try {
        const walletProvider = await prisma.walletProvider.findMany()
        return walletProvider || []
    } catch(error: unknown){
        if(process.env.NODE_ENV === 'production'){
            console.log(`Error fetching wallet providers`, error)
        }
        throw new Error('Не удалось загрузить лаунчеры кошельков')
    }
}