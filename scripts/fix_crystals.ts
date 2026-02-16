
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { stats: true, challenges: true }
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`Checking User: ${user.email} (${user.id})`);

        // Get today's challenge
        const challenge = await prisma.dailyChallenge.findFirst({
            where: { userId: user.id },
            orderBy: { date: 'desc' }
        });

        if (!challenge) {
            console.log("  No challenge found.");
            continue;
        }

        // 3. Calculate expected XP based on flags
        let expectedXP = 0;
        if (challenge.journalCreated) {
            expectedXP += 20;
            console.error(`  +20 (Journal)`);
        }

        // Cap tasks at 2 (50 XP max)
        let tasksToCount = challenge.tasksCompleted;
        if (tasksToCount > 2) tasksToCount = 2;

        if (tasksToCount > 0) {
            const taskXP = tasksToCount * 25;
            expectedXP += taskXP;
            console.error(`  +${taskXP} (Tasks: ${challenge.tasksCompleted} -> Capped at ${tasksToCount})`);
        }

        if (challenge.meetingCreated) {
            expectedXP += 30;
            console.error(`  +30 (Meeting)`);
        }

        console.error(`  Current DB XP: ${challenge.xpEarned}`);
        console.error(`  Current User Crystals: ${user.stats?.crystals}`);
        console.error(`  Calculated Expected: ${expectedXP}`);

        // Update UserStats
        const updatedStats = await prisma.userStats.update({
            where: { userId: user.id },
            data: {
                crystals: expectedXP,
                totalXP: expectedXP // Sync Total XP too
            }
        });

        // Sync Challenge XP
        if (challenge.xpEarned !== expectedXP) {
            await prisma.dailyChallenge.update({
                where: { id: challenge.id },
                data: { xpEarned: expectedXP }
            });
            console.error("  Updated Challenge XP.");
        }

        console.error(`  => Updated Crystals to ${updatedStats.crystals}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
