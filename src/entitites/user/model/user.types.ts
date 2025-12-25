export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR'

export interface User {
    id: string,
    email: string,
    password: string,
    image_url?: string,
    role: UserRole,
    balance: number,
    discount: number
}