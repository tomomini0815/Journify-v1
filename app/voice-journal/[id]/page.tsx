import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import VoiceJournalDetailClient from "./VoiceJournalDetailClient"

export const dynamic = 'force-dynamic'

export default async function VoiceJournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = await createClient()
        let { data: { user }, error: authError } = await supabase.auth.getUser()

        // MOCK USER: allow preview in dev mode
        if ((!user || authError) && process.env.NODE_ENV === 'development') {
            console.log("VoiceJournalDetail: Using mock user for preview");
            user = { id: 'mock-user-123' } as any;
            authError = null;
        }

        if (authError || !user) {
            redirect("/login")
        }

        let voiceJournal = null;
        try {
            voiceJournal = await prisma.voiceJournal.findUnique({
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
        } catch (dbError) {
            console.warn("VoiceJournalDetail: DB Error, checking for mock", dbError);
            // Return mock data if in dev mode
            if (process.env.NODE_ENV === 'development') {
                voiceJournal = {
                    id: id,
                    transcript: "これはプレビュー用の音声ジャーナル詳細です。",
                    aiSummary: "ここにAIによる要約が表示されます。",
                    sentiment: "positive",
                    mood: 4,
                    tags: ["mock", "preview"],
                    audioUrl: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: user.id
                } as any;
            } else {
                throw dbError;
            }
        }

        if (!voiceJournal) {
            if (process.env.NODE_ENV === 'development') {
                // Fallback if ID not found but in dev
                voiceJournal = {
                    id: id,
                    transcript: "Mock transcript for ID: " + id,
                    aiSummary: "Mock summary",
                    sentiment: "neutral",
                    mood: 3,
                    tags: ["mock"],
                    audioUrl: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: user.id
                } as any;
            } else {
                redirect("/journal?tab=voice")
            }
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
