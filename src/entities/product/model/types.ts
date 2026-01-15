import { GameProduct, TLauncher } from "@/entities/game/model/types"
import { ServicePlanProduct, TServicePlatform } from "@/entities/service/model/types"
import { PRODUCT_EDITION, PRODUCT_TYPE } from "@prisma/client"

export interface TBaseProduct {
    id: number,
    title: string,
    description: string | null
    image_url: string,
    productType: PRODUCT_TYPE
    productEdition: PRODUCT_EDITION
    price: number

    stock: number
    rating: number
    isActive: boolean
}

export type Product = GameProduct | ServicePlanProduct
export type TCarouselItem = Product | TLauncher | TServicePlatform
