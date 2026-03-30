import prisma from "@/lib/prisma"
import JournalClient from "./JournalClient"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { mockDb } from "@/lib/mock-db" // Import mockDb

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
    try {
        const supabase = await createClient()
        let { data: { user }, error: authError } = await supabase.auth.getUser()

        // MOCK USER: allow preview in dev mode
        if ((!user || authError) && process.env.NODE_ENV === 'development') {
            console.log("JournalPage: Using mock user for preview");
            user = { id: 'mock-user-123' } as any;
            authError = null;
        }

        if (authError || !user) {
            redirect("/login")
        }

        let journals: any[] = [];
        let voiceJournals: any[] = [];

        try {
            journals = await prisma.journalEntry.findMany({
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
            });

            voiceJournals = await prisma.voiceJournal.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    transcript: true,
                    aiSummary: true,
                    sentiment: true,
                    mood: true,
                    tags: true,
                    createdAt: true,
                }
            });
        } catch (dbError) {
            const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);
            console.warn("JournalPage: DB Error, checking for mock:", errorMsg);
            if (process.env.NODE_ENV === 'development') {
                // Return persistent mock data from JSON db
                console.log("Fetching persistent mock data...");
                journals = await mockDb.journals.findMany({ where: { userId: user.id } });
                voiceJournals = await mockDb.voiceJournals.findMany({ where: { userId: user.id } });

                // Fallback if empty just to show something? 
                // Maybe not, if empty it means empty state, which is fine.
                // But let's add one sample if absolutely empty to guide user?
                if (journals.length === 0 && voiceJournals.length === 0) {
                    // Maybe don't auto-create, user wants persistence.
                    // But if it's the VERY FIRST run, might be nice.
                    // For now, respect the empty DB.
                }
            } else {
                throw dbError; // Rethrow in production
            }
        }

        // Serialize dates to strings
        const serializedJournals = journals.map(journal => ({
            ...journal,
            createdAt: new Date(journal.createdAt).toISOString(),
        }))

        const serializedVoiceJournals = voiceJournals.map(vj => ({
            ...vj,
            createdAt: new Date(vj.createdAt).toISOString(),
        }))

        return <JournalClient initialJournals={serializedJournals} initialVoiceJournals={serializedVoiceJournals} />
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Journal page error:", errorMsg);
        // Return empty state on error
        return <JournalClient initialJournals={[]} initialVoiceJournals={[]} />
    }
}
