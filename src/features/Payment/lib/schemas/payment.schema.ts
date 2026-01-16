import { emailSchema } from "@/shared/schemas";
import z from "zod";

export const paymentSchema = z.object({
    email: emailSchema,
    promocode: z
        .string()
        .optional()
        .refine((value) => !value || value.trim().length === 0 || value.trim().length >= 4, {
            error: 'Промокод слишком короткий'
        })
})

export type PaymentFormData = z.infer<typeof paymentSchema>