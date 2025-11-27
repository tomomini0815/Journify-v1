"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { AddGoalModal } from "@/components/AddGoalModal"
import { motion } from "framer-motion"
import { Plus, MoreVertical, CheckCircle2, Circle, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Goal {
    id: number
    title: string
    description: string
    deadline: string
    priority: string
    progress: number
    completed: boolean
}

export default function GoalsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [goals, setGoals] = useState<Goal[]>([
        {
            id: 1,
            title: "週に3回運動する",
            description: "ジムに行くか、自宅で運動を週に少なくとも3回行う",
            deadline: "2025-03-31",
            priority: "high",
            progress: 75,
            completed: false,
        },
        {
            id: 2,
            title: "今月☆2冊の本を読む",
            description: "少なくとも2冊のノンフィクションを読み終える",
            deadline: "2025-03-31",
            priority: "medium",
            progress: 50,
            completed: false,
        },
        {
            id: 3,
            title: "毎日瑁想する",
            description: "毎朝10分間の瑁想を習慣にする",
            deadline: "2025-12-31",
            priority: "high",
            progress: 90,
            completed: false,
        },
    ])

    const handleAddGoal = (newGoal: Omit<Goal, "id" | "progress" | "completed">) => {
        const goal: Goal = {
            ...newGoal,
            id: goals.length + 1,
            progress: 0,
            completed: false,
        }
        setGoals([...goals, goal])
    }

    const toggleComplete = (id: number) => {
        setGoals(goals.map(goal =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
        ))
    }

    const deleteGoal = (id: number) => {
        setGoals(goals.filter(goal => goal.id !== id))
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "text-red-400 bg-red-500/20"
            case "medium": return "text-yellow-400 bg-yellow-500/20"
            case "low": return "text-green-400 bg-green-500/20"
            default: return "text-white/60 bg-white/10"
        }
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-2">目標</h1>
                    <p className="text-white/60">進捗を追跡し、夢を実現する</p>
                </motion.div>

                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    目標を追加
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <p className="text-white/60 text-sm mb-1">総目標数</p>
                    <p className="text-3xl font-bold">{goals.length}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <p className="text-white/60 text-sm mb-1">達成済み</p>
                    <p className="text-3xl font-bold text-green-400">
                        {goals.filter(g => g.completed).length}
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <p className="text-white/60 text-sm mb-1">進行中</p>
                    <p className="text-3xl font-bold text-blue-400">
                        {goals.filter(g => !g.completed).length}
                    </p>
                </motion.div>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                {goals.map((goal, index) => (
                    <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${goal.completed ? "opacity-60" : ""
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleComplete(goal.id)}
                                className="mt-1 flex-shrink-0"
                            >
                                {goal.completed ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                ) : (
                                    <Circle className="w-6 h-6 text-white/40 hover:text-white/60 transition-colors" />
                                )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-semibold mb-1 ${goal.completed ? "line-through" : ""}`}>
                                            {goal.title}
                                        </h3>
                                        <p className="text-white/60 text-sm mb-3">{goal.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(goal.priority)}`}>
                                            {goal.priority}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {!goal.completed && (
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-white/60">進捗状況</span>
                                            <span className="text-sm font-medium">{goal.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                                style={{ width: `${goal.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-white/40">
                                        期限: {new Date(goal.deadline).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
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
                ))}
            </div>

            {/* Add Goal Modal */}
            <AddGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddGoal}
            />
        </DashboardLayout>
    )
}
