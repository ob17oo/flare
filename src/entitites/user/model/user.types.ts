export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR'

export interface User {
    id: string,
    email: string,
    password: string,
    image?: string,
    role: UserRole,
    balance: number,
    discount: number
}