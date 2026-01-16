import { TBaseProduct } from "@/entities/product/model/types"
import { PRODUCT_EDITION } from "@prisma/client"

export interface TServicePlatform {
    id: number,
    title: string,
    description: string,
    image_url: string,
    category: string,
}

export interface TServicePlanProduct {
    id: number,
    title: string,
    price: number,
    image_url: string,
    description: string | null
    productEdition: PRODUCT_EDITION
    stock: number,
    rating: number,
    isActive: boolean
}

export interface TServicePlan {
    id: number,
    productId: number
    subTitle: string,
    duration: number,
    serviceId: number,
    product: TServicePlanProduct
}

export interface TServicePlatformWithPlans {
    id: number,
    title: string,
    description: string,
    image_url: string,
    category: string,
    servicePlans: TServicePlan[]
}

export interface ServicePlanProduct extends TBaseProduct {
    productType: 'SERVICE_PLANS',
    servicePlans: {
        id: number,
        subTitle: string,
        duration: number,
        productId: number,
        serviceId: number,
        servicePlatform: TServicePlatform
    } | null
    game?: never
}
