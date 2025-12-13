"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Bell, Lock, Palette, Globe, Save, Camera, Briefcase, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileClientProps {
    initialData: {
        name: string
        email: string
        bio: string
        notifications: boolean
        emailUpdates: boolean
        language: string
        enableProjects: boolean
        stats: {
            journalCount: number
            streak: number
            goalCount: number
            daysUsed: number
        }
    }
}

export function ProfileClient({ initialData }: ProfileClientProps) {
    const router = useRouter()
    const [name, setName] = useState(initialData.name)
    const [email] = useState(initialData.email)
    const [bio, setBio] = useState(initialData.bio)
    const [notifications, setNotifications] = useState(initialData.notifications)
    const [emailUpdates, setEmailUpdates] = useState(initialData.emailUpdates)
    const [language, setLanguage] = useState(initialData.language)
    const [enableProjects, setEnableProjects] = useState(initialData.enableProjects)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")

    const handleProjectToggle = async (newValue: boolean) => {
        setEnableProjects(newValue)

        try {
            // Save to API
            await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enableProjects: newValue })
            })

            // Update localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('enableProjects', String(newValue))
            }

            // Refresh the page to update navigation
            router.refresh()
        } catch (error) {
            console.error("Failed to update project settings:", error)
            // Revert on error
            setEnableProjects(!newValue)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError("")

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    bio,
                    preferences: {
                        notifications,
                        emailUpdates,
                        language,
                    },
                }),
            })

            if (!response.ok) {
                throw new Error("保存に失敗しました")
            }

            // Refresh to show updated data
            router.refresh()
        } catch (err: any) {
            setError(err.message || "保存中にエラーが発生しました")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-[28px] font-bold mb-2">プロフィール</h1>
                <p className="text-white/60">アカウント情報と設定を管理</p>
            </motion.div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200"
                >
                    {error}
                </motion.div>
            )}

            {/* Success Message */}
            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-200"
                >
                    {success}
                </motion.div>
            )}

            {/* Profile Picture Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6"
            >
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl md:text-3xl font-bold">
                            {name.charAt(0)}
                        </div>
                        <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-1">{name}</h2>
                        <p className="text-white/60">{email}</p>
                    </div>
                </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold">個人情報</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                            名前
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                            自己紹介
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Palette className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold">環境設定</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-white/60" />
                            <div>
                                <p className="font-medium">プッシュ通知</p>
                                <p className="text-sm text-white/60">デイリーリマインダーを受け取る</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? "bg-emerald-500" : "bg-white/20"}`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? "translate-x-7" : "translate-x-1"}`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-white/60" />
                            <div>
                                <p className="font-medium">メール通知</p>
                                <p className="text-sm text-white/60">週次レポートを受け取る</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEmailUpdates(!emailUpdates)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${emailUpdates ? "bg-emerald-500" : "bg-white/20"}`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${emailUpdates ? "translate-x-7" : "translate-x-1"}`}
                            />
                        </button>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-5 h-5 text-white/60" />
                            <p className="font-medium">言語</p>
                        </div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        >
                            <option value="ja">日本語</option>
                            <option value="en">English</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* App Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Briefcase className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold">アプリ設定</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Briefcase className="w-5 h-5 text-white/60" />
                            <div>
                                <p className="font-medium">プロジェクト管理</p>
                                <p className="text-sm text-white/60">プロジェクト、マイルストーン、ガントチャート機能を有効にする</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleProjectToggle(!enableProjects)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${enableProjects ? "bg-emerald-500" : "bg-white/20"}`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enableProjects ? "translate-x-7" : "translate-x-1"}`}
                            />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Security */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rose-500/20 rounded-lg">
                        <Lock className="w-5 h-5 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-bold">セキュリティ</h3>
                </div>

                <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
                    <p className="font-medium mb-1">パスワードを変更</p>
                    <p className="text-sm text-white/60">アカウントのセキュリティを強化</p>
                </button>
            </motion.div>

            {/* Account Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold">アカウント統計</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl text-center">
                        <p className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1">{initialData.stats.journalCount}</p>
                        <p className="text-sm text-white/60">総記録数</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl text-center">
                        <p className="text-2xl md:text-3xl font-bold text-cyan-400 mb-1">{initialData.stats.streak}</p>
                        <p className="text-sm text-white/60">連続日数</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl text-center">
                        <p className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1">{initialData.stats.goalCount}</p>
                        <p className="text-sm text-white/60">達成した目標</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl text-center">
                        <p className="text-2xl md:text-3xl font-bold text-amber-400 mb-1">{initialData.stats.daysUsed}</p>
                        <p className="text-sm text-white/60">利用日数</p>
                    </div>
                </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end gap-4"
            >
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {isSaving ? "保存中..." : "変更を保存"}
                </button>
            </motion.div>
        </div>
    )
}
