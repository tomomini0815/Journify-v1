
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking database counts...')
    const userCount = await prisma.user.count()
    const journalCount = await prisma.journalEntry.count()

    console.log(`Users: ${userCount}`)
    console.log(`JournalEntries: ${journalCount}`)

    const users = await prisma.user.findMany({ select: { id: true } })
    console.log('User IDs:', users.map(u => u.id))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
