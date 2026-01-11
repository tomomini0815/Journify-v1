'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Zap, Star, Sparkles, Cookie, Loader2 } from 'lucide-react'

interface CompanionDetail {
    id: string
    nickname: string | null
    level: number
    experience: number
    happiness: number
    energy: number
    loyalty: number
    isActive: boolean
    companion: {
        id: string
        name: string
        species: string
        rarity: string
        description: string
        imageUrl: string
        skills: any[]
    }
}

interface CompanionDetailViewProps {
    companionId: string
    onBack: () => void
}

export function CompanionDetailView({ companionId, onBack }: CompanionDetailViewProps) {
    const [companion, setCompanion] = useState<CompanionDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (companionId) {
            fetchCompanion(companionId)
        }
    }, [companionId])

    const fetchCompanion = async (id: string) => {
        try {
            const res = await fetch('/api/user/companions')
            if (res.ok) {
                const data = await res.json()
                const found = data.companions.find((c: any) => c.id === id)
                setCompanion(found || null)
            }
        } catch (error) {
            console.error('Failed to fetch companion:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFeed = async (foodType: 'treat' | 'meal' | 'deluxe') => {
        if (!companion || !companionId) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/user/companions/${companionId}/feed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ foodType })
            })
            if (res.ok) {
                const data = await res.json()
                setCompanion(data.companion)
                setMessage(data.message)
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (error) {
            console.error('Failed to feed companion:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handlePlay = async () => {
        if (!companion || !companionId) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/user/companions/${companionId}/play`, {
                method: 'POST'
            })
            if (res.ok) {
                const data = await res.json()
                setCompanion(data.companion)
                setMessage(data.message)
                setTimeout(() => setMessage(''), 3000)
            } else {
                const error = await res.json()
                setMessage(error.error)
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (error) {
            console.error('Failed to play with companion:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleActivate = async () => {
        if (!companion || !companionId) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/user/companions/${companionId}/activate`, {
                method: 'PATCH'
            })
            if (res.ok) {
                const data = await res.json()
                setCompanion(data.companion)
                setMessage(data.message)
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (error) {
            console.error('Failed to activate companion:', error)
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        )
    }

    if (!companion) {
        return (
            <div className="text-center py-20">
                <p className="text-2xl text-white/60 mb-4">仲間が見つかりません</p>
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                    一覧に戻る
                </button>
            </div>
        )
    }

    const expNeeded = companion.level * 100
    const expProgress = (companion.experience / expNeeded) * 100

    return (
        <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                一覧に戻る
            </button>

            {/* Message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-center"
                >
                    {message}
                </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Companion Display */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    {/* Companion Image */}
                    <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
                        <div className="w-full h-full flex items-center justify-center text-9xl">
                            {companion.companion.species === 'cat' && '🐱'}
                            {companion.companion.species === 'fox' && '🦊'}
                            {companion.companion.species === 'dragon' && '🐉'}
                            {companion.companion.species === 'bird' && '🐦'}
                            {companion.companion.species === 'wolf' && '🐺'}
                            {companion.companion.species === 'sprite' && '✨'}
                            {/* Fallback to image if URL is valid image, but we are using emojis for seeds generally unless we updated them. 
                               Current logic in original was simple, sticking to it. If we updated seeds for companions too we would use Image here.
                               Wait, `companion.companion.imageUrl` might be used.
                            */}
                        </div>
                    </div>

                    {/* Name & Level */}
                    <div className="text-center mb-4">
                        <h1 className="text-3xl font-bold mb-2">
                            {companion.nickname || companion.companion.name}
                        </h1>
                        <p className="text-white/60 mb-2">{companion.companion.description}</p>
                        <div className="inline-block px-4 py-2 bg-white/10 rounded-full">
                            Level {companion.level}
                        </div>
                    </div>

                    {/* EXP Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-white/60 mb-2">
                            <span>EXP</span>
                            <span>{companion.experience} / {expNeeded}</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                                style={{ width: `${expProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5 text-pink-400" />
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>幸福度</span>
                                    <span>{companion.happiness}/100</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-pink-500 to-pink-400"
                                        style={{ width: `${companion.happiness}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>エネルギー</span>
                                    <span>{companion.energy}/100</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                                        style={{ width: `${companion.energy}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Star className="w-5 h-5 text-blue-400" />
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>忠誠度</span>
                                    <span>{companion.loyalty}/100</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                                        style={{ width: `${companion.loyalty}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    {/* Feed Section */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Cookie className="w-5 h-5" />
                            おやつをあげる
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleFeed('treat')}
                                disabled={actionLoading}
                                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 text-center"
                            >
                                <div className="text-2xl mb-2">🍪</div>
                                <div className="text-xs">スナック</div>
                                <div className="text-xs text-white/60">+5 ❤️ +3 ⚡</div>
                            </button>
                            <button
                                onClick={() => handleFeed('meal')}
                                disabled={actionLoading}
                                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 text-center"
                            >
                                <div className="text-2xl mb-2">🍖</div>
                                <div className="text-xs">ごはん</div>
                                <div className="text-xs text-white/60">+10 ❤️ +10 ⚡</div>
                            </button>
                            <button
                                onClick={() => handleFeed('deluxe')}
                                disabled={actionLoading}
                                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 text-center"
                            >
                                <div className="text-2xl mb-2">🧁</div>
                                <div className="text-xs">豪華</div>
                                <div className="text-xs text-white/60">+25 ❤️ +25 ⚡</div>
                            </button>
                        </div>
                    </div>

                    {/* Play Section */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            遊ぶ
                        </h2>
                        <button
                            onClick={handlePlay}
                            disabled={actionLoading}
                            className="w-full p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-white/10 rounded-xl transition-all disabled:opacity-50"
                        >
                            <div className="text-center">
                                <span className="font-bold block mb-1">ボールで遊ぶ</span>
                                <span className="text-xs text-white/60 text-center">+15 EXP -10 ⚡</span>
                            </div>
                        </button>
                    </div>

                    {/* Set Active Button */}
                    <button
                        onClick={handleActivate}
                        disabled={companion.isActive || actionLoading}
                        className={`w-full p-4 rounded-xl font-bold transition-all ${companion.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {companion.isActive ? '現在同行中' : '同行させる'}
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
