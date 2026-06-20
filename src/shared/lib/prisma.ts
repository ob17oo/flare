import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    pool: Pool | undefined
    adapter: PrismaPg | undefined
}

// Clear hot-reloading cache if the new Deposit or HeroBanner model is missing in the global instance
if (globalForPrisma.prisma && (!('deposit' in globalForPrisma.prisma) || !('heroBanner' in globalForPrisma.prisma))) {
    globalForPrisma.prisma = undefined
    if (globalForPrisma.pool) {
        globalForPrisma.pool.end().catch(err => console.error("Error closing cached Pool:", err))
        globalForPrisma.pool = undefined
    }
    globalForPrisma.adapter = undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
}

export const pool = globalForPrisma.pool ?? new Pool({
    connectionString,
    max: 20, // default is 10, 20 is solid for small production
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
})

const adapter = globalForPrisma.adapter ?? new PrismaPg(pool)

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: [`error`]
    // log: process.env.NODE_ENV === 'development' ? ['query'] : []
})

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
    globalForPrisma.pool = pool
    globalForPrisma.adapter = adapter
}

