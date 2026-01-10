
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        await prisma.$connect()
        console.log('Connected successfully.')

        // Check if UserSettings table exists by trying to count
        console.log('Checking UserSettings table...')
        try {
            const count = await prisma.userSettings.count()
            console.log(`UserSettings table exists. Count: ${count}`)

            try {
                // @ts-ignore
                const setting = await prisma.userSettings.findFirst({ select: { showJojo: true } })
                console.log('UserSettings showJojo check:', setting)
            } catch (e: any) {
                console.log('UserSettings showJojo column might be missing:', e.message)
            }
        } catch (e: any) {
            console.error('Error querying UserSettings table:', e.message)
            if (e.message.includes('relation "UserSettings" does not exist') || e.code === 'P2010') {
                console.log('CONCLUSION: Table UserSettings is MISSING.')
            } else if (e.code === 'P2021') {
                console.log('CONCLUSION: Table UserSettings is MISSING (P2021).')
            }
        }

    } catch (e) {
        console.error('Database connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
