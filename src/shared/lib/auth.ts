import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { compare } from "bcrypt";
import z from "zod";
import { emailSchema, passwordSchema } from "../schemas";

const credentialSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60,
    },
    pages: {
        signIn: '/login',
        signOut: '/signOut',
        newUser: '/register'
    },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'your@email.com'
                },
                password: {
                    label: 'Password',
                    type: 'password',
                    placeholder: '*******'
                }
            },
            async authorize(credentials){
                    try{
                        if(!credentials?.email || !credentials.password){
                            throw new Error('EMAIL_PASSWORD_REQUIRED')
                        }

                        const validationResult = credentialSchema.safeParse({
                            email: credentials.email,
                            password: credentials.password
                        })

                        if(!validationResult.success){
                            const errors= validationResult.error.flatten().fieldErrors
                            const errorMessage = Object.values(errors)
                                .flat()
                                .join(', ')
                            throw new Error(`VALIDATION_ERROR: ${errorMessage} `)
                        }

                        const {email , password} = validationResult.data

                        const user = await prisma.user.findUnique({
                            where: {
                                email
                            },
                            select: {
                                id: true,
                                email: true,
                                password: true,
                                login: true,
                                image_url: true,
                                role: true,
                                balance: true,
                                discount: true,
                                spent: true,
                                maxUserDiscount: true,
                            }
                        })

                        if(!user){
                            throw new Error('USER_NOT_FOUND')
                        }

                        if(!user.password){
                            throw new Error('PASSWORD_NOT_SET')
                        }

                        const passwordIsValid = await compare(password, user.password)
                        if(!passwordIsValid){
                            throw new Error('INVALID_PASSWORD')
                        }

                        return {
                            id: user.id,
                            email: user.email,
                            login: user.login,
                            image_url: user.image_url,
                            role: user.role,
                            balance: user.balance,
                            discount: user.discount,
                            spent: user.spent,
                            maxUserDiscount: user.maxUserDiscount
                        }

                    } catch(error: unknown){
                        console.log('Auth autorize error', error)

                        if(error instanceof Error){
                            const errorMap: Record<string, string> = {
                                'EMAIL_PASSWORD_REQUIRED': 'Email и пароль обязательны',
                                'USER_NOT_FOUND': 'Пользователь не найден',
                                'PASSWORD_NOT_SET': 'Пароль не установлен',
                                'INVALID_PASSWORD': 'Неверный пароль',
                            }
                            const errorCode = error.message.split(':')[0] ?? ""
                            const userMessage = errorMap[errorCode] || error.message

                            throw new Error(`AUTH_ERROR ${userMessage}`)
                        }
                        throw new Error(`AUTH_ERROR: Неизвестная ошибка`)
                    }
                }
        })
    ],
    callbacks: {
        async jwt({token,user,trigger, session}){
            if(user){
                token.id = user.id;
                token.email = user.email;
                token.login = user.login;
                token.image_url = user.image_url;
                token.role = user.role;
                token.balance = user.balance;
                token.discount = user.discount;
                token.spent = user.spent;
                token.maxUserDiscount = user.maxUserDiscount;
            }

            if(trigger === 'update'){
                try{
                    const updateUser = await prisma.user.findUnique({
                    where: {
                        id: token.id as string
                    },
                    select: {
                        balance: true,
                        discount: true,
                        image_url: true,
                        login: true,
                        role: true,
                        spent: true
                    }
                    })
                    if(updateUser){
                        token.balance = updateUser.balance
                        token.discount = updateUser.discount
                        token.login = updateUser.login
                        token.image_url = updateUser.image_url
                        token.role = updateUser.role
                        token.spent = updateUser.spent
                    }
                } catch(error: unknown){
                    console.log(`Error updation JWT:`, error)
                    return token
                }
            }

            if (session?.user) {
                if (session.user.balance !== undefined) token.balance = session.user.balance
                if (session.user.discount !== undefined) token.discount = session.user.discount
                if (session.user.login !== undefined) token.login = session.user.login
                if (session.user.image_url !== undefined) token.image_url = session.user.image_url
                if (session.user.spent !== undefined) token.spent = session.user.spent
                if (session.user.maxUserDiscount !== undefined) token.maxUserDiscount = session.user.maxUserDiscount
            } else if (session) {
                if (session.balance !== undefined) token.balance = session.balance
                if (session.discount !== undefined) token.discount = session.discount
                if (session.login !== undefined) token.login = session.login
                if (session.image_url !== undefined) token.image_url = session.image_url
                if (session.spent !== undefined) token.spent = session.spent
                if (session.maxUserDiscount !== undefined) token.maxUserDiscount = session.maxUserDiscount
            }

            return token
        },
        async session({session, token}){
            if(token && session.user){
                session.user.id = token.id
                session.user.email = token.email
                session.user.login = token.login
                session.user.image_url = token.image_url
                session.user.balance = token.balance
                session.user.discount = token.discount
                session.user.role = token.role
                session.user.spent = token.spent
                session.user.maxUserDiscount = token.maxUserDiscount

                // Live-fetch database fields to ensure absolute correctness in real-time
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { balance: true, discount: true, spent: true }
                    })
                    if (dbUser) {
                        session.user.balance = dbUser.balance
                        session.user.discount = dbUser.discount
                        session.user.spent = dbUser.spent
                    }
                } catch (err) {
                    console.error("Error fetching live user data in session callback:", err)
                }
            }
            return session
        }
    },
    events: {
        async signIn({ user, isNewUser }){
            console.log('User sign in:', {
                userId: user.id,
                email: user.email,
                isNewUser
            })
        },
        async signOut({ token }){
            console.log('User signed out:', { userId: token?.id})
        },
        async createUser({ user }){
            console.log('New user created:', { userId: user.id, email: user.email })
        }
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60
            }
        },
        callbackUrl: {
            name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.callback-url` : `next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60
            }
        },
        csrfToken: {
            name: process.env.NODE_ENV === 'production' ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60
            }
        }
    },
    debug: process.env.NODE_ENV === 'development',
    ...(process.env.AUTH_SECRET ? { secret: process.env.AUTH_SECRET } : {})
}