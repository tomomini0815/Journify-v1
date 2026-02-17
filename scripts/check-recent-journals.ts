
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const journals = await prisma.journalEntry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            id: true,
            createdAt: true,
            mood: true,
            title: true
        }
    })

    console.log("Recent Journals:", journals)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
