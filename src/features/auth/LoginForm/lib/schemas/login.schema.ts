import { emailSchema, passwordSchema } from "@/shared/schemas";
import z from "zod";

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema  
})

export type LoginFormData = z.infer<typeof loginSchema>