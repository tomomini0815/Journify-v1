
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
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
        console.log("Recent Journals:", JSON.stringify(journals, null, 2))
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
