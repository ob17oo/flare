import { TBaseProduct } from "@/entities/product/model/types"

export interface TLauncher {
    id: number,
    title: string,
    image_url: string
}

export interface TGame {
    id: number,
    productId: number,
    launcherId: number,
    launcher: TLauncher
    genre: string
}
export interface GameProduct extends TBaseProduct {
    productType: 'GAME',
    game: TGame | null,
    servicePlans?: never
}