
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting test-journal-creation...");

    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found!");
        return;
    }
    console.log("Found user:", user.id);

    // 2. Simulare API data
    const mood = 3;
    const finalTags = ["test", "debugging"];
    const summary = "Test Entry Summary";
    const transcript = "Test Entry Content";

    console.log("Attempting to create JournalEntry with:", {
        userId: user.id,
        mood,
        tags: finalTags
    });

    try {
        const linkedJournal = await prisma.journalEntry.create({
            data: {
                userId: user.id,
                title: summary || "音声ジャーナル",
                content: transcript || "（音声のみ）",
                mood: mood, // Int?
                tags: finalTags, // String[]
            }
        });
        console.log("Successfully created linked JournalEntry:", linkedJournal.id);
        console.log("JournalEntry data:", linkedJournal);
    } catch (e) {
        console.error("Failed to create JournalEntry:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
