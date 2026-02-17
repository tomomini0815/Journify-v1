import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    const entries = await prisma.journalEntry.findMany({
        take: 10,
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            createdAt: true,
            mood: true,
            title: true,
            content: true
        }
    })

    fs.writeFileSync('debug_output.json', JSON.stringify(entries, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
