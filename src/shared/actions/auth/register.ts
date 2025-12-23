'use server'
import { prisma } from "@/shared/lib/prisma"
import { hashSync } from "bcrypt"
import { redirect } from "next/navigation"

export async function registerAction(data: {
    email: string,
    login: string,
    password: string
}){
    const email = data.email as string
    const login = data.login as string
    const password = data.password as string
    
    try{
        const userExist = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(userExist){
            throw new Error('Пользователь уже существует')
        }

        await prisma.user.create({
            data: {
                email: email,
                login: login,
                password: hashSync(password, 12),
                image_url: ''
            }
        })
    } catch(error: unknown){
        if(error instanceof Error){
            throw new Error('Произошла ошибка сервера')
        }
    }

    redirect('/')
}