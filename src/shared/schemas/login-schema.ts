import * as z from "zod";

export const emailSchema = z
    .string()
    .min(1, {message: 'Обязательное поле'})
    .includes('@', {message: 'Должен содержать @'})
    .toLowerCase()
    .trim()

export const passwordSchema = z
    .string()
    .min(4, {message: 'Пароль должен иметь минимум 6 символов'})

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})

export type LoginFormData = z.infer<typeof loginSchema>