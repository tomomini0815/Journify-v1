'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Store, Loader2, Lock, Coins, ShoppingBag, Check, Sparkles } from 'lucide-react'

interface PetOutfit {
    id: string
    name: string
    category: string
    emoji: string
    rarity: string
    price: number
    unlockLevel: number
    description: string | null
}

interface PetOutfitShopProps {
    isOpen: boolean
    onClose: () => void
    gold: number
    petLevel: number
    onPurchase: () => void
}

const CATEGORY_TABS = [
    { id: 'all', label: 'すべて', icon: '🛍️' },
    { id: 'hat', label: '帽子', icon: '🎩' },
    { id: 'clothes', label: '服', icon: '👕' },
    { id: 'accessory', label: 'アクセ', icon: '💎' },
]

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const RARITY_LABELS: Record<string, string> = {
    common: 'コモン', uncommon: 'アンコモン', rare: 'レア', epic: 'エピック', legendary: 'レジェンド'
}
const RARITY_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    common: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-300', glow: '' },
    uncommon: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-300', glow: '' },
    rare: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-300', glow: 'shadow-cyan-500/10' },
    epic: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-300', glow: 'shadow-indigo-500/10' },
    legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-300', glow: 'shadow-amber-500/20' },
}

export function PetOutfitShop({ isOpen, onClose, gold, petLevel, onPurchase }: PetOutfitShopProps) {
    const [allOutfits, setAllOutfits] = useState<PetOutfit[]>([])
    const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [buyingId, setBuyingId] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState('all')
    const [purchaseMessage, setPurchaseMessage] = useState('')
    const [currentGold, setCurrentGold] = useState(gold)

    useEffect(() => { setCurrentGold(gold) }, [gold])

    useEffect(() => {
        if (isOpen) fetchData()
    }, [isOpen])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [shopRes, ownedRes] = await Promise.all([
                fetch('/api/pet-outfits'),
                fetch('/api/user/pet-outfits')
            ])
            if (shopRes.ok) {
                const shopData = await shopRes.json()
                setAllOutfits(shopData.outfits || [])
            }
            if (ownedRes.ok) {
                const ownedData = await ownedRes.json()
                const ids = new Set<string>((ownedData.outfits || []).map((o: any) => o.outfitId))
                setOwnedIds(ids)
            }
        } catch (error) {
            console.error('Failed to load shop:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBuy = async (outfit: PetOutfit) => {
        setBuyingId(outfit.id)
        setPurchaseMessage('')
        try {
            const res = await fetch('/api/user/pet-outfits/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outfitId: outfit.id })
            })
            const data = await res.json()
            if (res.ok) {
                setOwnedIds(prev => new Set([...prev, outfit.id]))
                setCurrentGold(data.remainingGold)
                setPurchaseMessage(`✨ ${outfit.name}を手に入れた！`)
                setTimeout(() => setPurchaseMessage(''), 3000)
                onPurchase()
            } else {
                setPurchaseMessage(`❌ ${data.error}`)
                setTimeout(() => setPurchaseMessage(''), 3000)
            }
        } catch (error) {
            console.error('Purchase failed:', error)
        } finally {
            setBuyingId(null)
        }
    }

    const filtered = allOutfits
        .filter(o => activeCategory === 'all' || o.category === activeCategory)
        .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-5 border-b border-white/10 shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Store className="w-6 h-6 text-amber-400" />
                                <h2 className="font-bold text-lg bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                                    衣装ショップ
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                                    <Coins className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-bold text-amber-300">{currentGold}</span>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-1.5">
                            {CATEGORY_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveCategory(tab.id)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeCategory === tab.id
                                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                            : 'bg-white/5 border border-transparent text-white/50 hover:bg-white/10'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Purchase toast */}
                    <AnimatePresence>
                        {purchaseMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mx-5 mt-3 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-center text-sm font-bold text-emerald-200"
                            >
                                {purchaseMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Items Grid */}
                    <div className="flex-1 overflow-y-auto p-5 min-h-0">
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16 text-white/40">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-40" />
                                <p>商品が見つかりませんでした</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map((outfit) => {
                                    const owned = ownedIds.has(outfit.id)
                                    const locked = petLevel < outfit.unlockLevel
                                    const canAfford = currentGold >= outfit.price
                                    const style = RARITY_STYLES[outfit.rarity] || RARITY_STYLES.common

                                    return (
                                        <motion.div
                                            key={outfit.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${owned
                                                    ? 'bg-white/5 border-emerald-500/20 opacity-60'
                                                    : `${style.bg} ${style.border} ${style.glow ? `shadow-lg ${style.glow}` : ''}`
                                                }`}
                                        >
                                            {/* Icon */}
                                            <div className={`text-3xl shrink-0 ${outfit.rarity === 'legendary' ? 'animate-pulse' : ''}`}>
                                                {outfit.emoji}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-bold text-sm truncate">{outfit.name}</span>
                                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                                                        {RARITY_LABELS[outfit.rarity] || outfit.rarity}
                                                    </span>
                                                </div>
                                                {outfit.description && (
                                                    <p className="text-xs text-white/40 line-clamp-1">{outfit.description}</p>
                                                )}
                                                {locked && (
                                                    <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> Lv.{outfit.unlockLevel} 必要
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action */}
                                            <div className="shrink-0">
                                                {owned ? (
                                                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                                        <Check className="w-4 h-4" /> 所持
                                                    </div>
                                                ) : locked ? (
                                                    <Lock className="w-5 h-5 text-white/20" />
                                                ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleBuy(outfit)}
                                                        disabled={!canAfford || buyingId !== null}
                                                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${canAfford
                                                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                                                                : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                                                            } disabled:opacity-50`}
                                                    >
                                                        {buyingId === outfit.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Coins className="w-3.5 h-3.5" />
                                                                {outfit.price}
                                                            </>
                                                        )}
                                                    </motion.button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
