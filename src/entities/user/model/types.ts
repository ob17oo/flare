import { Order } from "@/entities/order/model/types"

export interface User{
    id: number,
    login: string,
    email: string,
    image_url: string,
    discount: number,
    role: string,
    balance: string
    orders: Order[]
}