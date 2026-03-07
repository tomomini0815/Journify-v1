'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shirt, Crown, Sparkles, Check, Loader2 } from 'lucide-react'
import { PetAvatar } from './PetAvatar'

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

interface UserPetOutfit {
    id: string
    outfitId: string
    outfit: PetOutfit
}

interface EquippedOutfits {
    hat?: string
    clothes?: string
    accessory?: string
}

interface PetDressUpProps {
    isOpen: boolean
    onClose: () => void
    companionId: string
    companionSpecies: string
    companionName: string
    equippedOutfits: EquippedOutfits
    onEquipChange: (outfits: EquippedOutfits) => void
}

const CATEGORY_CONFIG = {
    hat: { label: '帽子', icon: '🎩', slot: 'top' },
    clothes: { label: '服', icon: '👕', slot: 'middle' },
    accessory: { label: 'アクセ', icon: '💎', slot: 'bottom' },
} as const

const RARITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
    common: { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-300' },
    uncommon: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300' },
    rare: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-300' },
    epic: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-300' },
    legendary: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-300' },
}

export function PetDressUp({
    isOpen, onClose, companionId, companionSpecies, companionName,
    equippedOutfits, onEquipChange
}: PetDressUpProps) {
    const [ownedOutfits, setOwnedOutfits] = useState<UserPetOutfit[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<'hat' | 'clothes' | 'accessory'>('hat')
    const [localEquipped, setLocalEquipped] = useState<EquippedOutfits>(equippedOutfits)

    useEffect(() => {
        if (isOpen) {
            fetchOwnedOutfits()
            setLocalEquipped(equippedOutfits)
        }
    }, [isOpen, equippedOutfits])

    const fetchOwnedOutfits = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/user/pet-outfits')
            if (res.ok) {
                const data = await res.json()
                setOwnedOutfits(data.outfits || [])
            }
        } catch (error) {
            console.error('Failed to fetch outfits:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEquip = async (outfitId: string, category: string) => {
        setActionLoading(outfitId)
        try {
            const res = await fetch(`/api/user/companions/${companionId}/equip`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outfitId, category, action: 'equip' })
            })
            if (res.ok) {
                const newEquipped = { ...localEquipped, [category]: outfitId }
                setLocalEquipped(newEquipped)
                onEquipChange(newEquipped)
            }
        } catch (error) {
            console.error('Failed to equip:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleUnequip = async (category: string) => {
        setActionLoading(`unequip-${category}`)
        try {
            const res = await fetch(`/api/user/companions/${companionId}/equip`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, action: 'unequip' })
            })
            if (res.ok) {
                const newEquipped = { ...localEquipped }
                delete newEquipped[category as keyof EquippedOutfits]
                setLocalEquipped(newEquipped)
                onEquipChange(newEquipped)
            }
        } catch (error) {
            console.error('Failed to unequip:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredOutfits = ownedOutfits.filter(o => o.outfit.category === activeCategory)
    const equippedForCategory = localEquipped[activeCategory]

    // Find outfit details for equipped items
    const getEquippedOutfitEmoji = (category: keyof EquippedOutfits) => {
        const eqId = localEquipped[category]
        if (!eqId) return null
        const found = ownedOutfits.find(o => o.outfitId === eqId)
        return found?.outfit.emoji || null
    }

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
                    <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <Shirt className="w-6 h-6 text-pink-400" />
                            <div>
                                <h2 className="font-bold text-lg">きせかえ</h2>
                                <p className="text-xs text-white/50">{companionName}の衣装を変更</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Pet Preview */}
                    <div className="p-4 flex flex-col items-center shrink-0">
                        {/* Full-body avatar with equipped outfits */}
                        <PetAvatar
                            species={companionSpecies}
                            size={120}
                            equippedOutfits={{
                                hat: getEquippedOutfitEmoji('hat') || undefined,
                                clothes: getEquippedOutfitEmoji('clothes') || undefined,
                                accessory: getEquippedOutfitEmoji('accessory') || undefined,
                            }}
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 px-5 shrink-0">
                        {(Object.entries(CATEGORY_CONFIG) as [keyof typeof CATEGORY_CONFIG, typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][]).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeCategory === key
                                    ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300'
                                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                                    }`}
                            >
                                <span>{config.icon}</span>
                                <span>{config.label}</span>
                                {localEquipped[key] && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                        ))}
                    </div>

                    {/* Outfit Grid */}
                    <div className="flex-1 overflow-y-auto p-5 min-h-0">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                            </div>
                        ) : filteredOutfits.length === 0 ? (
                            <div className="text-center py-12 text-white/40">
                                <div className="text-4xl mb-3">🛍️</div>
                                <p className="font-bold mb-1">このカテゴリの衣装がありません</p>
                                <p className="text-xs">ショップで購入しましょう！</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Unequip option */}
                                {equippedForCategory && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleUnequip(activeCategory)}
                                        disabled={actionLoading !== null}
                                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-sm text-white/60 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        装備を外す
                                    </motion.button>
                                )}

                                {filteredOutfits.map((userOutfit) => {
                                    const outfit = userOutfit.outfit
                                    const isEquipped = equippedForCategory === outfit.id
                                    const style = RARITY_STYLES[outfit.rarity] || RARITY_STYLES.common

                                    return (
                                        <motion.button
                                            key={userOutfit.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => !isEquipped && handleEquip(outfit.id, outfit.category)}
                                            disabled={actionLoading !== null || isEquipped}
                                            className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 text-left disabled:opacity-70 ${isEquipped
                                                ? 'bg-pink-500/15 border-pink-500/40 ring-1 ring-pink-500/30'
                                                : `${style.bg} ${style.border} hover:bg-white/10`
                                                }`}
                                        >
                                            <div className="text-3xl shrink-0">{outfit.emoji}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm truncate">{outfit.name}</span>
                                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                                                        {outfit.rarity}
                                                    </span>
                                                </div>
                                                {outfit.description && (
                                                    <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{outfit.description}</p>
                                                )}
                                            </div>
                                            {isEquipped ? (
                                                <div className="shrink-0 flex items-center gap-1 text-pink-300 text-xs font-bold">
                                                    <Sparkles className="w-4 h-4" />
                                                    装備中
                                                </div>
                                            ) : actionLoading === outfit.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-white/40 shrink-0" />
                                            ) : null}
                                        </motion.button>
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
