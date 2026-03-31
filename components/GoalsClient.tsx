"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, CheckCircle2, Circle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddGoalModal } from "@/components/AddGoalModal"
import { UnifiedTabs } from "@/components/ui/unified-tabs"

interface Goal {
    id: string
    title: string
    description: string | null
    targetDate: Date | null
    priority: string
    progress: number
    timeframe: string
}

interface GoalsClientProps {
    initialGoals: Goal[]
}

export function GoalsClient({ initialGoals }: GoalsClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [goals, setGoals] = useState<Goal[]>(initialGoals)
    const [activeTab, setActiveTab] = useState<'short' | 'mid' | 'long'>('short')

    const handleAddGoal = async (newGoal: { title: string; description: string; deadline: string; priority: string }) => {
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newGoal.title,
                    description: newGoal.description,
                    targetDate: newGoal.deadline,
                    priority: newGoal.priority,
                    timeframe: activeTab,
                    progress: 0,
                }),
            })
            if (res.ok) {
                const goal = await res.json()
                setGoals([{
                    id: goal.id,
                    title: goal.title,
                    description: goal.description,
                    targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
                    priority: goal.priority || "medium",
                    progress: goal.progress,
                    timeframe: goal.timeframe || "short",
                }, ...goals])
            }
        } catch (error) {
            console.error("Failed to add goal", error)
        }
    }

    const updateProgress = async (id: string, newProgress: number) => {
        const goal = goals.find(g => g.id === id)
        if (!goal) return

        setGoals(goals.map(g =>
            g.id === id ? { ...g, progress: newProgress } : g
        ))

        try {
            await fetch(`/api/goals/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ progress: newProgress }),
            })
        } catch (error) {
            console.error("Failed to update goal progress", error)
            setGoals(goals.map(g => g.id === id ? goal : g))
        }
    }

    const toggleComplete = async (id: string) => {
        const goal = goals.find(g => g.id === id)
        if (!goal) return

        const newProgress = goal.progress === 100 ? 0 : 100
        updateProgress(id, newProgress)
    }

    const deleteGoal = async (id: string) => {
        if (!confirm("本当にこの目標を削除しますか?")) return

        try {
            const res = await fetch(`/api/goals/${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setGoals(goals.filter(goal => goal.id !== id))
            }
        } catch (error) {
            console.error("Failed to delete goal", error)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "text-red-400 bg-red-500/20"
            case "medium": return "text-yellow-400 bg-yellow-500/20"
            case "low": return "text-green-400 bg-green-500/20"
            default: return "text-white/60 bg-white/10"
        }
    }

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case "high": return "高"
            case "medium": return "中"
            case "low": return "低"
            default: return priority
        }
    }

    const filteredGoals = goals
        .filter(goal => goal.timeframe === activeTab)
        .sort((a, b) => {
            if (a.progress === 100 && b.progress < 100) return 1
            if (a.progress < 100 && b.progress === 100) return -1
            return 0
        })

    return (
        <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-[28px] font-bold mb-2">目標</h1>
                    <p className="text-white/60">進捗を追跡し、夢を実現する</p>
                </motion.div>

                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    目標を追加
                </Button>
            </div>

            {/* Timeframe Tabs */}
            <div className="mb-8 border-b border-white/10">
                <UnifiedTabs
                    tabs={[
                        { id: 'short', label: '短期目標', count: goals.filter(g => g.timeframe === 'short').length },
                        { id: 'mid', label: '中期目標', count: goals.filter(g => g.timeframe === 'mid').length },
                        { id: 'long', label: '長期目標', count: goals.filter(g => g.timeframe === 'long').length }
                    ]}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as 'short' | 'mid' | 'long')}
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <p className="text-white/60 text-sm mb-1">総目標数</p>
                    <p className="text-2xl md:text-3xl font-bold">{filteredGoals.length}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <p className="text-white/60 text-sm mb-1">達成済み</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">
                        {filteredGoals.filter(g => g.progress === 100).length}
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <p className="text-white/60 text-sm mb-1">進行中</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-400">
                        {filteredGoals.filter(g => g.progress < 100).length}
                    </p>
                </motion.div>
            </div>

            {/* Goals List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {filteredGoals.length === 0 ? (
                    <div className="text-center py-12 text-white/60 col-span-full">
                        {activeTab === 'short' && '短期目標がまだありません。新しい目標を追加しましょう!'}
                        {activeTab === 'mid' && '中期目標がまだありません。新しい目標を追加しましょう!'}
                        {activeTab === 'long' && '長期目標がまだありません。新しい目標を追加しましょう!'}
                    </div>
                ) : (
                    filteredGoals.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 ${goal.progress === 100 ? "opacity-40" : ""}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleComplete(goal.id)}
                                    className="mt-1 flex-shrink-0"
                                >
                                    {goal.progress === 100 ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-white/40 hover:text-white/60 transition-colors" />
                                    )}
                                </button>

                                {/* Content Container */}
                                <div className="flex-1 min-w-0">
                                    {/* Top Row: Title + Priority + Delete */}
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className={`text-base font-semibold truncate ${goal.progress === 100 ? "line-through text-white/40" : "text-white"}`}>
                                            {goal.title}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(goal.priority)}`}>
                                                {getPriorityLabel(goal.priority)}
                                            </span>
                                            <button
                                                onClick={() => deleteGoal(goal.id)}
                                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-white/20 hover:text-red-400"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description (Smaller) */}
                                    {goal.description && (
                                        <p className="text-white/40 text-xs mb-3 line-clamp-1">{goal.description}</p>
                                    )}

                                    {/* Progress Section (Show only if < 100) */}
                                    {goal.progress < 100 ? (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Progress</span>
                                                <span className="text-[10px] font-medium text-emerald-400">{goal.progress}%</span>
                                            </div>
                                            <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="10"
                                                    value={goal.progress}
                                                    onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <motion.div
                                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${goal.progress}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 flex items-center text-[10px] text-green-400/60 font-medium uppercase tracking-wider">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Completed
                                        </div>
                                    )}

                                    {/* Deadline (Very Footer) */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <p className="text-[10px] text-white/20">
                                            {goal.targetDate ? `Deadline: ${new Date(goal.targetDate).toLocaleDateString('ja-JP')}` : 'No deadline'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Goal Modal */}
            <AddGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddGoal}
            />
        </>
    )
}
