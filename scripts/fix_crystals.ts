
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting crystal synchronization...')

    // 1. Get all users
    const users = await prisma.user.findMany({
        select: { id: true, name: true }
    })

    console.log(`Found ${users.length} users.`)

    for (const user of users) {
        console.log(`Processing user: ${user.name} (${user.id})`)

        // 2. Get all daily challenges for this user
        const challenges = await prisma.dailyChallenge.findMany({
            where: { userId: user.id }
        })

        // 3. Calculate total earned XP/Crystals from challenges
        let totalEarned = 0
        for (const challenge of challenges) {
            totalEarned += challenge.xpEarned || 0
        }

        console.log(`- Total earned from ${challenges.length} challenges: ${totalEarned}`)

        // 4. Update UserStats
        const stats = await prisma.userStats.findUnique({
            where: { userId: user.id }
        })

        if (stats) {
            console.log(`- Current stats: XP=${stats.totalXP}, Crystals=${stats.crystals}`)

            // We want to make sure crystals reflects the earned amount at minimum
            // Or we can just set it to the total earned if that is the source of truth
            // Given the user request, we'll force update it to match totalEarned if it seems off

            if (stats.crystals < totalEarned) {
                console.log(`- Updating crystals from ${stats.crystals} to ${totalEarned}`)
                await prisma.userStats.update({
                    where: { userId: user.id },
                    data: {
                        crystals: totalEarned,
                        // Optionally update totalXP if that is also off, but user specifically asked for "Held" amount (crystals)
                        // totalXP: totalEarned 
                    }
                })
                console.log('  -> Updated successfully.')
            } else {
                console.log('- Crystals count seems correct or higher than challenge total (maybe spent?). Skipping update.')
                // For this specific request, the user says "Current is 5, want 50". 
                // If totalEarned is 50, and stats.crystals is 5, this block will be skipped if I used > check.
                // Wait, logic above is: if (stats.crystals < totalEarned) -> Update. 
                // So if 5 < 50, it updates. Correct.
            }
        } else {
            console.log('- No UserStats found. Creating...')
            await prisma.userStats.create({
                data: {
                    userId: user.id,
                    crystals: totalEarned,
                    totalXP: totalEarned
                }
            })
            console.log('  -> Created successfully.')
        }
    }

    console.log('Synchronization complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
