'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, Zap, Star } from 'lucide-react'

interface CompanionCardProps {
    companion: {
        id: string
        name: string
        species: string
        rarity: string
        imageUrl: string
        level?: number
        happiness?: number
        energy?: number
        loyalty?: number
        isActive?: boolean
    }
    onClick?: () => void
    showStats?: boolean
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

export function CompanionCard({ companion, onClick, showStats = false }: CompanionCardProps) {
    const rarityColor = rarityColors[companion.rarity as keyof typeof rarityColors] || rarityColors.common
    const rarityBorder = rarityBorders[companion.rarity as keyof typeof rarityBorders] || rarityBorders.common

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative bg-white/5 backdrop-blur-xl border-2 ${rarityBorder} rounded-2xl p-4 cursor-pointer transition-all ${companion.isActive ? 'ring-2 ring-emerald-500' : ''
                }`}
        >
            {/* Active Badge */}
            {companion.isActive && (
                <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-emerald-500 rounded-full text-xs font-bold">
                    ACTIVE
                </div>
            )}

            {/* Companion Image */}
            <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5">
                {companion.imageUrl.startsWith('/images') ? (
                    <Image
                        src={companion.imageUrl}
                        alt={companion.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.currentTarget.style.display = 'none'
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        {companion.species === 'cat' && '🐱'}
                        {companion.species === 'fox' && '🦊'}
                        {companion.species === 'dragon' && '🐉'}
                        {companion.species === 'bird' && '🐦'}
                        {companion.species === 'wolf' && '🐺'}
                        {companion.species === 'sprite' && '✨'}
                        {!['cat', 'fox', 'dragon', 'bird', 'wolf', 'sprite'].includes(companion.species) && '🌟'}
                    </div>
                )}
            </div>

            {/* Companion Info */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg truncate">{companion.name}</h3>
                    {companion.level && (
                        <span className="px-2 py-1 bg-white/10 rounded-full text-xs font-bold">
                            Lv.{companion.level}
                        </span>
                    )}
                </div>

                {/* Rarity Badge */}
                <div className={`inline-block px-3 py-1 bg-gradient-to-r ${rarityColor} rounded-full text-xs font-bold uppercase`}>
                    {companion.rarity}
                </div>

                {/* Stats */}
                {showStats && companion.happiness !== undefined && (
                    <div className="space-y-1 mt-3">
                        {/* Happiness */}
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all"
                                    style={{ width: `${companion.happiness}%` }}
                                />
                            </div>
                            <span className="text-xs text-white/60">{companion.happiness}</span>
                        </div>

                        {/* Energy */}
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all"
                                    style={{ width: `${companion.energy}%` }}
                                />
                            </div>
                            <span className="text-xs text-white/60">{companion.energy}</span>
                        </div>

                        {/* Loyalty */}
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-blue-400" />
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                                    style={{ width: `${companion.loyalty}%` }}
                                />
                            </div>
                            <span className="text-xs text-white/60">{companion.loyalty}</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
