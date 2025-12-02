"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, CheckCircle2, Circle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddGoalModal } from "@/components/AddGoalModal"

interface Goal {
    id: string
    title: string
    description: string | null
    targetDate: Date | null
    priority: string
    progress: number
}

interface GoalsClientProps {
    initialGoals: Goal[]
}

export function GoalsClient({ initialGoals }: GoalsClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [goals, setGoals] = useState<Goal[]>(initialGoals)

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

    return (
        <>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">目標</h1>
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <p className="text-white/60 text-sm mb-1">総目標数</p>
                    <p className="text-2xl md:text-3xl font-bold">{goals.length}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <p className="text-white/60 text-sm mb-1">達成済み</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">
                        {goals.filter(g => g.progress === 100).length}
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
                        {goals.filter(g => g.progress < 100).length}
                    </p>
                </motion.div>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                {goals.length === 0 ? (
                    <div className="text-center py-12 text-white/60">
                        目標がまだありません。新しい目標を追加しましょう!
                    </div>
                ) : (
                    goals.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${goal.progress === 100 ? "opacity-60" : ""}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleComplete(goal.id)}
                                    className="mt-1 flex-shrink-0"
                                >
                                    {goal.progress === 100 ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-white/40 hover:text-white/60 transition-colors" />
                                    )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-semibold mb-1 ${goal.progress === 100 ? "line-through" : ""}`}>
                                                {goal.title}
                                            </h3>
                                            <p className="text-white/60 text-sm mb-3">{goal.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(goal.priority)}`}>
                                                {getPriorityLabel(goal.priority)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Slider */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-white/60">進捗状況</span>
                                            <span className="text-sm font-medium">{goal.progress}%</span>
                                        </div>

                                        <div className="relative h-6 flex items-center">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="10"
                                                value={goal.progress}
                                                onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-125"
                                            />
                                            <div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-lg pointer-events-none"
                                                style={{ width: `${goal.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-white/40">
                                            期限: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', year: 'numeric' }) : '設定なし'}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => deleteGoal(goal.id)}
                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
