import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
    prisma: any
}

// Clear hot-reloading cache if the new Deposit model is missing in the global instance
if (globalForPrisma.prisma && !('deposit' in globalForPrisma.prisma)) {
    globalForPrisma.prisma = undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({connectionString})

const adapter = new PrismaPg(pool)

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: [`error`]
    // log: process.env.NODE_ENV === 'development' ? ['query'] : []
})

if(process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
