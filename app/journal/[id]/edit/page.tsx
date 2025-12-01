"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/DashboardLayout"
import { JournalEditor } from "@/components/JournalEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Save, X, Tag } from "lucide-react"
import Link from "next/link"

export default function EditJournalPage() {
    const router = useRouter()
    const params = useParams()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    // 気分追跡
    const [mood, setMood] = useState(3)
    const [energy, setEnergy] = useState(3)
    const [stress, setStress] = useState(3)
    const [sleep, setSleep] = useState(3)

    // 活動チェックボックス
    const [activities, setActivities] = useState({
        exercise: false,
        socializing: false,
        workDone: false,
        learning: false,
        hobby: false,
        healthyMeal: false,
        meditation: false,
        outdoor: false,
        helping: false,
        grateful: false
    })

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                const res = await fetch(`/api/journal/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setTitle(data.title)
                    setContent(data.content)
                    setTags(data.tags || [])
                    setMood(data.mood || 3)
                    setEnergy(data.energy || 3)
                    setStress(data.stress || 3)
                    setSleep(data.sleep || 3)
                    if (data.activities) {
                        setActivities(prev => ({ ...prev, ...data.activities }))
                    }
                } else {
                    setError("ジャーナルの取得に失敗しました")
                }
            } catch (err) {
                setError("エラーが発生しました")
            } finally {
                setIsLoading(false)
            }
        }
        if (params.id) {
            fetchJournal()
        }
    }, [params.id])

    const handleActivityChange = (key: keyof typeof activities) => {
        setActivities(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = async () => {
        if (!title.trim()) {
            setError("タイトルを入力してください")
            return
        }
        if (!content.trim()) {
            setError("内容を入力してください")
            return
        }

        setIsSaving(true)
        setError("")

        try {
            const response = await fetch(`/api/journal/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags,
                    mood,
                    energy,
                    stress,
                    sleep,
                    activities
                }),
            })

            if (!response.ok) {
                throw new Error("保存に失敗しました")
            }

            // Life Balanceスコアを再計算
            try {
                await fetch("/api/calculate-life-balance", {
                    method: "POST"
                })
            } catch (err) {
                console.error("Life Balance calculation failed:", err)
            }

            router.push(`/journal/${params.id}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message || "保存中にエラーが発生しました")
        } finally {
            setIsSaving(false)
        }
    }

    const [activeTagCategory, setActiveTagCategory] = useState("goals")
    const [showCustomTagInput, setShowCustomTagInput] = useState(false)

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

    const toggleTag = (tag: string) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag))
        } else {
            setTags([...tags, tag])
        }
    }

    const addCustomTag = () => {
        if (!tagInput.trim()) return;
        const newTags = tagInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag && !tags.includes(tag));
        if (newTags.length > 0) {
            setTags([...tags, ...newTags]);
            setTagInput("");
            setShowCustomTagInput(false);
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="text-center py-12 text-white/60">読み込み中...</div>
            </DashboardLayout>
        )
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
                    <h1 className="text-3xl font-bold">ジャーナルを編集</h1>
                    <p className="text-white/60 mt-1">過去の記録を更新する</p>
                </motion.div>

                <div className="flex gap-2">
                    <Link href={`/journal/${params.id}`}>
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl">
                            <X className="w-4 h-4 mr-2" />
                            キャンセル
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "保存中..." : "保存"}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左側: ジャーナル入力 */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                    >
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="タイトル"
                            className="mb-4 bg-white/5 border-white/10 text-xl font-semibold rounded-xl"
                        />

                        <JournalEditor
                            content={content}
                            onChange={setContent}
                        />
                    </motion.div>

                    {/* タグ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            タグを選択
                        </h3>

                        {/* 選択されたタグ */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/5 rounded-xl">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm flex items-center gap-2"
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

                        {/* カテゴリタブ */}
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

                        {/* タグ選択ボタン */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {tagCategories[activeTagCategory as keyof typeof tagCategories].tags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-all ${tags.includes(tag)
                                        ? 'bg-emerald-500/30 border-2 border-emerald-500/50 font-semibold'
                                        : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* カスタムタグ追加 */}
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
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                                    className="flex-1 bg-white/5 border-white/10 rounded-xl"
                                    autoFocus
                                />
                                <Button
                                    onClick={addCustomTag}
                                    className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                                >
                                    追加
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowCustomTagInput(false)
                                        setTagInput("")
                                    }}
                                    className="bg-white/10 hover:bg-white/20 rounded-xl"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* 右側: 気分・活動追跡 */}
                <div className="space-y-6">
                    {/* 気分評価 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4">今日の気分</h3>

                        <div className="space-y-4">
                            {/* 気分 */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    気分
                                </label>
                                <div className="flex items-center gap-2">
                                    {[
                                        { value: 1, emoji: '😭', label: '最悪' },
                                        { value: 2, emoji: '😔', label: '悪い' },
                                        { value: 3, emoji: '😐', label: '普通' },
                                        { value: 4, emoji: '😊', label: '良い' },
                                        { value: 5, emoji: '😄', label: '最高' }
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => setMood(item.value)}
                                            className={`flex flex-col items-center transition-all hover:scale-110 ${mood === item.value ? 'opacity-100 scale-110' : 'opacity-40'
                                                }`}
                                            title={item.label}
                                        >
                                            <span className="text-2xl">{item.emoji}</span>
                                            <span className="text-xs text-white/60 mt-1">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* エネルギー */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    エネルギー
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => setEnergy(value)}
                                            className={`text-2xl transition-transform hover:scale-110 ${energy >= value ? 'opacity-100' : 'opacity-30'
                                                }`}
                                        >
                                            ⚡
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ストレス */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    ストレス
                                </label>
                                <div className="flex items-center gap-2">
                                    {[
                                        { value: 1, emoji: '😌', label: 'なし' },
                                        { value: 2, emoji: '🙂', label: '少し' },
                                        { value: 3, emoji: '😐', label: '普通' },
                                        { value: 4, emoji: '😰', label: 'やや高い' },
                                        { value: 5, emoji: '😫', label: '高い' }
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => setStress(item.value)}
                                            className={`flex flex-col items-center transition-all hover:scale-110 ${stress === item.value ? 'opacity-100 scale-110' : 'opacity-40'
                                                }`}
                                            title={item.label}
                                        >
                                            <span className="text-2xl">{item.emoji}</span>
                                            <span className="text-xs text-white/60 mt-1">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 睡眠 */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    睡眠の質
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => setSleep(value)}
                                            className={`text-2xl transition-transform hover:scale-110 ${sleep >= value ? 'opacity-100' : 'opacity-30'
                                                }`}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 活動チェックリスト */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4">今日したこと</h3>

                        <div className="space-y-2">
                            {[
                                { key: 'exercise', label: '💪 運動した' },
                                { key: 'socializing', label: '👥 人と会った' },
                                { key: 'workDone', label: '✅ 仕事を完了' },
                                { key: 'learning', label: '📚 学習・読書' },
                                { key: 'hobby', label: '🎨 趣味の時間' },
                                { key: 'healthyMeal', label: '🥗 健康的な食事' },
                                { key: 'meditation', label: '🧘 瞑想・呼吸法' },
                                { key: 'outdoor', label: '🌳 外出・自然' },
                                { key: 'helping', label: '🤝 誰かを助けた' },
                                { key: 'grateful', label: '🙏 感謝を感じた' }
                            ].map((item) => (
                                <label
                                    key={item.key}
                                    className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg transition-all ${activities[item.key as keyof typeof activities]
                                        ? 'bg-emerald-500/20 border-2 border-emerald-500/30'
                                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={activities[item.key as keyof typeof activities]}
                                        onChange={() => handleActivityChange(item.key as keyof typeof activities)}
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-400"
                                    />
                                    <span className={`text-sm ${activities[item.key as keyof typeof activities] ? 'font-semibold' : ''
                                        }`}>
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-xs text-blue-200/80">
                                💡 これらの情報は、あなたの幸福度バランスを自動計算するために使用されます
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}
