import { emailSchema, passwordSchema } from "@/shared/schemas";
import z from "zod";

export const registerSchema = z
    .object({
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: passwordSchema,
        login: z.string().min(4, {error: 'Логин должен иметь минимум 4 символа'})
    })
    .refine((value) => value.password === value.confirmPassword, { error: 'Пароли не совпадают' })


export type RegisterFormData = z.infer<typeof registerSchema>