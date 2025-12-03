import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearTestData() {
    try {
        console.log('🗑️  Clearing test data from production database...')

        // Delete all data for test users (you can specify test user IDs here)
        // For now, this script will show what would be deleted
        // Uncomment the actual deletion commands when you're ready

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
            },
        })

        console.log('\n📋 Current users in database:')
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (${user.name || 'No name'}) - ID: ${user.id}`)
        })

        console.log('\n⚠️  To delete a specific user and all their data, uncomment the deletion code in this script.')
        console.log('⚠️  Make sure to specify the correct user ID to avoid deleting production data!')

        // Example: Delete a specific test user and all their data
        // const TEST_USER_ID = 'your-test-user-id-here'
        // 
        // await prisma.journalEntry.deleteMany({
        //   where: { userId: TEST_USER_ID }
        // })
        // 
        // await prisma.goal.deleteMany({
        //   where: { userId: TEST_USER_ID }
        // })
        // 
        // await prisma.lifeBalanceEntry.deleteMany({
        //   where: { userId: TEST_USER_ID }
        // })
        // 
        // await prisma.happinessEntry.deleteMany({
        //   where: { userId: TEST_USER_ID }
        // })
        // 
        // await prisma.visionBoardItem.deleteMany({
        //   where: { userId: TEST_USER_ID }
        // })
        // 
        // await prisma.task.deleteMany({
        //   where: { userId: TEST_USER_ID }
        // })
        // 
        // await prisma.project.deleteMany({
        //   where: { userId: TEST_USER_ID }
        // })
        // 
        // await prisma.userSettings.deleteMany({
        //   where: { userId: TEST_USER_ID }
        // })
        // 
        // await prisma.user.delete({
        //   where: { id: TEST_USER_ID }
        // })
        // 
        // console.log(`✅ Deleted test user ${TEST_USER_ID} and all their data`)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

clearTestData()
