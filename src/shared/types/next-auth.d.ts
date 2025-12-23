import { DefaultSession } from "next-auth"

declare module 'next-auth' {
    interface Session {
        user: {
            id: string,
            email: string,
            image?: string,
            discount: number,
            balance: number
        } & DefaultSession['user']
    }

    interface User {
        id: string,
        email: string,
        image?: string,
        discount: number,
        balance: number,
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string,
        email: string,
        image?: string,
        discount: number,
        balance: number,
    }
}