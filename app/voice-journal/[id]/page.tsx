import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import VoiceJournalDetailClient from "./VoiceJournalDetailClient"

export const dynamic = 'force-dynamic'

export default async function VoiceJournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            redirect("/login")
        }

        const voiceJournal = await prisma.voiceJournal.findUnique({
            where: { id },
            select: {
                id: true,
                transcript: true,
                aiSummary: true,
                sentiment: true,
                mood: true,
                tags: true,
                audioUrl: true,
                createdAt: true,
                updatedAt: true,
                userId: true,
            }
        })

        if (!voiceJournal) {
            redirect("/journal?tab=voice")
        }

        // Check ownership
        if (voiceJournal.userId !== user.id) {
            redirect("/journal?tab=voice")
        }

        // Serialize dates
        const serializedVoiceJournal = {
            ...voiceJournal,
            createdAt: voiceJournal.createdAt.toISOString(),
            updatedAt: voiceJournal.updatedAt.toISOString(),
        }

        return <VoiceJournalDetailClient voiceJournal={serializedVoiceJournal} />
    } catch (error) {
        console.error("Voice journal detail page error:", error)
        redirect("/journal?tab=voice")
    }
}
