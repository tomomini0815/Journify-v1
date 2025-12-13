import prisma from "@/lib/prisma"
import JournalClient from "./JournalClient"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            redirect("/login")
        }

        const journals = await prisma.journalEntry.findMany({
            where: { userId: user.id },
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
    } catch (error) {
        console.error("Journal page error:", error)
        // Return empty state on error
        return <JournalClient initialJournals={[]} />
    }
}
