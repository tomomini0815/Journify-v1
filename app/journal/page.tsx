"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { motion } from "framer-motion"
import { Search, Plus, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const journalEntries = [
    {
        id: 1,
        title: "朝の振り返り",
        date: "2025-03-05",
        mood: "😊",
        preview: "瞑想と感謝の練習から一日を始めました。エネルギーに満ち、目標に向かって準備ができています...",
        tags: ["感謝", "朝"]
    },
    {
        id: 2,
        title: "週次レビュー",
        date: "2025-03-03",
        mood: "💭",
        preview: "今週の達成を振り返っています。フィットネス目標で良い進捗があり、読書も終わりました...",
        tags: ["レビュー", "目標"]
    },
    {
        id: 3,
        title: "クリエイティブなひらめき",
        date: "2025-03-01",
        mood: "✨",
        preview: "今日は素晴らしいプロジェクトのアイデアが浮かびました。朝の散歩中にインスピレーションが湧いてきました...",
        tags: ["アイデア", "創造性"]
    },
    {
        id: 4,
        title: "複雑な一日",
        date: "2025-02-28",
        mood: "😔",
        preview: "今日は大変でした。仕事でいくつかのつまずきがありましたが、ストレスへの対処が上手くなっています...",
        tags: ["課題", "成長"]
    },
    {
        id: 5,
        title: "感謝ジャーナル",
        date: "2025-02-26",
        mood: "🙏",
        preview: "今日感謝する3つのこと：家族のサポート、健康、学ぶ機会...",
        tags: ["感謝"]
    },
]

export default function JournalPage() {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-2">ジャーナル</h1>
                    <p className="text-white/60">あなたの思考を記録し、成長の軌跡を追う</p>
                </motion.div>
            </div>

            {/* Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
            >
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                        type="text"
                        placeholder="ジャーナルを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 bg-white/5 border-white/10 focus:border-emerald-400 h-12 rounded-xl"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        日付
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        フィルター
                    </Button>
                </div>

                {/* New Entry Button */}
                <Link href="/journal/new">
                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 h-12 rounded-xl">
                        <Plus className="w-5 h-5 mr-2" />
                        新規記録
                    </Button>
                </Link>
            </motion.div>

            {/* Journal Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {journalEntries.map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <Link href={`/journal/${entry.id}`}>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer group h-full flex flex-col">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                                            {entry.title}
                                        </h3>
                                        <p className="text-sm text-white/60">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <span className="text-3xl">{entry.mood}</span>
                                </div>

                                {/* Preview */}
                                <p className="text-white/70 text-sm mb-4 line-clamp-3 flex-1">
                                    {entry.preview}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {entry.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </DashboardLayout>
    )
}
