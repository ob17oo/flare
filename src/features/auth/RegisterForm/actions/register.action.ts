'use server'
import { prisma } from "@/shared/lib/prisma"
import { Prisma } from "@prisma/client"
import { hash } from "bcrypt"
import { redirect } from "next/navigation"

export async function registerAction(data: {
    email: string,
    login: string,
    password: string,
    refCode?: string | null
}){
    const email = data.email as string
    const login = data.login as string
    const password = data.password as string
    const refCode = data.refCode
    
    try{
        const userExist = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(userExist){
            throw new Error('Пользователь уже существует')
        }

        let referredById = null;
        if (refCode) {
            let referralCode = refCode.trim();
            if (referralCode.includes('?ref=')) {
                const parts = referralCode.split('?ref=');
                referralCode = (parts[1] && parts[1].split('&')[0]) || referralCode;
            } else if (referralCode.includes('/')) {
                referralCode = referralCode.split('/').pop() || referralCode;
            }
            const referrer = await prisma.user.findUnique({ where: { referralCode } });
            if (referrer) {
                referredById = referrer.id;
            }
        }

        const newUserReferralCode = `ref-${Math.random().toString(36).substring(2, 11)}`;

        await prisma.user.create({
            data: {
                email: email,
                login: login,
                password:await hash(password, 12),
                referralCode: newUserReferralCode,
                ...(referredById ? { referredById } : {})
            }
        })
    } catch(error: unknown){
        if(error instanceof Prisma.PrismaClientKnownRequestError){
            if(error.code === 'P2002'){
                throw new Error(`Пользователь с таким Email уже существует`)
            }
        }

        console.log('Registration error', error)

        if(error instanceof Error && error.message.includes('уже существует')){
            throw new Error
        }
        throw new Error('Произошла ошибка при регистрации. Повторите позже')
    }

    redirect('/login')
}