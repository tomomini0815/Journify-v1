"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Bell, Lock, Palette, Globe, Save, Camera, Briefcase, Calendar, Sparkles, Gamepad2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

interface ProfileClientProps {
    initialData: {
        name: string
        email: string
        bio: string
        notifications: boolean
        emailUpdates: boolean
        language: string
        enableProjects: boolean
        enableAdventure: boolean
        showJojo: boolean
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
    const [enableAdventure, setEnableAdventure] = useState(initialData.enableAdventure)
    const [showJojo, setShowJojo] = useState(initialData.showJojo)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    // On mount, sync with localStorage to ensure consistency with sidebar
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedProjects = localStorage.getItem('enableProjects')
            const storedAdventure = localStorage.getItem('enableAdventure')

            // If localStorage has values, use them (they are the source of truth)
            if (storedProjects !== null) {
                setEnableProjects(storedProjects === 'true')
            }
            if (storedAdventure !== null) {
                setEnableAdventure(storedAdventure === 'true')
            }
        }
    }, [])

    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setError("パスワードが一致しません")
            return
        }
        if (newPassword.length < 6) {
            setError("パスワードは6文字以上で設定してください")
            return
        }
        setIsSaving(true)
        setError("")

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password: newPassword })

            if (error) {
                throw error
            }

            setSuccess("パスワードを変更しました")
            setShowPasswordModal(false)
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            console.error("Password update error:", err)
            setError(err.message || "パスワードの更新に失敗しました")
        } finally {
            setIsSaving(false)
        }
    }

    const handleJojoToggle = async (newValue: boolean) => {
        setShowJojo(newValue)
        setError("")
        setSuccess("")

        try {
            // Save to API
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ showJojo: newValue })
            })

            if (!res.ok) {
                throw new Error("設定の保存に失敗しました")
            }

            setSuccess("設定を保存しました")

            // Auto-dismiss success message after 3 seconds
            setTimeout(() => {
                setSuccess("")
            }, 3000)

            // Note: Removed router.refresh() to prevent state reset
        } catch (error) {
            console.error("Failed to update Jojo settings:", error)
            setError("設定の保存に失敗しました")

            // Auto-dismiss error message after 3 seconds
            setTimeout(() => {
                setError("")
            }, 3000)

            // Revert on error
            setShowJojo(!newValue)
        }
    }

    const handleProjectToggle = async (newValue: boolean) => {
        setEnableProjects(newValue)
        setError("")
        setSuccess("")

        try {
            // Save to API
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enableProjects: newValue })
            })

            if (!res.ok) {
                throw new Error("設定の保存に失敗しました")
            }

            // Update localStorage
            if (typeof window !== 'undefined') {
                const oldValue = localStorage.getItem('enableProjects')
                console.log('[ProfileClient] Setting enableProjects in localStorage:', newValue)
                localStorage.setItem('enableProjects', String(newValue))
                console.log('[ProfileClient] localStorage after set:', localStorage.getItem('enableProjects'))

                // Dispatch custom event with the new value
                console.log('[ProfileClient] Dispatching projectSettingsChanged event')
                window.dispatchEvent(new CustomEvent('projectSettingsChanged', {
                    detail: { enableProjects: newValue }
                }))

                // Also manually trigger storage event for same-window updates
                // (storage events don't fire in the same window that made the change)
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'enableProjects',
                    newValue: String(newValue),
                    oldValue: oldValue,
                    storageArea: localStorage,
                    url: window.location.href
                }))
            }

            setSuccess(newValue ? "プロジェクト機能を有効にしました" : "プロジェクト機能を無効にしました")

            // Auto-dismiss success message after 3 seconds
            setTimeout(() => {
                setSuccess("")
            }, 3000)

            // Dispatch event for other components
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('projectSettingsChanged'))
            }

            // Note: Removed router.refresh() to prevent state reset
        } catch (error) {
            console.error("Failed to update project settings:", error)
            setError("プロジェクト設定の保存に失敗しました")

            // Auto-dismiss error message after 3 seconds
            setTimeout(() => {
                setError("")
            }, 3000)

            // Revert on error
            setEnableProjects(!newValue)
        }
    }

    const handleAdventureToggle = async (newValue: boolean) => {
        setEnableAdventure(newValue)
        setError("")
        setSuccess("")

        try {
            // Save to API
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enableAdventure: newValue })
            })

            if (!res.ok) {
                throw new Error("設定の保存に失敗しました")
            }

            // Update localStorage
            if (typeof window !== 'undefined') {
                const oldValue = localStorage.getItem('enableAdventure')
                console.log('[ProfileClient] Setting enableAdventure in localStorage:', newValue)
                localStorage.setItem('enableAdventure', String(newValue))

                // Dispatch custom event with the new value
                window.dispatchEvent(new CustomEvent('adventureSettingsChanged', {
                    detail: { enableAdventure: newValue }
                }))

                // Also manually trigger storage event for same-window updates
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'enableAdventure',
                    newValue: String(newValue),
                    oldValue: oldValue,
                    storageArea: localStorage,
                    url: window.location.href
                }))
            }

            setSuccess(newValue ? "アドベンチャーモードを有効にしました" : "アドベンチャーモードを無効にしました")

            // Auto-dismiss success message after 3 seconds
            setTimeout(() => {
                setSuccess("")
            }, 3000)

            // Dispatch event for other components
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('adventureSettingsChanged'))
            }

            // Note: Removed router.refresh() to prevent state reset
        } catch (error) {
            console.error("Failed to update adventure settings:", error)
            setError("設定の保存に失敗しました")

            // Auto-dismiss error message after 3 seconds
            setTimeout(() => {
                setError("")
            }, 3000)

            // Revert on error
            setEnableAdventure(!newValue)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError("")
        setSuccess("")

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
                const errorData = await response.json()
                throw new Error(errorData.error || "保存に失敗しました")
            }

            setSuccess("プロフィールを保存しました")

            // Auto-dismiss success message after 3 seconds
            setTimeout(() => {
                setSuccess("")
            }, 3000)

            // Refresh to show updated data
            setTimeout(() => {
                router.refresh()
            }, 500)
        } catch (err: any) {
            console.error("Profile save error:", err)
            setError(err.message || "保存中にエラーが発生しました")

            // Auto-dismiss error message after 3 seconds
            setTimeout(() => {
                setError("")
            }, 3000)
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
                <h1 className="text-[28px] font-bold mb-2">アカウント設定</h1>
                <p className="text-white/60">アカウント情報と設定を管理</p>
            </motion.div>

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
                                <p className="font-medium">メール通知 <span className="text-xs text-amber-400">(近日実装予定)</span></p>
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

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Gamepad2 className="w-5 h-5 text-white/60" />
                            <div>
                                <p className="font-medium">アドベンチャーモード</p>
                                <p className="text-sm text-white/60">タスク管理をゲーム化して楽しむ</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleAdventureToggle(!enableAdventure)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${enableAdventure ? "bg-emerald-500" : "bg-white/20"}`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enableAdventure ? "translate-x-7" : "translate-x-1"}`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-white/60" />
                            <div>
                                <p className="font-medium">Jojo (AIマスコット)</p>
                                <p className="text-sm text-white/60">ダッシュボードにマスコットを表示する</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleJojoToggle(!showJojo)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${showJojo ? "bg-emerald-500" : "bg-white/20"}`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showJojo ? "translate-x-7" : "translate-x-1"}`}
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

                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                >
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
                className="flex items-center justify-between gap-4"
            >
                {/* Error/Success Messages on the left */}
                <div className="flex-1">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm"
                        >
                            {success}
                        </motion.div>
                    )}
                </div>

                {/* Save button on the right */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {isSaving ? "保存中..." : "変更を保存"}
                </button>
            </motion.div>
            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">パスワードの変更</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    新しいパスワード
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                        placeholder="6文字以上"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    パスワードの確認
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                        placeholder="もう一度入力"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 text-white/60 hover:text-white text-sm transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                disabled={isSaving || !newPassword}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? "更新中..." : "変更する"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
