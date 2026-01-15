import z from "zod";

export const emailSchema = z
    .email({error: 'Введите корректный email'})
    .min(1,{error: 'Обязательное поле'})
    .max(100, {error: 'Email слишком длинный'})
    .transform((value) => value.toLowerCase().trim())

export type Email = z.infer<typeof emailSchema>