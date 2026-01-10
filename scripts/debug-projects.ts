// Debug script to check enableProjects setting
import prisma from '../lib/prisma'

async function main() {
    try {
        console.log('Checking UserSettings for enableProjects...\n')

        // Get all user settings
        const allSettings = await prisma.userSettings.findMany({
            select: {
                id: true,
                userId: true,
                enableProjects: true,
                showJojo: true
            }
        })

        console.log('All UserSettings:')
        console.table(allSettings)

        // Check if there are any users without settings
        const usersWithoutSettings = await prisma.user.findMany({
            where: {
                userSettings: null
            },
            select: {
                id: true,
                email: true
            }
        })

        if (usersWithoutSettings.length > 0) {
            console.log('\nUsers without settings:')
            console.table(usersWithoutSettings)
        } else {
            console.log('\nAll users have settings ✓')
        }

    } catch (error: any) {
        console.error('Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
