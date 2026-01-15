import { emailSchema } from "@/shared/schemas";
import z from "zod";

export const paymentSchema = z.object({
    email: emailSchema,
    promocode: z
        .string()
        .min(4, { error: 'Промокод слишком короткий' })
})

export type PaymentFormData = z.infer<typeof paymentSchema>