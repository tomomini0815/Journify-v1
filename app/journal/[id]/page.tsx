"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Tag, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

interface Journal {
    id: string
    title: string
    content: string
    mood: string
    tags: string[]
    createdAt: string
}

export default function JournalDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [journal, setJournal] = useState<Journal | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                const res = await fetch(`/api/journal/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setJournal(data)
                } else {
                    router.push("/journal")
                }
            } catch (error) {
                console.error("Failed to fetch journal", error)
                router.push("/journal")
            } finally {
                setIsLoading(false)
            }
        }
        if (params.id) {
            fetchJournal()
        }
    }, [params.id, router])

    const handleDelete = async () => {
        if (!confirm("本当にこのジャーナルを削除しますか？")) return

        try {
            const res = await fetch(`/api/journal/${params.id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                router.push("/journal")
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete journal", error)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="text-center py-12 text-white/60">読み込み中...</div>
            </DashboardLayout>
        )
    }

    if (!journal) return null

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                {/* Back Button */}
                <Link href="/journal" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    一覧に戻る
                </Link>

                {/* Header */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-4">{journal.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(journal.createdAt).toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short'
                                    })}
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-2">気分:</span>
                                    <span className="text-xl">{journal.mood}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/journal/${params.id}/edit`}>
                                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button variant="destructive" className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Tags */}
                    {journal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {journal.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full flex items-center"
                                >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="h-px bg-white/10 my-6" />

                    {/* Content */}
                    <div
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: journal.content }}
                    />
                </div>
            </motion.div>
        </DashboardLayout>
    )
}
