import { Product } from "@/entities/product/model/types";
import { Promocode } from "@/entities/promocode/model/types";
import { User } from "@/entities/user/model/types";
import { STATUS } from "@prisma/client";

export interface Order{
    id: number,
    userId: string,
    user: User,
    productId: number,
    product: Product,
    createdAt: Date,
    updatedAt: Date,
    status: STATUS,
    promo?: string,
    promoCode: Promocode
}