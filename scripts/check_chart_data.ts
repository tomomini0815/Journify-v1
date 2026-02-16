
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { stats: true }
    });

    for (const user of users) {
        console.log(`User: ${user.email} (${user.id})`);

        const journalCount = await prisma.journalEntry.count({
            where: { userId: user.id }
        });
        console.log(`  Total Journals: ${journalCount}`);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentJournalsWithMood = await prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                mood: { gt: 0 },
                createdAt: { gte: thirtyDaysAgo }
            },
            select: { id: true, mood: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`  Journals with mood (last 30 days): ${recentJournalsWithMood.length}`);
        recentJournalsWithMood.forEach(j => {
            console.log(`    - ID: ${j.id}, Mood: ${j.mood}, Created: ${j.createdAt.toISOString()}`);
        });

        const lifeBalanceEntries = await prisma.lifeBalanceEntry.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log(`  Recent Life Balance entries: ${lifeBalanceEntries.length}`);
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
