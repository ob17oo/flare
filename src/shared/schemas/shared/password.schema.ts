import z from "zod";

export const passwordSchema = z
    .string()
    .min(8, {error: 'Пароль должен содержать минимум 8 символов'})
    .max(50, {error: 'Пароль должен быть короче 100 символов'})

export type Password = z.infer<typeof passwordSchema>