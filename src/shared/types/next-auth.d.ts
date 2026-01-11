import { DefaultSession } from "next-auth"

declare module 'next-auth' {
    interface Session {
        user: {
            id: string,
            email: string,
            login: string,
            image_url: string,
            discount: number,
            role: string,
            balance: number
        } & DefaultSession['user']
    }

    interface User {
        id: string,
        email: string,
        login: string,
        image_url: string,
        discount: number,
        role: string,
        balance: number
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string,
        email: string,
        login: string,
        image_url: string | null,
        discount: number,
        role: string,
        balance: number
    }
}