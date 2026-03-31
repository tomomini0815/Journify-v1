'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from "@/components/DashboardLayout"
import { Heart, Zap, Star, Cookie, Sparkles, Loader2, PawPrint, ArrowLeft, Gem, BookOpen, HelpCircle, Shirt, Store, Coins, Trophy, Gift } from 'lucide-react'
import { useGameStats } from '@/lib/hooks/useGame'
import { PetGacha } from '@/components/adventure/PetGacha'
import { PetGuide } from '@/components/adventure/PetGuide'
import { PetDressUp } from '@/components/adventure/PetDressUp'
import { PetOutfitShop } from '@/components/adventure/PetOutfitShop'
import { PetAvatar } from '@/components/adventure/PetAvatar'

interface UserCompanion {
    id: string
    nickname: string | null
    level: number
    experience: number
    happiness: number
    energy: number
    loyalty: number
    isActive: boolean
    equippedOutfits?: {
        hat?: string
        clothes?: string
        accessory?: string
    } | null
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

const speciesEmoji: Record<string, string> = {
    cat: '🐱', fox: '🦊', dragon: '🐉', bird: '🐦', wolf: '🐺', sprite: '✨',
    dog: '🐶', rabbit: '🐰', hamster: '🐹', bear: '🐻', panda: '🐼',
    usapyon: '🐰', nekorisu: '🐿️', mochikuma: '🧸', pentanuki: '🐧',
    hamuri: '🐹', inkoala: '🦜', mikerisu: '🐿️', kotorisu: '🐦',
    hoshinashi: '🍆', inudamashi: '🐕',
}

const moodEmojis = [
    { min: 80, emoji: '😍', label: 'ご機嫌MAX！', color: 'text-cyan-400' },
    { min: 60, emoji: '😊', label: 'ハッピー♪', color: 'text-emerald-400' },
    { min: 40, emoji: '😐', label: 'まあまあ', color: 'text-white/60' },
    { min: 20, emoji: '😢', label: 'さみしいよ…', color: 'text-blue-400' },
    { min: 0, emoji: '😭', label: 'お腹すいた…', color: 'text-slate-400' },
]

const getMood = (happiness: number) => {
    return moodEmojis.find(m => happiness >= m.min) || moodEmojis[moodEmojis.length - 1]
}

const rarityGradients: Record<string, string> = {
    common: 'from-slate-400 to-slate-500',
    uncommon: 'from-emerald-400 to-teal-500',
    rare: 'from-cyan-400 to-sky-500',
    epic: 'from-blue-500 to-indigo-500',
    legendary: 'from-amber-400 to-orange-500',
}

// Fun speech bubbles
const speechBubbles: Record<string, string[]> = {
    idle: ['zzZ...💤', 'なでて～🤗', 'おやつ！🍪', 'あそぼ！🎾', 'わーい！✨', 'すき💕'],
    happy: ['うれしい！💖', 'もっと！✨', 'だいすき！💕', 'ありがとう！🌟'],
    hungry: ['おなかすいた…🍖', 'ごはんまだ？🥺', 'ぐぅ～…'],
    tired: ['つかれた…💤', 'ねむい…😴', 'おやすみ…🌙'],
}

const getSpeech = (companion: UserCompanion) => {
    let pool = speechBubbles.idle
    if (companion.energy < 30) pool = speechBubbles.tired
    else if (companion.happiness < 30) pool = speechBubbles.hungry
    else if (companion.happiness > 70) pool = speechBubbles.happy
    return pool[Math.floor(Math.random() * pool.length)]
}

export default function AdventurePage() {
    const { data: stats, mutate: mutateStats } = useGameStats()
    const [companions, setCompanions] = useState<UserCompanion[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [speechBubble, setSpeechBubble] = useState('')
    const [showReaction, setShowReaction] = useState('')
    const [bounceKey, setBounceKey] = useState(0)

    // Modals
    const [isGachaOpen, setIsGachaOpen] = useState(false)
    const [isGuideOpen, setIsGuideOpen] = useState(false)
    const [isDressUpOpen, setIsDressUpOpen] = useState(false)
    const [isOutfitShopOpen, setIsOutfitShopOpen] = useState(false)
    const petSectionRef = useRef<HTMLDivElement>(null)

    // Outfit emojis cache (for displaying equipped outfits)
    const [outfitEmojiMap, setOutfitEmojiMap] = useState<Record<string, string>>({})

    const fetchCompanions = useCallback(async () => {
        try {
            const res = await fetch('/api/user/companions')
            if (res.ok) {
                const data = await res.json()
                setCompanions(data.companions)
                // Auto-select active companion or first one if not selected
                if (!selectedId && data.companions.length > 0) {
                    const active = data.companions.find((c: UserCompanion) => c.isActive)
                    setSelectedId(active?.id || data.companions[0].id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch companions:', error)
        } finally {
            setLoading(false)
        }
    }, [selectedId])

    useEffect(() => { fetchCompanions() }, [fetchCompanions])

    // Fetch outfit emoji map for display
    useEffect(() => {
        fetch('/api/pet-outfits').then(r => r.json()).then(data => {
            const map: Record<string, string> = {}
                ; (data.outfits || []).forEach((o: any) => { map[o.id] = o.emoji })
            setOutfitEmojiMap(map)
        }).catch(() => { })
    }, [])

    const selected = companions.find(c => c.id === selectedId) || null

    // Random speech bubble
    useEffect(() => {
        if (!selected) return
        const showBubble = () => {
            setSpeechBubble(getSpeech(selected))
            setTimeout(() => setSpeechBubble(''), 3000)
        }
        showBubble()
        const interval = setInterval(showBubble, 8000)
        return () => clearInterval(interval)
    }, [selected?.id, selected?.happiness, selected?.energy])

    const triggerReaction = (emoji: string) => {
        setShowReaction(emoji)
        setBounceKey(prev => prev + 1)
        scrollToPet()
        setTimeout(() => setShowReaction(''), 1500)
    }

    const scrollToPet = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && petSectionRef.current) {
            petSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    const handleFeed = async (foodType: 'treat' | 'meal' | 'deluxe') => {
        if (!selectedId) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/user/companions/${selectedId}/feed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ foodType })
            })
            if (res.ok) {
                const data = await res.json()
                // Update the selected companion in the list
                setCompanions(prev => prev.map(c => c.id === selectedId ? data.companion : c))
                setMessage(data.message)
                triggerReaction(foodType === 'treat' ? '🍪' : foodType === 'meal' ? '🍖' : '🧁')
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (error) {
            console.error('Failed to feed:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handlePlay = async () => {
        if (!selectedId) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/user/companions/${selectedId}/play`, { method: 'POST' })
            if (res.ok) {
                const data = await res.json()
                setCompanions(prev => prev.map(c => c.id === selectedId ? data.companion : c))
                setMessage(data.message)
                triggerReaction('🎾')
                setTimeout(() => setMessage(''), 3000)
            } else {
                const error = await res.json()
                setMessage(error.error)
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (error) {
            console.error('Failed to play:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handlePet = async () => {
        if (!selected) return
        triggerReaction('💕')
        setSpeechBubble('きもちいい～💕')
        setTimeout(() => setSpeechBubble(''), 2500)
    }

    const handleActivate = async () => {
        if (!selectedId) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/user/companions/${selectedId}/activate`, { method: 'PATCH' })
            if (res.ok) {
                const data = await res.json()
                // Refresh all companions since active state changed
                await fetchCompanions()
                setMessage(data.message)
                triggerReaction('⭐')
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (error) {
            console.error('Failed to activate:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleSummonComplete = async () => {
        await fetchCompanions()
        await mutateStats() // Refresh crystals
        setMessage('新しい仲間が増えました！')
        setTimeout(() => setMessage(''), 3000)
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[500px]">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto pb-20">
                {/* Header with Actions */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left"
                    >
                        <h1 className="text-4xl md:text-5xl font-black mb-2 whitespace-nowrap">
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                                🐾 ペットハウス
                            </span>
                        </h1>
                        <p className="text-white/50 text-sm mt-1 whitespace-nowrap">
                            ペットのお世話をして仲良くなろう！
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 self-end md:self-auto"
                    >
                        {/* Guide Button */}
                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 text-white/60 hover:text-white"
                            title="遊び方ガイド"
                        >
                            <HelpCircle size={20} />
                        </button>

                        {/* Gacha Button */}
                        <motion.button
                            onClick={() => setIsGachaOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-full font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                        >
                            <Gem size={16} className="text-cyan-300" />
                            <span>召喚</span>
                            <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs font-mono ml-1">
                                {stats?.crystals || 0}
                            </span>
                        </motion.button>

                        {/* Outfit Shop Button */}
                        <motion.button
                            onClick={() => setIsOutfitShopOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105"
                        >
                            <Store size={16} className="text-emerald-200" />
                            <span>衣装</span>
                            <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs font-mono ml-1">
                                🪙{stats?.gold || 0}
                            </span>
                        </motion.button>

                    </motion.div>
                </div>

                {companions.length === 0 ? (
                    /* Empty State with Gacha Prompt */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10"
                    >
                        <div className="text-8xl mb-6 animate-bounce">🥚</div>
                        <h2 className="text-2xl font-bold mb-2 text-white/80">まだペットがいません</h2>
                        <p className="text-white/50 mb-8">
                            クリスタルを使って、最初の仲間を召喚しましょう！
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsGachaOpen(true)}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/30 flex items-center gap-2 mx-auto"
                        >
                            <Gem className="w-5 h-5" />
                            ガチャを回す (100💎)
                        </motion.button>
                        <div className="mt-4 text-xs text-white/40">
                            ※ 現在の所持クリスタル: {stats?.crystals || 0}
                        </div>
                    </motion.div>
                ) : selected ? (
                    <>
                        {/* Message Toast */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center text-sm font-bold text-emerald-100"
                                >
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Pet Display - Rest of the UI remains largely same but ensuring layout consistency */}
                        <div className="grid md:grid-cols-5 gap-6 mb-8">
                            {/* Left: Pet Visual (3 cols) */}
                            <motion.div
                                ref={petSectionRef}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="md:col-span-3 relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 overflow-hidden min-h-[400px] flex flex-col justify-center"
                            >
                                {/* Background glow - using Tailwind classes instead of dynamic style for safety if rarity missing */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradients[selected.companion.rarity] || rarityGradients.common} opacity-5 rounded-3xl pointer-events-none`} />

                                {/* Active badge */}
                                {selected.isActive && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/80 rounded-full text-xs font-bold flex items-center gap-1 z-20">
                                        <PawPrint size={12} /> 同行中
                                    </div>
                                )}

                                {/* Speech Bubble */}
                                <AnimatePresence>
                                    {speechBubble && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.8 }}
                                            className="absolute top-10 left-1/2 -translate-x-1/2 z-30 w-full text-center"
                                        >
                                            <div className="inline-block bg-white/90 text-slate-800 px-6 py-2 rounded-2xl rounded-bl-sm text-sm font-bold shadow-xl">
                                                {speechBubble}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Reaction Animation */}
                                <AnimatePresence>
                                    {showReaction && (
                                        <motion.div
                                            key={bounceKey}
                                            initial={{ opacity: 1, y: 0, scale: 1 }}
                                            animate={{ opacity: 0, y: -60, scale: 2 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1.0, ease: "easeOut" }}
                                            className="absolute top-1/4 left-1/2 -translate-x-1/2 z-40 text-6xl pointer-events-none select-none"
                                        >
                                            {showReaction}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Pet Full-Body Avatar */}
                                <motion.div
                                    key={selected.id}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative z-10 flex items-center justify-center py-4"
                                >
                                    <motion.div
                                        key={bounceKey}
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: showReaction ? [0, -3, 3, -3, 0] : 0,
                                        }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                    >
                                        <PetAvatar
                                            species={selected.companion.species}
                                            size={180}
                                            onClick={handlePet}
                                            equippedOutfits={{
                                                hat: selected.equippedOutfits?.hat ? outfitEmojiMap[selected.equippedOutfits.hat] : undefined,
                                                clothes: selected.equippedOutfits?.clothes ? outfitEmojiMap[selected.equippedOutfits.clothes] : undefined,
                                                accessory: selected.equippedOutfits?.accessory ? outfitEmojiMap[selected.equippedOutfits.accessory] : undefined,
                                            }}
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* Pet Name & Mood */}
                                <div className="relative z-10 text-center space-y-2 mt-4">
                                    <h2 className="text-3xl font-black tracking-tight">
                                        {selected.nickname || selected.companion.name}
                                    </h2>
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className={`inline-block px-3 py-0.5 border border-white/20 bg-white/5 rounded-full text-xs font-bold uppercase tracking-wider ${rarityGradients[selected.companion.rarity] ? 'text-white' : 'text-slate-300'}`}>
                                            {selected.companion.rarity}
                                        </span>
                                        <span className="px-3 py-0.5 bg-white/10 rounded-full text-xs font-bold">
                                            Lv.{selected.level}
                                        </span>
                                    </div>

                                    {/* Equipped Outfits Display */}
                                    {selected.equippedOutfits && Object.keys(selected.equippedOutfits).length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center justify-center gap-2 flex-wrap pt-1"
                                        >
                                            {selected.equippedOutfits.hat && outfitEmojiMap[selected.equippedOutfits.hat] && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-pink-500/15 border border-pink-500/25 rounded-full">
                                                    <span className="text-base">{outfitEmojiMap[selected.equippedOutfits.hat]}</span>
                                                    <span className="text-[10px] font-bold text-pink-300">帽子</span>
                                                </div>
                                            )}
                                            {selected.equippedOutfits.clothes && outfitEmojiMap[selected.equippedOutfits.clothes] && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 border border-purple-500/25 rounded-full">
                                                    <span className="text-base">{outfitEmojiMap[selected.equippedOutfits.clothes]}</span>
                                                    <span className="text-[10px] font-bold text-purple-300">服</span>
                                                </div>
                                            )}
                                            {selected.equippedOutfits.accessory && outfitEmojiMap[selected.equippedOutfits.accessory] && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/25 rounded-full">
                                                    <span className="text-base">{outfitEmojiMap[selected.equippedOutfits.accessory]}</span>
                                                    <span className="text-[10px] font-bold text-amber-300">アクセ</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {(() => {
                                        const mood = getMood(selected.happiness)
                                        return (
                                            <p className={`text-sm font-bold ${mood.color} flex items-center justify-center gap-2`}>
                                                {mood.emoji} {mood.label}
                                            </p>
                                        )
                                    })()}
                                </div>
                            </motion.div>

                            {/* Right: Stats & Actions (2 cols) */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="md:col-span-2 space-y-4"
                            >
                                {/* Stats Card */}
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
                                    <h3 className="font-bold text-xs text-white/40 uppercase tracking-widest mb-1">ステータス</h3>

                                    {/* EXP */}
                                    <div>
                                        <div className="flex justify-between text-xs text-white/50 mb-1">
                                            <span>EXP</span>
                                            <span>{selected.experience} / {selected.level * 100}</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (selected.experience / (selected.level * 100)) * 100)}%` }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Happiness */}
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-4 h-4 text-sky-400 shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>幸福度</span>
                                                <span className="text-white/50">{selected.happiness}/100</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                                                    animate={{ width: `${selected.happiness}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Energy */}
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>エネルギー</span>
                                                <span className="text-white/50">{selected.energy}/100</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                                                    animate={{ width: `${selected.energy}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Loyalty */}
                                    <div className="flex items-center gap-3">
                                        <Star className="w-4 h-4 text-blue-400 shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>なかよし度</span>
                                                <span className="text-white/50">{selected.loyalty}/100</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                                    animate={{ width: `${selected.loyalty}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                                    <h3 className="font-bold text-xs text-white/40 uppercase tracking-widest mb-3">お世話メニュー</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleFeed('treat')}
                                            disabled={actionLoading}
                                            className="p-3 bg-white/5 hover:bg-amber-500/20 rounded-xl transition-colors disabled:opacity-50 text-center border border-transparent hover:border-amber-500/30 group whitespace-nowrap"
                                        >
                                            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🍪</div>
                                            <div className="text-xs font-bold">おやつ</div>
                                            <div className="text-[10px] text-white/40 group-hover:text-amber-200">+5❤️ +3⚡</div>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleFeed('meal')}
                                            disabled={actionLoading}
                                            className="p-3 bg-white/5 hover:bg-orange-500/20 rounded-xl transition-colors disabled:opacity-50 text-center border border-transparent hover:border-orange-500/30 group whitespace-nowrap"
                                        >
                                            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🍖</div>
                                            <div className="text-xs font-bold">ごはん</div>
                                            <div className="text-[10px] text-white/40 group-hover:text-orange-200">+10❤️ +10⚡</div>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleFeed('deluxe')}
                                            disabled={actionLoading}
                                            className="p-3 bg-white/5 hover:bg-sky-500/20 rounded-xl transition-colors disabled:opacity-50 text-center border border-transparent hover:border-sky-500/30 group whitespace-nowrap"
                                        >
                                            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🧁</div>
                                            <div className="text-xs font-bold">ごちそう</div>
                                            <div className="text-[10px] text-white/40 group-hover:text-sky-200">+25❤️ +25⚡</div>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handlePlay}
                                            disabled={actionLoading}
                                            className="p-3 bg-white/5 hover:bg-emerald-500/20 rounded-xl transition-colors disabled:opacity-50 text-center border border-transparent hover:border-emerald-500/30 group whitespace-nowrap"
                                        >
                                            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎾</div>
                                            <div className="text-xs font-bold">あそぶ</div>
                                            <div className="text-[10px] text-white/40 group-hover:text-emerald-200">+15 EXP</div>
                                        </motion.button>
                                    </div>

                                    {/* Pet Button (full width) */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePet}
                                        className="w-full mt-2 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/20 rounded-xl transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
                                    >
                                        <span className="text-xl group-hover:scale-125 transition-transform">🤗</span>
                                        <span className="text-xs font-bold">なでなで</span>
                                    </motion.button>

                                    {/* Dress Up Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsDressUpOpen(true)}
                                        className="w-full mt-2 p-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-cyan-500/20 border border-emerald-500/20 rounded-xl transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
                                    >
                                        <Shirt size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold">きせかえ</span>
                                    </motion.button>

                                    {/* Set Active */}
                                    {!selected.isActive && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleActivate}
                                            disabled={actionLoading}
                                            className="w-full mt-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                                        >
                                            <Sparkles size={16} className="text-yellow-400" />
                                            パートナーにする
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* All Pets Grid */}
                        {companions.length > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <PawPrint size={14} />
                                    みんなのペット ({companions.length})
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {companions.map((uc, index) => (
                                        <motion.button
                                            key={uc.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedId(uc.id)}
                                            className={`relative p-4 rounded-2xl border transition-all text-center group ${selectedId === uc.id
                                                ? 'bg-white/10 border-white/30 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/10'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            {uc.isActive && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] shadow-lg shadow-emerald-500/50">
                                                    ⭐
                                                </div>
                                            )}
                                            <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                <PetAvatar species={uc.companion.species} size={50} animate={false} />
                                            </div>
                                            <div className="text-xs font-bold truncate">
                                                {uc.nickname || uc.companion.name}
                                            </div>
                                            <div className="text-[10px] text-white/40">
                                                Lv.{uc.level}
                                            </div>
                                            {/* Mini happiness indicator */}
                                            <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all"
                                                    style={{ width: `${uc.happiness}%` }}
                                                />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </>
                ) : null}

                {/* Modals */}
                <PetGacha
                    isOpen={isGachaOpen}
                    onClose={() => setIsGachaOpen(false)}
                    crystals={stats?.crystals || 0}
                    onSummonComplete={handleSummonComplete}
                />

                <PetGuide
                    isOpen={isGuideOpen}
                    onClose={() => setIsGuideOpen(false)}
                />

                {/* Dress Up Modal */}
                {selected && (
                    <PetDressUp
                        isOpen={isDressUpOpen}
                        onClose={() => setIsDressUpOpen(false)}
                        companionId={selected.id}
                        companionSpecies={selected.companion.species}
                        companionName={selected.nickname || selected.companion.name}
                        equippedOutfits={selected.equippedOutfits || {}}
                        onEquipChange={(outfits) => {
                            setCompanions(prev => prev.map(c =>
                                c.id === selected.id ? { ...c, equippedOutfits: outfits } : c
                            ))
                        }}
                    />
                )}

                {/* Outfit Shop Modal */}
                <PetOutfitShop
                    isOpen={isOutfitShopOpen}
                    onClose={() => setIsOutfitShopOpen(false)}
                    gold={stats?.gold || 0}
                    petLevel={selected?.level || 1}
                    onPurchase={() => mutateStats()}
                />

                {/* Loyalty Milestones Section */}
                {selected && selected.loyalty > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Trophy size={14} className="text-amber-400" /> なかよし度マイルストーン
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { level: 10, emoji: '💬', label: '新セリフ', desc: 'おしゃべり上手に' },
                                { level: 30, emoji: '🎭', label: '特殊リアクション', desc: '新しい表情' },
                                { level: 50, emoji: '👗', label: '限定衣装', desc: '特別な一着' },
                                { level: 80, emoji: '🌟', label: '進化', desc: '見た目が変化！' },
                                { level: 100, emoji: '🏆', label: 'レジェンド', desc: '最高の絆' },
                            ].map(milestone => {
                                const achieved = selected.loyalty >= milestone.level
                                const progress = Math.min(100, (selected.loyalty / milestone.level) * 100)
                                return (
                                    <div
                                        key={milestone.level}
                                        className={`p-3 rounded-xl border text-center transition-all ${achieved
                                            ? 'bg-amber-500/10 border-amber-500/30'
                                            : 'bg-white/5 border-white/10 opacity-60'
                                            }`}
                                    >
                                        <div className={`text-2xl mb-1 ${achieved ? '' : 'grayscale'}`}>
                                            {achieved ? milestone.emoji : '🔒'}
                                        </div>
                                        <div className="text-xs font-bold truncate">{milestone.label}</div>
                                        <div className="text-[10px] text-white/40">{milestone.desc}</div>
                                        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${achieved ? 'bg-amber-400' : 'bg-white/30'
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-white/30 mt-1">{selected.loyalty}/{milestone.level}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    )
}
