import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    const now = new Date()
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(now.getDate() - 7)
    oneWeekAgo.setHours(0, 0, 0, 0)

    const oneMonthAgo = new Date(now)
    oneMonthAgo.setMonth(now.getMonth() - 1)
    oneMonthAgo.setHours(0, 0, 0, 0)

    const total = await prisma.journalEntry.count()
    const moodTotal = await prisma.journalEntry.count({ where: { mood: { not: null } } })
    const weekCount = await prisma.journalEntry.count({
        where: { mood: { not: null }, createdAt: { gte: oneWeekAgo } }
    })
    const monthCount = await prisma.journalEntry.count({
        where: { mood: { not: null }, createdAt: { gte: oneMonthAgo } }
    })

    const output = {
        total,
        moodTotal,
        weekCount,
        monthCount,
        now: now.toISOString(),
        oneWeekAgo: oneWeekAgo.toISOString(),
        oneMonthAgo: oneMonthAgo.toISOString()
    }

    console.log(JSON.stringify(output, null, 2))
    fs.writeFileSync('check_output.json', JSON.stringify(output, null, 2))
}

main().finally(() => prisma.$disconnect())
