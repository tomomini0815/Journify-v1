
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Running manual migration...')
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'none';`)
        console.log('Added approvalStatus column')

        await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;`)
        console.log('Added rejectionReason column')

        console.log('Migration successful')
    } catch (e) {
        console.error('Migration failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
