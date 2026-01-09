import { PRODUCT_EDITION, PRODUCT_TYPE } from "@prisma/client"
import { TGame } from "./game.types"
import { TServicePlan } from "./service.types"

export interface TBaseProduct {
    id: number,
    title: string,
    description: string | null
    image_url: string,
    productType: PRODUCT_TYPE
    productEdition: PRODUCT_EDITION
    price: number

    stock: number | null
    rating: number
    isActive: boolean
}

export interface GameProduct extends TBaseProduct {
    productType: 'GAME'
    game: TGame | null
    servicePlans?: never
}

export interface ServicePlanProduct extends TBaseProduct {
    productType: 'SERVICE_PLANS'
    servicePlans: TServicePlan | null
    game?: never
}

export type Product = GameProduct | ServicePlanProduct