import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

const createPrismaClient = () => {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
