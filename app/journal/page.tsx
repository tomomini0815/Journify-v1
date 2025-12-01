import prisma from "@/lib/prisma"
import JournalClient from "./JournalClient"

// Mock user ID for now - in production this would come from auth session
const USER_ID = "42c1eda0-18f2-4213-86b0-55b47ee003f3"

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
    const journals = await prisma.journalEntry.findMany({
        where: { userId: USER_ID },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            content: true,
            mood: true,
            tags: true,
            createdAt: true,
        }
    })

    // Serialize dates to strings
    const serializedJournals = journals.map(journal => ({
        ...journal,
        createdAt: journal.createdAt.toISOString(),
    }))

    return <JournalClient initialJournals={serializedJournals} />
}
