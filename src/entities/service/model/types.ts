import { TBaseProduct } from "@/entities/product/model/types"

export interface TServicePlatform {
    id: number,
    title: string,
    description: string,
    image_url: string,
    category: string,
}
export interface TServicePlan {
    id: number,
    productId: number
    subTitle: string,
    duration: number,
    subImage_url: string
    serviceId: number,
    servicePlatform: TServicePlatform
}

export interface ServicePlanProduct extends TBaseProduct {
    productType: 'SERVICE_PLANS',
    servicePlans: TServicePlan | null,
    game?: never
}