"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { motion } from "framer-motion"
import { Image as ImageIcon, List, MessageSquare, Mail, Plus, X, Trash2, Upload, Search, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Tab = "collage" | "dreams" | "affirmations" | "letter"

interface Dream {
    id: number
    text: string
    completed: boolean
    category: string
}

interface Affirmation {
    id: number
    text: string
}

interface Letter {
    id: number
    content: string
    period: "1year" | "5years" | "10years"
    createdAt: string
}

export default function VisionBoardPage() {
    const [activeTab, setActiveTab] = useState<Tab>("collage")
    const [isLoading, setIsLoading] = useState(true)

    // Image Collage State
    const [images, setImages] = useState<{ id: string, content: string }[]>([])

    // Dream List State
    const [dreams, setDreams] = useState<Dream[]>([])
    const [newDream, setNewDream] = useState("")

    // Affirmations State
    const [affirmations, setAffirmations] = useState<Affirmation[]>([])
    const [newAffirmation, setNewAffirmation] = useState("")

    // Letter State
    const [letters, setLetters] = useState<Letter[]>([])
    const [letterPeriod, setLetterPeriod] = useState<"1year" | "5years" | "10years">("1year")
    const [letterContent, setLetterContent] = useState("")

    const tabs = [
        { id: "collage" as Tab, name: "イメージコラージュ", icon: ImageIcon },
        { id: "dreams" as Tab, name: "夢リスト", icon: List },
        { id: "affirmations" as Tab, name: "アファメーション", icon: MessageSquare },
        { id: "letter" as Tab, name: "未来の自分への手紙", icon: Mail },
    ]

    const letterPeriods = [
        { id: "1year" as const, label: "1年後" },
        { id: "5years" as const, label: "5年後" },
        { id: "10years" as const, label: "10年後" },
    ]

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await fetch("/api/vision-board")
            if (res.ok) {
                const data = await res.json()

                // Process data into categories
                const collageImages: { id: string, content: string }[] = []
                const dreamList: Dream[] = []
                const affirmationList: Affirmation[] = []
                const letterList: Letter[] = []

                data.forEach((item: any) => {
                    if (item.type === "image") {
                        collageImages.push({ id: item.id, content: item.content })
                    } else if (item.type === "dream") {
                        dreamList.push({
                            id: item.id,
                            text: item.content,
                            completed: item.metadata?.completed || false,
                            category: item.metadata?.category || "その他"
                        })
                    } else if (item.type === "affirmation") {
                        affirmationList.push({
                            id: item.id,
                            text: item.content
                        })
                    } else if (item.type === "letter") {
                        letterList.push({
                            id: item.id,
                            content: item.content,
                            period: item.metadata?.period || "1year",
                            createdAt: item.createdAt
                        })
                    }
                })

                setImages(collageImages)
                setDreams(dreamList)
                setAffirmations(affirmationList)
                setLetters(letterList)
            }
        } catch (error) {
            console.error("Failed to fetch vision board items", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            Array.from(files).forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    alert("ファイルサイズが大きすぎます (5MB以下にしてください)")
                    return
                }

                const reader = new FileReader()
                reader.onload = async (event) => {
                    if (event.target?.result) {
                        const content = event.target.result as string
                        try {
                            const res = await fetch("/api/vision-board", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    type: "image",
                                    content: content,
                                    metadata: {}
                                })
                            })
                            if (res.ok) {
                                const newItem = await res.json()
                                setImages(prev => [{ id: newItem.id, content: newItem.content }, ...prev])
                            } else {
                                const errorData = await res.json()
                                console.error("Upload failed:", errorData)
                                alert("画像のアップロードに失敗しました")
                            }
                        } catch (error) {
                            console.error("Failed to upload image", error)
                            alert("画像のアップロード中にエラーが発生しました")
                        }
                    }
                }
                reader.readAsDataURL(file)
            })
        }
    }

    const deleteImage = async (id: string) => {
        try {
            const res = await fetch(`/api/vision-board/${id}`, { method: "DELETE" })
            if (res.ok) {
                setImages(images.filter(img => img.id !== id))
            }
        } catch (error) {
            console.error("Failed to delete image", error)
        }
    }

    const addDream = () => {
        if (newDream.trim()) {
            setDreams([...dreams, { id: Date.now(), text: newDream, completed: false, category: "その他" }])
            setNewDream("")
        }
    }

    const toggleDream = (id: number) => {
        setDreams(dreams.map(d => d.id === id ? { ...d, completed: !d.completed } : d))
    }

    const deleteDream = (id: number) => {
        setDreams(dreams.filter(d => d.id !== id))
    }

    const addAffirmation = () => {
        if (newAffirmation.trim()) {
            setAffirmations([...affirmations, { id: Date.now(), text: newAffirmation }])
            setNewAffirmation("")
        }
    }

    const deleteAffirmation = (id: number) => {
        setAffirmations(affirmations.filter(a => a.id !== id))
    }

    const saveLetter = () => {
        if (letterContent.trim()) {
            setLetters([...letters, {
                id: Date.now(),
                content: letterContent,
                period: letterPeriod,
                createdAt: new Date().toISOString()
            }])
            setLetterContent("")
        }
    }

    const deleteLetter = (id: number) => {
        setLetters(letters.filter(l => l.id !== id))
    }

    const getPeriodLabel = (period: "1year" | "5years" | "10years") => {
        const labels = { "1year": "1年後", "5years": "5年後", "10years": "10年後" }
        return labels[period]
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl md:text-4xl font-bold mb-2">ビジョンボード ✨</h1>
                <p className="text-white/60">あなたの夢と目標を視覚化しましょう</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-black/20 p-1 rounded-xl backdrop-blur-md border border-white/5">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/30"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.name}</span>
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Image Collage */}
                {activeTab === "collage" && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <h2 className="text-xl font-bold mb-4">イメージコラージュ</h2>
                        <p className="text-white/60 mb-6">あなたの夢や目標を表す画像を追加しましょう</p>

                        <label className="block mb-6">
                            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
                                <Upload className="w-12 h-12 mx-auto mb-3 text-white/40" />
                                <p className="text-white/60">クリックして画像をアップロード</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </label>

                        {/* Image Search & AI Generation Links */}
                        <div className="border-2 border-white/10 rounded-3xl p-6 mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-bold">画像を探す・生成する</h3>
                            </div>
                            <p className="text-white/60 text-sm mb-4">
                                無料画像サイトから探すか、AIで生成しましょう
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <a
                                    href="https://unsplash.com/ja"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Unsplash</p>
                                            <p className="text-xs text-white/40">高品質な写真</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
                                </a>

                                <a
                                    href="https://www.pexels.com/ja-jp/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Pexels</p>
                                            <p className="text-xs text-white/40">動画も豊富</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors" />
                                </a>

                                <a
                                    href="https://pixabay.com/ja/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Pixabay</p>
                                            <p className="text-xs text-white/40">多様な素材</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-pink-400 transition-colors" />
                                </a>

                                <a
                                    href="https://aistudio.google.com/app/prompts/new_freeform"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-purple-300" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white flex items-center gap-1">
                                                Gemini AI
                                                <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 rounded text-purple-300">NEW</span>
                                            </p>
                                            <p className="text-xs text-white/40">AI画像生成</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
                                </a>
                            </div>

                            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <p className="text-xs text-blue-200/80">
                                    💡 ヒント: 画像をダウンロードしたら、上のアップロードエリアから追加できます
                                </p>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                            {images.map((img, index) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative group aspect-square rounded-xl overflow-hidden"
                                >
                                    <img src={img.content} alt={`Vision ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => deleteImage(img.id)}
                                        className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dream List */}
                {activeTab === "dreams" && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <h2 className="text-xl font-bold mb-4">夢リスト</h2>
                        <p className="text-white/60 mb-6">あなたの夢や目標をリストアップしましょう</p>

                        <div className="flex gap-2 mb-6">
                            <Input
                                value={newDream}
                                onChange={(e) => setNewDream(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addDream()}
                                placeholder="新しい夢を追加..."
                                className="flex-1 bg-white/5 border-white/10 focus:border-emerald-400 rounded-xl"
                            />
                            <Button
                                onClick={addDream}
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {dreams.map((dream) => (
                                <motion.div
                                    key={dream.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={dream.completed}
                                        onChange={() => toggleDream(dream.id)}
                                        className="w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-emerald-500"
                                    />
                                    <span className={`flex-1 ${dream.completed ? 'line-through text-white/40' : ''}`}>
                                        {dream.text}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-white/10 rounded-full">{dream.category}</span>
                                    <button
                                        onClick={() => deleteDream(dream.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Affirmations */}
                {activeTab === "affirmations" && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <h2 className="text-xl font-bold mb-4">アファメーション</h2>
                        <p className="text-white/60 mb-6">ポジティブな言葉で自分を励ましましょう</p>

                        <div className="flex gap-2 mb-6">
                            <Input
                                value={newAffirmation}
                                onChange={(e) => setNewAffirmation(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addAffirmation()}
                                placeholder="新しいアファメーションを追加..."
                                className="flex-1 bg-white/5 border-white/10 focus:border-emerald-400 rounded-xl"
                            />
                            <Button
                                onClick={addAffirmation}
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {affirmations.map((affirmation) => (
                                <motion.div
                                    key={affirmation.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl"
                                >
                                    <p className="text-lg font-medium mb-2">{affirmation.text}</p>
                                    <button
                                        onClick={() => deleteAffirmation(affirmation.id)}
                                        className="absolute top-3 right-3 p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Letter to Future Self */}
                {activeTab === "letter" && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <h2 className="text-xl font-bold mb-4">未来の自分への手紙</h2>
                        <p className="text-white/60 mb-6">未来の自分に向けてメッセージを書きましょう</p>

                        {/* Period Tabs */}
                        <div className="flex gap-2 mb-6 bg-black/20 p-1 rounded-xl">
                            {letterPeriods.map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => setLetterPeriod(period.id)}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${letterPeriod === period.id
                                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/30"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">手紙の内容</label>
                                <textarea
                                    value={letterContent}
                                    onChange={(e) => setLetterContent(e.target.value)}
                                    placeholder={`${getPeriodLabel(letterPeriod)}の自分へのメッセージを書いてください...`}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-400 rounded-xl resize-none focus:outline-none transition-colors"
                                />
                            </div>
                            <Button
                                onClick={saveLetter}
                                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl"
                            >
                                手紙を保存
                            </Button>
                        </div>

                        {letters.filter(l => l.period === letterPeriod).length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg mb-3">保存された手紙 ({getPeriodLabel(letterPeriod)})</h3>
                                {letters.filter(l => l.period === letterPeriod).map((letter) => (
                                    <motion.div
                                        key={letter.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-white/5 rounded-xl border border-white/10 relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-white/40">
                                                作成: {new Date(letter.createdAt).toLocaleDateString('ja-JP')}
                                            </span>
                                            <button
                                                onClick={() => deleteLetter(letter.id)}
                                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                        <p className="text-white/80 whitespace-pre-wrap">{letter.content}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    )
}
