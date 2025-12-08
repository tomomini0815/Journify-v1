
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log('No user found')
        return
    }

    console.log(`Checking data for user: ${user.email}`)

    const count = await prisma.lifeBalanceEntry.count({
        where: { userId: user.id }
    })
    console.log(`Total LifeBalance entries: ${count}`)

    const latest = await prisma.lifeBalanceEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    console.log('Latest 10 entries:')
    latest.forEach(e => {
        console.log(`${e.category}: ${e.score} (Date: ${e.date.toISOString()}, Created: ${e.createdAt.toISOString()})`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
