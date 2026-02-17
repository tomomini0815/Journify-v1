import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Clear all journal entries
    const deleteJournals = await prisma.journalEntry.deleteMany({})
    console.log(`Deleted ${deleteJournals.count} journal entries.`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
