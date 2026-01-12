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