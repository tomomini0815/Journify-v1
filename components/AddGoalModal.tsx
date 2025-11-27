"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddGoalModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (goal: { title: string; description: string; deadline: string; priority: string }) => void
}

export function AddGoalModal({ isOpen, onClose, onAdd }: AddGoalModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [deadline, setDeadline] = useState("")
    const [priority, setPriority] = useState("medium")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onAdd({ title, description, deadline, priority })
        // Reset form
        setTitle("")
        setDescription("")
        setDeadline("")
        setPriority("medium")
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">新しい目標を追加</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium">
                                        目標タイトル
                                    </label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="例: 週に3回運動する"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-purple-400 rounded-xl"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium">
                                        説明
                                    </label>
                                    <textarea
                                        id="description"
                                        placeholder="目標の詳細を入力..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl resize-none focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Deadline */}
                                <div className="space-y-2">
                                    <label htmlFor="deadline" className="text-sm font-medium">
                                        目標日
                                    </label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="bg-white/5 border-white/10 focus:border-purple-400 rounded-xl"
                                    />
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">優先度</label>
                                    <div className="flex gap-2">
                                        {[{ id: "low", label: "低" }, { id: "medium", label: "中" }, { id: "high", label: "高" }].map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setPriority(p.id)}
                                                className={`flex-1 py-2 rounded-lg transition-all ${priority === p.id
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                                    }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        onClick={onClose}
                                        variant="outline"
                                        className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 rounded-xl"
                                    >
                                        キャンセル
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        目標を追加
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
