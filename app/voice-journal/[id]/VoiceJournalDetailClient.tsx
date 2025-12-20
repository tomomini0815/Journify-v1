"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { motion } from "framer-motion"
import { ArrowLeft, Edit2, Save, X, Trash2, Mic } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOOD_OPTIONS } from "@/lib/moodUtils"

interface VoiceJournal {
    id: string
    transcript: string
    aiSummary: string
    sentiment: string | null
    mood: number | null
    tags: string[]
    audioUrl: string | null
    createdAt: string
    updatedAt: string
    userId: string
}

interface VoiceJournalDetailClientProps {
    voiceJournal: VoiceJournal
}

export default function VoiceJournalDetailClient({ voiceJournal }: VoiceJournalDetailClientProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const [editedTranscript, setEditedTranscript] = useState(voiceJournal.transcript)
    const [editedMood, setEditedMood] = useState<number | null>(voiceJournal.mood)
    const [editedTags, setEditedTags] = useState<string[]>(voiceJournal.tags)
    const [activeTagCategory, setActiveTagCategory] = useState("goals")
    const [showCustomTagInput, setShowCustomTagInput] = useState(false)
    const [customTagInput, setCustomTagInput] = useState("")

    // Tag categories matching text journal
    const tagCategories = {
        goals: {
            name: "🎯 目標・成長",
            tags: ["目標達成", "自己成長", "スキルアップ", "キャリア", "学習"]
        },
        emotions: {
            name: "💭 感情・気分",
            tags: ["幸せ", "感謝", "不安", "ストレス", "リラックス", "モチベーション"]
        },
        relationships: {
            name: "👥 人間関係",
            tags: ["家族", "友人", "恋愛", "仕事仲間", "新しい出会い"]
        },
        work: {
            name: "💼 仕事・勉強",
            tags: ["プロジェクト", "会議", "締め切り", "成果", "課題"]
        },
        health: {
            name: "🏃 健康・ライフスタイル",
            tags: ["運動", "食事", "睡眠", "瞑想", "ヨガ"]
        },
        hobbies: {
            name: "🎨 趣味・娯楽",
            tags: ["読書", "映画", "音楽", "アート", "ゲーム", "旅行"]
        },
        ideas: {
            name: "💡 アイデア・インスピレーション",
            tags: ["ひらめき", "計画", "夢", "創造性"]
        },
        other: {
            name: "🌟 その他",
            tags: ["日常", "振り返り", "決断", "変化", "挑戦"]
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/voice-journal/${voiceJournal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript: editedTranscript,
                    mood: editedMood,
                    tags: editedTags
                })
            })

            if (!response.ok) {
                throw new Error("Failed to update voice journal")
            }

            setIsEditing(false)
            router.refresh()
        } catch (error) {
            console.error("Save error:", error)
            alert("音声ジャーナルの更新に失敗しました")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("この音声ジャーナルを削除してもよろしいですか？")) {
            return
        }

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/voice-journal/${voiceJournal.id}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                throw new Error("Failed to delete voice journal")
            }

            router.push("/journal?tab=voice")
        } catch (error) {
            console.error("Delete error:", error)
            alert("音声ジャーナルの削除に失敗しました")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCancel = () => {
        setEditedTranscript(voiceJournal.transcript)
        setEditedMood(voiceJournal.mood)
        setEditedTags(voiceJournal.tags)
        setIsEditing(false)
    }

    const toggleTag = (tag: string) => {
        setEditedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    const removeTag = (tagToRemove: string) => {
        setEditedTags(editedTags.filter(tag => tag !== tagToRemove))
    }

    const addCustomTag = () => {
        if (!customTagInput.trim()) return
        const newTags = customTagInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag && !editedTags.includes(tag))
        if (newTags.length > 0) {
            setEditedTags([...editedTags, ...newTags])
            setCustomTagInput("")
            setShowCustomTagInput(false)
        }
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
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => router.push("/journal?tab=voice")}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            音声ジャーナル一覧に戻る
                        </button>

                        <div className="flex gap-2">
                            {!isEditing ? (
                                <>
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-white/10 hover:bg-white/20"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        編集
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {isDeleting ? "削除中..." : "削除"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleCancel}
                                        className="bg-white/10 hover:bg-white/20"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        キャンセル
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-gradient-to-r from-cyan-600 to-emerald-600"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaving ? "保存中..." : "保存"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-emerald-500 rounded-full flex items-center justify-center">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-[28px] font-bold">音声ジャーナル</h1>
                            <p className="text-white/60">
                                {new Date(voiceJournal.createdAt).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
            >
                {/* Mood Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">気分</h2>
                    {!isEditing ? (
                        <div className="flex items-center gap-3">
                            {voiceJournal.mood !== null ? (
                                <>
                                    <span className="text-4xl">
                                        {voiceJournal.mood >= 9 ? '😄' : voiceJournal.mood >= 7 ? '😊' : voiceJournal.mood >= 5 ? '😐' : voiceJournal.mood >= 3 ? '😔' : '😢'}
                                    </span>
                                    <div className={`px-4 py-2 rounded-full text-lg font-semibold
                                        ${voiceJournal.mood >= 7 ? 'bg-emerald-500/20 text-emerald-400' :
                                            voiceJournal.mood >= 5 ? 'bg-blue-500/20 text-blue-400' :
                                                voiceJournal.mood >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'}`}>
                                        {voiceJournal.mood}/10
                                    </div>
                                </>
                            ) : (
                                <p className="text-white/40">気分が記録されていません</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-3">
                            {MOOD_OPTIONS.map((mood) => (
                                <motion.button
                                    key={mood.value}
                                    onClick={() => setEditedMood(mood.value)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-4 rounded-2xl transition-all ${editedMood === mood.value
                                        ? 'bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border-2 border-cyan-400'
                                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <div className="text-4xl mb-2">{mood.emoji}</div>
                                    <div className="text-white/80 text-xs font-medium">{mood.label}</div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Transcript Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">文字起こし</h2>
                    {!isEditing ? (
                        <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                            {voiceJournal.transcript}
                        </p>
                    ) : (
                        <textarea
                            value={editedTranscript}
                            onChange={(e) => setEditedTranscript(e.target.value)}
                            className="w-full min-h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white resize-y focus:outline-none focus:border-cyan-400"
                            placeholder="文字起こしを編集..."
                        />
                    )}
                </div>

                {/* Tags Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">タグを選択</h2>

                    {!isEditing ? (
                        <div className="flex flex-wrap gap-2">
                            {voiceJournal.tags.length > 0 ? (
                                voiceJournal.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-cyan-600/20 text-cyan-300 rounded-full text-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))
                            ) : (
                                <p className="text-white/40">タグがありません</p>
                            )}
                        </div>
                    ) : (
                        <div>
                            {/* Selected Tags */}
                            {editedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/5 rounded-xl">
                                    {editedTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Category Tabs */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.entries(tagCategories).map(([key, category]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTagCategory(key)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${activeTagCategory === key
                                            ? 'bg-indigo-500/30 border-2 border-indigo-500/50 font-semibold'
                                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>

                            {/* Tag Selection Buttons */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {tagCategories[activeTagCategory as keyof typeof tagCategories].tags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-4 py-2 rounded-lg text-sm transition-all ${editedTags.includes(tag)
                                            ? 'bg-purple-500/30 border-2 border-purple-500/50 font-semibold'
                                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Tag Input */}
                            {!showCustomTagInput ? (
                                <button
                                    onClick={() => setShowCustomTagInput(true)}
                                    className="w-full px-4 py-2 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/10 transition-colors text-sm text-white/60 hover:text-white"
                                >
                                    + カスタムタグを追加
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="カスタムタグ (カンマ区切りで複数可)"
                                        value={customTagInput}
                                        onChange={(e) => setCustomTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                                        className="flex-1 bg-white/5 border-white/10 rounded-xl"
                                        autoFocus
                                    />
                                    <Button
                                        onClick={addCustomTag}
                                        className="bg-purple-500 hover:bg-purple-600 rounded-xl"
                                    >
                                        追加
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowCustomTagInput(false)
                                            setCustomTagInput("")
                                        }}
                                        className="bg-white/10 hover:bg-white/20 rounded-xl"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sentiment Section */}
                {voiceJournal.sentiment && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4">感情分析</h2>
                        <p className="text-white/60 text-sm mb-3">
                            Gemini AIが文字起こしテキストを分析し、ポジティブ/ニュートラル/ネガティブの3段階で感情を判定しています。
                        </p>
                        <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold
                            ${voiceJournal.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                                voiceJournal.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                    'bg-blue-500/20 text-blue-400'}`}>
                            {voiceJournal.sentiment === 'positive' ? 'ポジティブ' :
                                voiceJournal.sentiment === 'negative' ? 'ネガティブ' : 'ニュートラル'}
                        </div>
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    )
}
