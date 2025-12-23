import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60
    },
    pages: {
        signIn: '/login',
        signOut: '/signOut',
    },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            async authorize(credentials){
                    if(!credentials?.email || !credentials?.password){
                        throw new Error('Введите Email и пароль')
                    }

                    const user = await prisma.user.findUnique({
                        where: {email: credentials.email},
                    })
                    if(!user || !user.password){
                        throw new Error('Пользователь не найден')
                    }

                    const passwordIsValid = await compare(
                        credentials.password,
                        user.password
                    )
                    if(!passwordIsValid){
                        throw new Error('Неверный пароль')
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        login: user.login,
                        image: user.image,
                        role: user.role,
                        balance: user.balance,
                        discount: user.discount
                    }
                }
        })
    ],
    callbacks: {
        async jwt({token,user,trigger}){
            if(user){
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image;
                token.balance = user.balance;
                token.discount = user.discount;
            }

            if(trigger === 'update'){
                const updateUser = await prisma.user.findUnique({
                    where: {
                        id: parseInt(token.id as string)
                    },
                    select: {
                        balance: true,
                        discount: true,
                        image: true,
                        login: true
                    }
                })
                if(updateUser){
                    token.balance = updateUser.balance
                    token.discount = updateUser.discount
                    token.login = updateUser.login
                    token.image = updateUser.image
                }
            }

            return token
        },
        async session({session, token}){
            if(token && session.user){
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.login as string
                session.user.image = token.image as string
                session.user.balance = token.balance as number
                session.user.discount = token.discount as number
            }
            return session
        }
    },

}