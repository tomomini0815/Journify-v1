"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { JournalEditor } from "@/components/JournalEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Save, X, Tag } from "lucide-react"
import Link from "next/link"

const moods = ["😊", "😔", "😌", "😤", "🥳", "💭", "✨", "🙏"]

export default function NewJournalPage() {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [selectedMood, setSelectedMood] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")

    const handleSave = () => {
        console.log("Saving journal:", { title, content, mood: selectedMood, tags })
        // TODO: Implement save functionality
    }

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold">新しいジャーナル</h1>
                    <p className="text-white/60 mt-1">あなたの思考と感情を記録する</p>
                </motion.div>

                <div className="flex gap-2">
                    <Link href="/journal">
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl">
                            <X className="w-4 h-4 mr-2" />
                            キャンセル
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        保存
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Input
                            type="text"
                            placeholder="タイトルを入力..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold bg-white/5 border-white/10 focus:border-purple-400 h-14 rounded-2xl"
                        />
                    </motion.div>

                    {/* Editor */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <JournalEditor content={content} onChange={setContent} />
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Mood Selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
                    >
                        <h3 className="font-semibold mb-3">今の気分は？</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {moods.map((mood) => (
                                <button
                                    key={mood}
                                    onClick={() => setSelectedMood(mood)}
                                    className={`text-3xl p-3 rounded-xl hover:bg-white/10 transition-colors ${selectedMood === mood ? "bg-purple-500/20 ring-2 ring-purple-400" : ""
                                        }`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tags */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
                    >
                        <h3 className="font-semibold mb-3">タグ</h3>
                        <div className="flex gap-2 mb-3">
                            <Input
                                type="text"
                                placeholder="タグを追加..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addTag()}
                                className="bg-white/5 border-white/10 focus:border-purple-400 rounded-xl flex-1"
                            />
                            <Button
                                onClick={addTag}
                                size="sm"
                                className="bg-purple-500/20 hover:bg-purple-500/30 rounded-xl"
                            >
                                <Tag className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full flex items-center gap-1"
                                >
                                    {tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-white"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Date */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
                    >
                        <h3 className="font-semibold mb-2">日付</h3>
                        <p className="text-white/60">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}
