import prisma from '../lib/prisma'

// Test script to give yourself a companion
async function giveTestCompanion() {
    try {
        // Get your user ID (replace with your actual user ID)
        const users = await prisma.user.findMany({ take: 1 })
        if (users.length === 0) {
            console.log('No users found. Please log in first.')
            return
        }

        const userId = users[0].id
        console.log(`Adding companion for user: ${userId}`)

        // Get a companion (Cosmic Cat)
        const companion = await prisma.companion.findFirst({
            where: { name: 'Cosmic Cat' }
        })

        if (!companion) {
            console.log('Companion not found. Run seed script first.')
            return
        }

        // Check if user already has this companion
        const existing = await prisma.userCompanion.findUnique({
            where: {
                userId_companionId: {
                    userId,
                    companionId: companion.id
                }
            }
        })

        if (existing) {
            console.log('You already own this companion!')
            return
        }

        // Give companion to user
        const userCompanion = await prisma.userCompanion.create({
            data: {
                userId,
                companionId: companion.id,
                isActive: true // Set as active
            },
            include: {
                companion: true
            }
        })

        console.log('✅ Success! You now own:', userCompanion.companion.name)
        console.log('Visit http://localhost:3000/companions to see it!')
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

giveTestCompanion()
