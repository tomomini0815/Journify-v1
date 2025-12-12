"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, BookOpen, Feather, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

interface StoryData {
    title: string
    content: string
    stats: {
        taskCount: number
        journalCount: number
        archetype: string
    }
}

export default function StoryClient() {
    const [isLoading, setIsLoading] = useState(false)
    const [story, setStory] = useState<StoryData | null>(null)

    const generateStory = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/story/generate", {
                method: "POST"
            })
            if (res.ok) {
                const data = await res.json()
                setStory(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative font-sans">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0a] to-[#0a0a0a] z-0" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex flex-col min-h-screen">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>ダッシュボードに戻る</span>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-amber-200">AI Biographer Alpha</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!story && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center max-w-lg"
                            >
                                <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <BookOpen className="w-12 h-12 text-white" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                                    Your Epic Story
                                </h1>
                                <p className="text-white/60 text-lg leading-relaxed mb-10">
                                    あなたの日々の記録は、単なるデータではありません。<br />
                                    それは壮大な冒険の軌跡です。<br />
                                    AIがあなたの1週間を物語として紡ぎ出します。
                                </p>
                                <button
                                    onClick={generateStory}
                                    className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Feather className="w-5 h-5" />
                                        物語を生成する
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-white to-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </button>
                            </motion.div>
                        )}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <div className="relative w-20 h-20 mx-auto mb-8">
                                    <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-t-amber-400 border-r-indigo-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
                                </div>
                                <h2 className="text-2xl font-medium text-white mb-2">歴史を紐解いています...</h2>
                                <p className="text-white/40">ジャーナル、タスク、足跡を集めています</p>
                            </motion.div>
                        )}

                        {story && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-2xl bg-[#151515] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 opactiy-50" />
                                <div className="absolute top-4 right-4 text-white/5">
                                    <Feather className="w-32 h-32" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-300 text-xs font-bold rounded-full border border-amber-500/20 uppercase tracking-wider">
                                            {story.stats.archetype}
                                        </span>
                                        <span className="text-white/30 text-xs">
                                            Task: {story.stats.taskCount} / Journal: {story.stats.journalCount}
                                        </span>
                                    </div>

                                    <h2 className="text-3xl font-serif font-bold text-white mb-8 border-b border-white/10 pb-6">
                                        {story.title}
                                    </h2>

                                    <div className="prose prose-invert prose-lg max-w-none text-white/80 font-serif leading-loose whitespace-pre-line mb-10">
                                        {story.content}
                                    </div>

                                    <div className="flex justify-center pt-8 border-t border-white/5">
                                        <button
                                            onClick={generateStory}
                                            className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors text-sm font-medium"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            別の物語を紡ぐ
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
