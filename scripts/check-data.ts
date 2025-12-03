import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function showAllData() {
    try {
        console.log('📊 Checking all data in database...\n')

        const userId = '42c1eda0-18f2-4213-86b0-55b47ee003f3'

        const journals = await prisma.journalEntry.count({ where: { userId } })
        const goals = await prisma.goal.count({ where: { userId } })
        const tasks = await prisma.task.count({ where: { userId } })
        const projects = await prisma.project.count({ where: { userId } })
        const lifeBalance = await prisma.lifeBalanceEntry.count({ where: { userId } })
        const happiness = await prisma.happinessEntry.count({ where: { userId } })
        const visionBoard = await prisma.visionBoardItem.count({ where: { userId } })

        console.log(`📝 Journal Entries: ${journals}`)
        console.log(`🎯 Goals: ${goals}`)
        console.log(`✅ Tasks: ${tasks}`)
        console.log(`📁 Projects: ${projects}`)
        console.log(`⚖️  Life Balance Entries: ${lifeBalance}`)
        console.log(`😊 Happiness Entries: ${happiness}`)
        console.log(`✨ Vision Board Items: ${visionBoard}`)

        console.log('\n❓ Do you want to delete ALL this data? (This is likely test data)')
        console.log('⚠️  If yes, uncomment the deletion code in this script and run again.')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

showAllData()
