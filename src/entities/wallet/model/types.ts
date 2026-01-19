import { TBaseProduct } from "@/entities/product/model/types";

export interface TWalletProvider {
    id: number,
    title: string,
    description: string,
    image_url: string,
}

export interface WalletProduct extends TBaseProduct {
    productType: 'WALLET',
    wallet: {
        id: number,
        amountOfCoins: number,
        productId: number,
        launcherId: number,
        walletProvider: TWalletProvider
    } | null
    game?: never,
    servicePlans?: never
}