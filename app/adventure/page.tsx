'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from "@/components/DashboardLayout"
import { Heart, Zap, Star, Cookie, Sparkles, Loader2, PawPrint, ArrowLeft, Gem, BookOpen, HelpCircle, Shirt, Store, Coins, Trophy, Gift, CheckCircle2, Home, ScrollText } from 'lucide-react'
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

type WishAction = 'pet' | 'play' | 'feed'

interface DailyWish {
    id: string
    action: WishAction
    title: string
    description: string
    buttonLabel: string
    rewardText: string
    reaction: string
}

const dailyWishes: DailyWish[] = [
    {
        id: 'warmup-pet',
        action: 'pet',
        title: '朝のあいさつ',
        description: 'なでなでして、今日の冒険を始めよう。',
        buttonLabel: 'なでなでする',
        rewardText: '+10 EXP / +20 gold',
        reaction: '💕',
    },
    {
        id: 'snack-time',
        action: 'feed',
        title: 'ごほうびタイム',
        description: '好きなごはんをあげると、ハウスに活気が戻ります。',
        buttonLabel: 'ごはんをあげる',
        rewardText: '+10 EXP / +20 gold',
        reaction: '🍪',
    },
    {
        id: 'bond-play',
        action: 'play',
        title: 'いっしょに遊ぶ',
        description: '少し遊んで、絆ゲージを進めよう。',
        buttonLabel: 'あそぶ',
        rewardText: '+10 EXP / +20 gold',
        reaction: '🎾',
    },
]

const getTodayKey = () => new Date().toISOString().slice(0, 10)

const pickDailyWish = (companionId: string) => {
    const seed = `${getTodayKey()}-${companionId}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return dailyWishes[seed % dailyWishes.length]
}

const getHouseStage = (companion: UserCompanion | null, companionCount: number) => {
    const score = (companion?.level || 1) * 8 + (companion?.loyalty || 0) + companionCount * 6

    if (score >= 130) {
        return {
            name: '星の温室',
            level: 4,
            progress: 100,
            description: '部屋いっぱいに思い出がきらめいています。',
            scene: 'from-cyan-400/20 via-fuchsia-400/10 to-amber-300/20',
            next: '最高ランク',
        }
    }

    if (score >= 85) {
        return {
            name: '空中庭園',
            level: 3,
            progress: Math.min(100, ((score - 85) / 45) * 100),
            description: 'お気に入りの場所が増えて、毎日少しずつにぎやかに。',
            scene: 'from-emerald-400/20 via-sky-400/10 to-cyan-300/20',
            next: '星の温室',
        }
    }

    if (score >= 45) {
        return {
            name: '森の小屋',
            level: 2,
            progress: Math.min(100, ((score - 45) / 40) * 100),
            description: '安心できる居場所になってきました。',
            scene: 'from-lime-400/20 via-emerald-400/10 to-teal-300/20',
            next: '空中庭園',
        }
    }

    return {
        name: '小さな部屋',
        level: 1,
        progress: Math.min(100, (score / 45) * 100),
        description: 'ここからペットとの暮らしが育っていきます。',
        scene: 'from-slate-400/20 via-cyan-400/10 to-blue-300/20',
        next: '森の小屋',
    }
}

const getBondRank = (companion: UserCompanion | null) => {
    const loyalty = companion?.loyalty || 0
    if (loyalty >= 90) return { level: 5, title: '運命の相棒', nextAt: 100, progress: 100 }
    if (loyalty >= 70) return { level: 4, title: '心が通じる仲', nextAt: 90, progress: ((loyalty - 70) / 20) * 100 }
    if (loyalty >= 45) return { level: 3, title: '頼れる仲間', nextAt: 70, progress: ((loyalty - 45) / 25) * 100 }
    if (loyalty >= 20) return { level: 2, title: 'なかよし', nextAt: 45, progress: ((loyalty - 20) / 25) * 100 }
    return { level: 1, title: '出会ったばかり', nextAt: 20, progress: (loyalty / 20) * 100 }
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
    const [completedWishKey, setCompletedWishKey] = useState<string | null>(null)

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
    const dailyWish = useMemo(() => selected ? pickDailyWish(selected.id) : null, [selected?.id])
    const dailyWishKey = selected && dailyWish ? `pet-house-wish:${getTodayKey()}:${selected.id}:${dailyWish.id}` : null
    const isDailyWishComplete = Boolean(dailyWishKey && completedWishKey === dailyWishKey)
    const houseStage = useMemo(() => getHouseStage(selected, companions.length), [selected, companions.length])
    const bondRank = useMemo(() => getBondRank(selected), [selected])

    useEffect(() => {
        if (!dailyWishKey || typeof window === 'undefined') return
        setCompletedWishKey(window.localStorage.getItem(dailyWishKey) === 'done' ? dailyWishKey : null)
    }, [dailyWishKey])

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

    const completeDailyWish = async (action: WishAction) => {
        if (!dailyWish || !dailyWishKey || isDailyWishComplete || dailyWish.action !== action) return

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(dailyWishKey, 'done')
        }
        setCompletedWishKey(dailyWishKey)
        setMessage(`お願い達成！ ${dailyWish.rewardText}`)
        setSpeechBubble('今日のお願い、ありがとう！')
        triggerReaction(dailyWish.reaction)

        try {
            const res = await fetch('/api/game/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xp: 10, gold: 20 })
            })
            if (res.ok) {
                await mutateStats()
            }
        } catch (error) {
            console.error('Failed to grant daily wish reward:', error)
        }

        setTimeout(() => {
            setMessage('')
            setSpeechBubble('')
        }, 3000)
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
                await completeDailyWish('feed')
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
                await completeDailyWish('play')
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
        await completeDailyWish('pet')
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
                        <h1 className="mb-2 whitespace-nowrap text-2xl font-black md:text-3xl">
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
                            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 hover:from-cyan-500 hover:to-blue-500"
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
                            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 hover:from-emerald-500 hover:to-teal-500"
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
                            className="mx-auto flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 font-bold text-white shadow-lg shadow-cyan-500/30"
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

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 grid gap-3 md:grid-cols-3"
                        >
                            <div className="relative overflow-hidden rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3.5">
                                <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-cyan-300/10 blur-2xl" />
                                <div className="relative">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200/80">
                                            <ScrollText size={13} />
                                            今日のお願い
                                        </div>
                                        {isDailyWishComplete && (
                                            <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                                                <CheckCircle2 size={11} />
                                                達成
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mb-1 text-base font-black leading-tight text-white">{dailyWish?.title}</h3>
                                    <p className="text-xs leading-snug text-white/60">{dailyWish?.description}</p>
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <span className="text-xs font-bold text-cyan-200">{dailyWish?.rewardText}</span>
                                        <button
                                            onClick={() => {
                                                if (!dailyWish || isDailyWishComplete) return
                                                if (dailyWish.action === 'pet') handlePet()
                                                if (dailyWish.action === 'play') handlePlay()
                                                if (dailyWish.action === 'feed') handleFeed('treat')
                                            }}
                                            disabled={actionLoading || isDailyWishComplete}
                                            className="rounded-lg bg-cyan-400 px-2.5 py-1.5 text-[11px] font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-default disabled:bg-white/10 disabled:text-white/35"
                                        >
                                            {isDailyWishComplete ? '完了済み' : dailyWish?.buttonLabel}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3.5">
                                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-200/80">
                                    <Star size={13} />
                                    絆レベル
                                </div>
                                <div className="flex items-end justify-between gap-3">
                                    <div>
                                        <div className="text-2xl font-black leading-none text-white">Lv.{bondRank.level}</div>
                                        <div className="mt-1 text-xs font-bold text-amber-100">{bondRank.title}</div>
                                    </div>
                                    <div className="text-right text-[11px] text-white/45">
                                        なかよし度<br />
                                        <span className="font-mono text-white/70">{selected.loyalty}/100</span>
                                    </div>
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400"
                                        animate={{ width: `${Math.min(100, bondRank.progress)}%` }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </div>
                                <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-white/50">
                                    お世話やお願い達成で、反応や解放要素が増えていきます。
                                </p>
                            </div>

                            <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${houseStage.scene} p-3.5`}>
                                <div className="absolute inset-x-6 bottom-0 h-12 rounded-t-full bg-black/15 blur-xl" />
                                <div className="relative">
                                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/60">
                                        <Home size={13} />
                                        ハウス成長
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-base font-black leading-tight text-white">{houseStage.name}</div>
                                            <div className="text-[11px] text-white/50">Stage {houseStage.level}</div>
                                        </div>
                                        <div className="text-3xl leading-none">
                                            {houseStage.level === 1 ? '🛋️' : houseStage.level === 2 ? '🏡' : houseStage.level === 3 ? '🌿' : '✨'}
                                        </div>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-xs leading-snug text-white/60">{houseStage.description}</p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                                                animate={{ width: `${houseStage.progress}%` }}
                                                transition={{ duration: 0.6 }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-white/50">{houseStage.next}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

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
                                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-white/5 px-2 text-center transition-colors hover:border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-50 group whitespace-nowrap"
                                        >
                                            <div className="text-lg group-hover:scale-110 transition-transform">🍪</div>
                                            <div className="text-[11px] font-bold">おやつ</div>
                                            <div className="text-[9px] text-white/40 group-hover:text-amber-200">+5❤️ +3⚡</div>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleFeed('meal')}
                                            disabled={actionLoading}
                                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-white/5 px-2 text-center transition-colors hover:border-orange-500/30 hover:bg-orange-500/20 disabled:opacity-50 group whitespace-nowrap"
                                        >
                                            <div className="text-lg group-hover:scale-110 transition-transform">🍖</div>
                                            <div className="text-[11px] font-bold">ごはん</div>
                                            <div className="text-[9px] text-white/40 group-hover:text-orange-200">+10❤️ +10⚡</div>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleFeed('deluxe')}
                                            disabled={actionLoading}
                                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-white/5 px-2 text-center transition-colors hover:border-sky-500/30 hover:bg-sky-500/20 disabled:opacity-50 group whitespace-nowrap"
                                        >
                                            <div className="text-lg group-hover:scale-110 transition-transform">🧁</div>
                                            <div className="text-[11px] font-bold">ごちそう</div>
                                            <div className="text-[9px] text-white/40 group-hover:text-sky-200">+25❤️ +25⚡</div>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handlePlay}
                                            disabled={actionLoading}
                                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-white/5 px-2 text-center transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50 group whitespace-nowrap"
                                        >
                                            <div className="text-lg group-hover:scale-110 transition-transform">🎾</div>
                                            <div className="text-[11px] font-bold">あそぶ</div>
                                            <div className="text-[9px] text-white/40 group-hover:text-emerald-200">+15 EXP</div>
                                        </motion.button>
                                    </div>

                                    {/* Pet Button (full width) */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePet}
                                        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 transition-all hover:from-cyan-500/20 hover:to-blue-500/20 group whitespace-nowrap"
                                    >
                                        <span className="text-xl group-hover:scale-125 transition-transform">🤗</span>
                                        <span className="text-xs font-bold">なでなで</span>
                                    </motion.button>

                                    {/* Dress Up Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsDressUpOpen(true)}
                                        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-4 transition-all hover:from-emerald-500/20 hover:to-cyan-500/20 group whitespace-nowrap"
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
                                            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-bold transition-all hover:bg-white/20 disabled:opacity-50 whitespace-nowrap"
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
