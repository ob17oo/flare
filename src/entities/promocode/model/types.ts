import { Order } from "@/entities/order/model/types";

export interface Promocode {
    id: number,
    code: string,
    discount: number,
    isActive: boolean,
    maxUses: number,
    orders: Order[],
}