import * as z from "zod";

export const emailSchema = z
    .email({message: 'Введите корректный email адрес'})
    // .string()
    .min(1, {message: 'Обязательное поле'})
    .toLowerCase()
    .trim()

export const loginSchema = z
    .string()
    .min(4, {message: 'Логин должен иметь минимум 4 символа'})

export const passwordSchema = z
    .string()
    .min(8, {message: 'Пароль должен быть больше 8 символов'})


export const registerSchema = z.object({
    email: emailSchema,
    login: loginSchema,
    password: passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.confirmPassword === data.password, {
    message: 'Пароли не совпадают'
})

export type RegisterFormData = z.infer<typeof registerSchema>
