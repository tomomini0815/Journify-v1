"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Calendar, Filter, ChevronDown, ChevronUp, Mic, PenTool, BrainCircuit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import MindMapViewer from "@/components/MindMapViewer"

interface Journal {
    id: string
    title: string
    content: string
    mood: number | null
    tags: string[]
    createdAt: string
}

interface VoiceJournal {
    id: string
    transcript: string
    aiSummary: string
    sentiment: string | null
    mood: number | null
    tags: string[]
    createdAt: string
}

interface JournalClientProps {
    initialJournals: Journal[]
    initialVoiceJournals: VoiceJournal[]
}

export default function JournalClient({ initialJournals, initialVoiceJournals }: JournalClientProps) {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab')
    const [activeTab, setActiveTab] = useState<"written" | "voice" | "mindmap">(
        tabParam === 'voice' ? 'voice' : tabParam === 'mindmap' ? 'mindmap' : 'written'
    )
    const [selectedMindMap, setSelectedMindMap] = useState<any>(null);

    // Sync activeTab with URL params
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'voice' || tab === 'written' || tab === 'mindmap') {
            setActiveTab(tab as "written" | "voice" | "mindmap");
        }
    }, [searchParams]);

    const [searchQuery, setSearchQuery] = useState("")
    const [journals, setJournals] = useState<Journal[]>(initialJournals)
    const [voiceJournals, setVoiceJournals] = useState<VoiceJournal[]>(initialVoiceJournals)
    const [expandedMonths, setExpandedMonths] = useState<string[]>([])


    // Filter States
    const [showDateFilter, setShowDateFilter] = useState(false)
    const [showContentFilter, setShowContentFilter] = useState(false)
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
    const [selectedMoods, setSelectedMoods] = useState<number[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    // Get unique tags from all journals
    const allTags = Array.from(new Set(initialJournals.flatMap(j => j.tags))).sort()

    // Initialize expanded months
    useEffect(() => {
        if (activeTab === 'written' && initialJournals.length > 0) {
            const date = new Date(initialJournals[0].createdAt)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            setExpandedMonths([key])
        } else if (activeTab === 'voice' && initialVoiceJournals.length > 0) {
            const date = new Date(initialVoiceJournals[0].createdAt)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            setExpandedMonths([key])
        }
    }, [activeTab])

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV")
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ""
    }

    // Filter journals based on all criteria
    const filteredJournals = journals.filter(journal => {
        // Search Query
        const matchesSearch =
            journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stripHtml(journal.content).toLowerCase().includes(searchQuery.toLowerCase()) ||
            journal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        // Date Range
        const journalDate = new Date(journal.createdAt).toISOString().split('T')[0]
        const matchesDate =
            (!dateRange.start || journalDate >= dateRange.start) &&
            (!dateRange.end || journalDate <= dateRange.end)

        // Mood
        const matchesMood = selectedMoods.length === 0 || (journal.mood !== null && selectedMoods.includes(journal.mood))

        // Tags
        const matchesTags = selectedTags.length === 0 || journal.tags.some(tag => selectedTags.includes(tag))

        return matchesSearch && matchesDate && matchesMood && matchesTags
    })

    // Filter voice journals
    const filteredVoiceJournals = voiceJournals.filter(vj => {
        if (!searchQuery) return true
        return vj.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vj.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vj.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    })

    // Group journals by month
    const groupedJournals = filteredJournals.reduce((acc, journal) => {
        const date = new Date(journal.createdAt)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!acc[key]) acc[key] = []
        acc[key].push(journal)
        return acc
    }, {} as Record<string, Journal[]>)

    // Group voice journals by month
    const groupedVoiceJournals = filteredVoiceJournals.reduce((acc, vj) => {
        const date = new Date(vj.createdAt)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!acc[key]) acc[key] = []
        acc[key].push(vj)
        return acc
    }, {} as Record<string, VoiceJournal[]>)

    const sortedMonths = Object.keys(groupedJournals).sort((a, b) => b.localeCompare(a))
    const sortedVoiceMonths = Object.keys(groupedVoiceJournals).sort((a, b) => b.localeCompare(a))

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

    const calculateAverageMood = (monthVoiceJournals: VoiceJournal[]) => {
        const moodsWithValues = monthVoiceJournals.filter(vj => vj.mood !== null)
        if (moodsWithValues.length === 0) return null
        const total = moodsWithValues.reduce((sum, vj) => sum + (vj.mood || 0), 0)
        return Math.round(total / moodsWithValues.length)
    }

    const formatMonthHeader = (monthKey: string) => {
        const [year, month] = monthKey.split('-')
        return `${year}年${parseInt(month)}月`
    }

    const toggleMood = (mood: number) => {
        setSelectedMoods(prev =>
            prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
        )
    }

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
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
                    <h1 className="text-[28px] font-bold mb-2">ジャーナル</h1>
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
                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab("written")}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "written"
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <PenTool className="w-4 h-4" />
                        テキストジャーナル
                    </button>
                    <button
                        onClick={() => setActiveTab("voice")}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "voice"
                            ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Mic className="w-4 h-4" />
                        音声ジャーナル
                    </button>
                    <button
                        onClick={() => setActiveTab("mindmap")}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "mindmap"
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <BrainCircuit className="w-4 h-4" />
                        AIマインドマップ
                    </button>
                </div>

                {activeTab !== "mindmap" && (
                    <>
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <Input
                                type="text"
                                placeholder={activeTab === "written" ? "ジャーナルを検索..." : "音声ジャーナルを検索..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 bg-white/5 border-white/10 focus:border-emerald-400 h-12 rounded-xl"
                            />
                        </div>

                        {/* Filter Buttons and New Entry Button */}
                        <div className="flex gap-2 justify-between relative z-20">
                            <div className="flex gap-2">
                                {/* Date Filter */}
                                <div className="relative">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDateFilter(!showDateFilter)
                                            setShowContentFilter(false)
                                        }}
                                        className={`bg-white/5 border-white/10 hover:bg-white/10 rounded-xl ${showDateFilter || dateRange.start || dateRange.end ? 'border-emerald-500/50 text-emerald-400' : ''}`}
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        日付
                                    </Button>
                                    {showDateFilter && (
                                        <div className="absolute top-full left-0 mt-2 p-4 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl w-72 z-30">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs text-white/60 mb-1 block">開始日</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.start}
                                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white [color-scheme:dark]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-white/60 mb-1 block">終了日</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.end}
                                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white [color-scheme:dark]"
                                                    />
                                                </div>
                                                <div className="pt-2 border-t border-white/10 flex justify-end">
                                                    <button
                                                        onClick={() => {
                                                            setDateRange({ start: "", end: "" })
                                                            setShowDateFilter(false)
                                                        }}
                                                        className="text-xs text-white/40 hover:text-white transition-colors"
                                                    >
                                                        リセット
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Filter */}
                                <div className="relative">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowContentFilter(!showContentFilter)
                                            setShowDateFilter(false)
                                        }}
                                        className={`bg-white/5 border-white/10 hover:bg-white/10 rounded-xl ${showContentFilter || selectedMoods.length > 0 || selectedTags.length > 0 ? 'border-emerald-500/50 text-emerald-400' : ''}`}
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        フィルター
                                    </Button>
                                    {showContentFilter && (
                                        <div className="absolute top-full left-0 mt-2 p-4 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl w-72 z-30">
                                            <div className="space-y-4">
                                                {/* Mood Filter */}
                                                <div>
                                                    <h4 className="text-xs font-medium text-white/60 mb-2">気分</h4>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(mood => (
                                                            <button
                                                                key={mood}
                                                                onClick={() => toggleMood(mood)}
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                                                    ${selectedMoods.includes(mood)
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                                            >
                                                                {mood}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tags Filter */}
                                                <div>
                                                    <h4 className="text-xs font-medium text-white/60 mb-2">タグ</h4>
                                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                                        {allTags.map(tag => (
                                                            <button
                                                                key={tag}
                                                                onClick={() => toggleTag(tag)}
                                                                className={`px-2 py-1 rounded-md text-xs transition-all
                                                                    ${selectedTags.includes(tag)
                                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                                                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'}`}
                                                            >
                                                                #{tag}
                                                            </button>
                                                        ))}
                                                        {allTags.length === 0 && (
                                                            <span className="text-xs text-white/20">タグがありません</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-white/10 flex justify-end">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMoods([])
                                                            setSelectedTags([])
                                                            setShowContentFilter(false)
                                                        }}
                                                        className="text-xs text-white/40 hover:text-white transition-colors"
                                                    >
                                                        リセット
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* New Entry Button */}
                            <Link href={activeTab === "written" ? "/journal/new" : "/journal/new?mode=voice"}>
                                {activeTab === "written" ? (
                                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 h-12 rounded-xl">
                                        <Plus className="w-5 h-5 mr-2" />
                                        新規記録
                                    </Button>
                                ) : (
                                    <Button className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 h-12 rounded-xl shadow-lg shadow-cyan-500/20">
                                        <Mic className="w-5 h-5 mr-2" />
                                        音声記録
                                    </Button>
                                )}
                            </Link>
                        </div>
                    </>
                )}
            </motion.div >

            {/* Content Area */}
            {activeTab === "mindmap" ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    {/* Saved Mind Maps List (Horizontal Scroll) */}
                    <SavedMindMapsList onSelectMap={(map: any) => setSelectedMindMap(map)} />

                    <MindMapViewer initialData={selectedMindMap} />
                </motion.div>
            ) : (
                <div className="space-y-6">
                    {activeTab === "written" ? (
                        // Written Journals Display
                        sortedMonths.map((month, monthIndex) => {
                            const monthJournals = groupedJournals[month]
                            if (!monthJournals) return null
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
                                        <div className="flex items-center gap-2 md:gap-4 whitespace-nowrap">
                                            <h2 className="text-base md:text-xl font-bold">{formatMonthHeader(month)}</h2>
                                            <div className="px-2 md:px-3 py-1 rounded-full bg-white/10 text-xs md:text-sm text-white/80">
                                                平均幸福度: <span className={`font-bold ${avgHappiness >= 80 ? 'text-emerald-400' : avgHappiness >= 60 ? 'text-blue-400' : 'text-yellow-400'}`}>{avgHappiness}</span>
                                            </div>
                                            <span className="text-[10px] md:text-xs text-white/40">{monthJournals.length}件の記録</span>
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
                                                                    {entry.mood !== null && (
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                                                            ${entry.mood >= 4 ? 'bg-emerald-500/20 text-emerald-400' :
                                                                                entry.mood >= 3 ? 'bg-blue-500/20 text-blue-400' :
                                                                                    'bg-yellow-500/20 text-yellow-400'}`}>
                                                                            {entry.mood}
                                                                        </div>
                                                                    )}
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
                        })
                    ) : (
                        // Voice Journals Display - Month Grouped
                        sortedVoiceMonths.map((month, monthIndex) => {
                            const monthVoiceJournals = groupedVoiceJournals[month]
                            if (!monthVoiceJournals) return null
                            const avgMood = calculateAverageMood(monthVoiceJournals)
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
                                        <div className="flex items-center gap-2 md:gap-4 whitespace-nowrap">
                                            <h2 className="text-base md:text-xl font-bold">{formatMonthHeader(month)}</h2>
                                            {avgMood !== null && (
                                                <div className="px-2 md:px-3 py-1 rounded-full bg-white/10 text-xs md:text-sm text-white/80">
                                                    平均気分: <span className={`font-bold ${avgMood >= 7 ? 'text-emerald-400' : avgMood >= 5 ? 'text-blue-400' : avgMood >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{avgMood}</span>/10
                                                </div>
                                            )}
                                            <span className="text-[10px] md:text-xs text-white/40">{monthVoiceJournals.length}件の記録</span>
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
                                                    {monthVoiceJournals.map((vj) => (
                                                        <Link href={`/voice-journal/${vj.id}`} key={vj.id}>
                                                            <div className="bg-gradient-to-br from-cyan-600/10 to-emerald-500/10 border border-cyan-600/20 rounded-2xl p-5 hover:border-cyan-600/40 transition-all cursor-pointer group h-full flex flex-col">
                                                                {/* Header */}
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <div className="flex items-center justify-center flex-shrink-0">
                                                                            <Mic className="w-4 h-4 text-emerald-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm text-white/60 truncate">
                                                                                {new Date(vj.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {vj.mood !== null && (
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                                                                        ${vj.mood >= 7 ? 'bg-emerald-500/20 text-emerald-400' :
                                                                                vj.mood >= 5 ? 'bg-blue-500/20 text-blue-400' :
                                                                                    vj.mood >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                                        'bg-red-500/20 text-red-400'}`}>
                                                                            {vj.mood}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Preview */}
                                                                <p className="text-white/70 text-sm mb-4 line-clamp-3 flex-1">
                                                                    {vj.transcript}
                                                                </p>

                                                                {/* Tags */}
                                                                <div className="mt-auto">
                                                                    {vj.tags && vj.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                                            {vj.tags.map((tag, i) => (
                                                                                <span
                                                                                    key={i}
                                                                                    className="px-2 py-1 bg-cyan-600/20 text-cyan-300 rounded-md text-xs"
                                                                                >
                                                                                    #{tag}
                                                                                </span>
                                                                            ))}
                                                                            {vj.tags.length > 3 && (
                                                                                <span className="text-xs text-white/40">+{vj.tags.length - 3}</span>
                                                                            )}
                                                                        </div>
                                                                    )}
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
                        })
                    )}
                </div>
            )
            }
        </DashboardLayout >
    )
}

function SavedMindMapsList({ onSelectMap }: { onSelectMap: (map: any) => void }) {
    const [savedMaps, setSavedMaps] = useState<any[]>([])

    useEffect(() => {
        const fetchMaps = async () => {
            const res = await fetch('/api/mindmap/list');
            if (res.ok) {
                try {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setSavedMaps(data);
                    } else {
                        console.error("Invalid mind map data:", data);
                        setSavedMaps([]);
                    }
                } catch (e) {
                    console.error("Failed to parse mind map list:", e);
                    setSavedMaps([]);
                }
            }
        };
        fetchMaps();
    }, []);

    if (savedMaps.length === 0) return null;

    return (
        <div className="mb-4">
            <h3 className="text-white/60 text-sm mb-2 px-2">保存されたマップ</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar">
                {savedMaps.map(map => (
                    <button
                        key={map.id}
                        onClick={() => onSelectMap(map)}
                        className="flex-shrink-0 w-48 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left group"
                    >
                        <h4 className="font-bold text-white mb-1 truncate group-hover:text-amber-400 transition-colors">{map.title}</h4>
                        <p className="text-xs text-white/40">{new Date(map.createdAt).toLocaleDateString()}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}
