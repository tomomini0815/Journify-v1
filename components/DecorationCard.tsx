'use client'

import { motion } from 'framer-motion'
import { Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react'

interface DecorationCardProps {
    decoration: {
        id: string
        name: string
        category: string
        theme: string
        imageUrl: string
        rarity: string
        price: number
        description: string | null
    }
    userQuantity?: number // Current quantity user owns
    onBuy?: () => void
    isBuying?: boolean
}

const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    uncommon: 'from-green-500 to-green-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-amber-500 to-amber-600'
}

const rarityBorders = {
    common: 'border-gray-500/50',
    uncommon: 'border-green-500/50',
    rare: 'border-blue-500/50',
    epic: 'border-purple-500/50',
    legendary: 'border-amber-500/50'
}

export function DecorationCard({ decoration, userQuantity = 0, onBuy, isBuying = false }: DecorationCardProps) {
    const rarityColor = rarityColors[decoration.rarity as keyof typeof rarityColors] || rarityColors.common
    const rarityBorder = rarityBorders[decoration.rarity as keyof typeof rarityBorders] || rarityBorders.common

    return (
        <motion.div
            className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 ${rarityBorder} rounded-xl p-4 flex flex-col h-full group overflow-hidden`}
        >
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-24 h-24 bg-gradient-to-r ${rarityColor} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />

            {/* Owned Badge */}
            {userQuantity > 0 && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-white/20 rounded-md text-xs font-bold flex items-center gap-1">
                    <span>Owns:</span>
                    <span className="text-emerald-400">{userQuantity}</span>
                </div>
            )}

            {/* Image Placeholder */}
            <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center text-4xl">
                {/* Replace with actual Image component when URLs are real */}
                {decoration.imageUrl.startsWith('/images') ? (
                    <span>{decoration.name.includes('Chair') ? '🪑' : decoration.name.includes('Table') ? '🪑' : '📦'}</span>
                ) : (
                    <span>{decoration.imageUrl}</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight">{decoration.name}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${rarityColor} font-bold uppercase text-[10px]`}>
                        {decoration.rarity}
                    </span>
                    <span className="text-white/40 capitalize">{decoration.category}</span>
                    <span className="text-white/40 capitalize">• {decoration.theme}</span>
                </div>

                <p className="text-xs text-white/60 line-clamp-2">{decoration.description}</p>
            </div>

            {/* Price & Buy Button */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="font-mono text-amber-400 font-bold">
                    {decoration.price} G
                </div>

                <button
                    onClick={onBuy}
                    disabled={isBuying}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-lg text-sm font-bold disabled:opacity-50"
                >
                    {isBuying ? '...' : 'Buy'}
                </button>
            </div>
        </motion.div>
    )
}
