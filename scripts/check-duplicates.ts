
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for duplicate/overlapping entries...");

    const voiceJournals = await prisma.voiceJournal.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    console.log(`Total Voice Journals: ${voiceJournals.length}`);

    let potentialDuplicates = 0;

    for (const vj of voiceJournals) {
        // Find JournalEntry for same user within +/- 10 seconds
        const windowMs = 60000; // 60 seconds window
        const time = new Date(vj.createdAt).getTime();

        const duplicates = await prisma.journalEntry.findMany({
            where: {
                userId: vj.userId,
                createdAt: {
                    gte: new Date(time - windowMs),
                    lte: new Date(time + windowMs)
                }
            }
        });

        if (duplicates.length > 0) {
            potentialDuplicates++;
            console.log(`[DUPLICATE DETECTED] VoiceJournal ID: ${vj.id} (${vj.createdAt.toISOString()})`);
            duplicates.forEach(d => {
                console.log(`  -> Matches JournalEntry ID: ${d.id} (${d.createdAt.toISOString()}) - Title: ${d.title.substring(0, 20)}...`);
            });
        }
    }

    console.log(`\nSummary:`);
    console.log(`Total Voice Journals: ${voiceJournals.length}`);
    console.log(`Potential Duplicates (Linked by Time): ${potentialDuplicates}`);
    if (potentialDuplicates > 0) {
        console.log("WARN: These entries are likely being double-counted in the current stats aggregation.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
