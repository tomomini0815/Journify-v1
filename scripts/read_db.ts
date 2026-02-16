
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { stats: true }
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`User: ${user.email} (${user.id})`);
        console.log(`  Stats: Crystals=${user.stats?.crystals}, XP=${user.stats?.totalXP}, Level=${user.stats?.level}`);

        const challenges = await prisma.dailyChallenge.findMany({
            where: { userId: user.id },
            orderBy: { date: 'desc' },
            take: 3
        });

        for (const c of challenges) {
            console.log(`  Challenge ${c.date.toISOString().split('T')[0]}: Journal=${c.journalCreated}, Tasks=${c.tasksCompleted}, XP=${c.xpEarned}, Completed=${c.completed}`);
        }
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
