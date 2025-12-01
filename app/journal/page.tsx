"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Calendar, Filter, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface Journal {
    id: string
    title: string
    content: string
    mood: number
    tags: string[]
    createdAt: string
}

export default function JournalPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [journals, setJournals] = useState<Journal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedMonths, setExpandedMonths] = useState<string[]>([])

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const res = await fetch("/api/journal")
                if (res.ok) {
                    const data = await res.json()
                    setJournals(data)

                    // Default expand the most recent month
                    if (data.length > 0) {
                        const date = new Date(data[0].createdAt)
                        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                        setExpandedMonths([key])
                    }
                }
            } catch (error) {
                console.error("Failed to fetch journals", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchJournals()
    }, [])

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV")
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ""
    }

    // Group journals by month
    const groupedJournals = journals.reduce((acc, journal) => {
        const date = new Date(journal.createdAt)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!acc[key]) acc[key] = []
        acc[key].push(journal)
        return acc
    }, {} as Record<string, Journal[]>)

    const sortedMonths = Object.keys(groupedJournals).sort((a, b) => b.localeCompare(a))

    const toggleMonth = (month: string) => {
        setExpandedMonths(prev =>
            prev.includes(month)
                ? prev.filter(m => m !== month)
                : [...prev, month]
        )
    }

    const calculateAverageHappiness = (monthJournals: Journal[]) => {
        if (monthJournals.length === 0) return 0
        const total = monthJournals.reduce((sum, j) => sum + (j.mood || 0), 0)
        return Math.round((total / monthJournals.length / 5) * 100)
    }

    const formatMonthHeader = (monthKey: string) => {
        const [year, month] = monthKey.split('-')
        return `${year}年${parseInt(month)}月`
    }

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
                className="flex flex-col gap-4 mb-8"
            >
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                        type="text"
                        placeholder="ジャーナルを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 bg-white/5 border-white/10 focus:border-emerald-400 h-12 rounded-xl"
                    />
                </div>

                {/* Filter Buttons and New Entry Button */}
                <div className="flex gap-2 justify-between">
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
                        <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 h-12 rounded-xl">
                            <Plus className="w-5 h-5 mr-2" />
                            新規記録
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Journal Entries List */}
            {isLoading ? (
                <div className="text-center py-12 text-white/60">読み込み中...</div>
            ) : journals.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-white/60 mb-4">まだジャーナルがありません</p>
                    <Link href="/journal/new">
                        <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 rounded-xl">
                            <Plus className="w-5 h-5 mr-2" />
                            最初のジャーナルを作成
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedMonths.map((month, monthIndex) => {
                        const monthJournals = groupedJournals[month]
                        const avgHappiness = calculateAverageHappiness(monthJournals)
                        const isExpanded = expandedMonths.includes(month)

                        return (
                            <motion.div
                                key={month}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: monthIndex * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
                            >
                                {/* Month Header */}
                                <div
                                    onClick={() => toggleMonth(month)}
                                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-xl font-bold">{formatMonthHeader(month)}</h2>
                                        <div className="px-3 py-1 rounded-full bg-white/10 text-sm text-white/80">
                                            平均幸福度: <span className={`font-bold ${avgHappiness >= 80 ? 'text-emerald-400' : avgHappiness >= 60 ? 'text-blue-400' : 'text-yellow-400'}`}>{avgHappiness}</span>
                                        </div>
                                        <span className="text-xs text-white/40">{monthJournals.length}件の記録</span>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-white/40" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-white/40" />
                                    )}
                                </div>

                                {/* Entries Grid */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {monthJournals.map((entry) => (
                                                    <Link href={`/journal/${entry.id}`} key={entry.id}>
                                                        <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-all cursor-pointer group h-full flex flex-col">
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                                        {entry.title}
                                                                    </h3>
                                                                    <p className="text-sm text-white/60">
                                                                        {new Date(entry.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                                                                    </p>
                                                                </div>
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                                    ${entry.mood >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                                                                        entry.mood >= 3 ? 'bg-blue-500/20 text-blue-400' :
                                                                            'bg-yellow-500/20 text-yellow-400'}`}>
                                                                    {entry.mood}
                                                                </div>
                                                            </div>

                                                            {/* Preview */}
                                                            <p className="text-white/70 text-sm mb-4 line-clamp-3 flex-1">
                                                                {stripHtml(entry.content).substring(0, 100)}...
                                                            </p>

                                                            {/* Tags */}
                                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                                {entry.tags.map((tag) => (
                                                                    <span
                                                                        key={tag}
                                                                        className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md"
                                                                    >
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    )
}
