import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllTestData() {
    try {
        console.log('🗑️  Deleting all test data from production database...\n')

        const userId = '42c1eda0-18f2-4213-86b0-55b47ee003f3'

        // Delete in correct order to respect foreign key constraints
        console.log('Deleting Milestones...')
        const milestones = await prisma.milestone.deleteMany({
            where: {
                project: {
                    userId: userId
                }
            }
        })
        console.log(`✅ Deleted ${milestones.count} milestones`)

        console.log('Deleting Tasks...')
        const tasks = await prisma.task.deleteMany({
            where: { userId: userId }
        })
        console.log(`✅ Deleted ${tasks.count} tasks`)

        console.log('Deleting Projects...')
        const projects = await prisma.project.deleteMany({
            where: { userId: userId }
        })
        console.log(`✅ Deleted ${projects.count} projects`)

        console.log('Deleting Journal Entries...')
        const journals = await prisma.journalEntry.deleteMany({
            where: { userId: userId }
        })
        console.log(`✅ Deleted ${journals.count} journal entries`)

        console.log('Deleting Goals...')
        const goals = await prisma.goal.deleteMany({
            where: { userId: userId }
        })
        console.log(`✅ Deleted ${goals.count} goals`)

        console.log('Deleting Life Balance Entries...')
        const lifeBalance = await prisma.lifeBalanceEntry.deleteMany({
            where: { userId: userId }
        })
        console.log(`✅ Deleted ${lifeBalance.count} life balance entries`)

        console.log('Deleting Happiness Entries...')
        const happiness = await prisma.happinessEntry.deleteMany({
            where: { userId: userId }
        })
        console.log(`✅ Deleted ${happiness.count} happiness entries`)

        console.log('Deleting Vision Board Items...')
        const visionBoard = await prisma.visionBoardItem.deleteMany({
            where: { userId: userId }
        })
        console.log(`✅ Deleted ${visionBoard.count} vision board items`)

        console.log('\n✨ All test data has been deleted successfully!')
        console.log('🔄 The production database is now clean.')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

deleteAllTestData()
