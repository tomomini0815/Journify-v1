'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Special'

interface GachaItem {
    id: string
    name: string
    type: 'Crew' | 'Equipment'
    rarity: Rarity
    image?: string
    description: string
}

interface SpaceGachaProps {
    isOpen: boolean
    onClose: () => void
    starFragments: number
    onSummon: (cost: number) => void
}

const SUMMON_COST = 100

const RARITY_COLORS: Record<Rarity, string> = {
    Common: "text-slate-400 border-slate-500 bg-slate-900/50",
    Uncommon: "text-green-400 border-green-500 bg-green-900/50",
    Rare: "text-blue-400 border-blue-500 bg-blue-900/50",
    Epic: "text-purple-400 border-purple-500 bg-purple-900/50",
    Legendary: "text-amber-400 border-amber-500 bg-amber-900/50",
    Mythic: "text-red-500 border-red-600 bg-red-950/50 shadow-red-500/20",
    Special: "text-fuchsia-400 border-fuchsia-500 bg-fuchsia-900/50 shadow-fuchsia-500/20"
}

// Mock Drop Pool
const DROP_POOL: GachaItem[] = [
    { id: 'c1', name: 'Cadet Rook', type: 'Crew', rarity: 'Common', description: 'A fresh recruit eager to learn.' },
    { id: 'c2', name: 'Engineer Sparks', type: 'Crew', rarity: 'Uncommon', description: 'Good with wiring, bad with people.' },
    { id: 'e1', name: 'Basic Thruster', type: 'Equipment', rarity: 'Common', description: 'Standard issue propulsion.' },
    { id: 'c3', name: 'Pilot Ace', type: 'Crew', rarity: 'Rare', description: 'Can fly through an asteroid field blindfolded.' },
    { id: 'e2', name: 'Plasma Shield', type: 'Equipment', rarity: 'Epic', description: 'Advanced defensive barrier.' },
    { id: 'c4', name: 'Captain Nova', type: 'Crew', rarity: 'Legendary', description: 'A legendary hero of the starfleet.' },
    { id: 'e3', name: 'Dimensional Drive', type: 'Equipment', rarity: 'Mythic', description: 'Warps space-time itself.' },
    { id: 'c5', name: 'Glitch Cat', type: 'Crew', rarity: 'Special', description: 'A cat that exists in two places at once.' },
]

export function SpaceGacha({ isOpen, onClose, starFragments, onSummon }: SpaceGachaProps) {
    const [isSummoning, setIsSummoning] = useState(false)
    const [result, setResult] = useState<GachaItem | null>(null)

    const handleSummon = () => {
        if (starFragments < SUMMON_COST) return

        onSummon(SUMMON_COST)
        setIsSummoning(true)
        setResult(null)

        // Simulate Summoning Delay & Logic
        setTimeout(() => {
            const random = Math.random()
            let rarity: Rarity = 'Common'

            if (random > 0.99) rarity = 'Special'
            else if (random > 0.95) rarity = 'Mythic'
            else if (random > 0.85) rarity = 'Legendary'
            else if (random > 0.70) rarity = 'Epic'
            else if (random > 0.50) rarity = 'Rare'
            else if (random > 0.30) rarity = 'Uncommon'

            // Filter pool by rarity (fallback to Common if no match in mock pool)
            const pool = DROP_POOL.filter(i => i.rarity === rarity)
            const item = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : DROP_POOL[0]

            setResult(item)
            setIsSummoning(false)
        }, 2000)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
                <div className="relative w-full max-w-lg bg-indigo-950 border-2 border-indigo-500/50 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="bg-indigo-900/50 p-4 flex justify-between items-center border-b border-indigo-500/30">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>🌠</span> Cosmic Summon
                        </h2>
                        <button onClick={onClose} className="text-indigo-300 hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="p-8 text-center min-h-[300px] flex flex-col justify-center items-center">

                        {/* 1. Idle State */}
                        {!isSummoning && !result && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="text-6xl mb-4">🔮</div>
                                <p className="text-indigo-200 mb-6">
                                    Summon new allies and equipment from across the galaxy.
                                </p>
                                <div className="flex justify-center items-center gap-2 mb-8 bg-black/40 px-4 py-2 rounded-full border border-indigo-500/30 mx-auto w-fit">
                                    <span className="text-yellow-400">★</span>
                                    <span className={`font-mono font-bold ${starFragments < SUMMON_COST ? 'text-red-400' : 'text-white'}`}>
                                        {starFragments}
                                    </span>
                                    <span className="text-indigo-300 text-sm">/ {SUMMON_COST} Fragments</span>
                                </div>

                                <button
                                    onClick={handleSummon}
                                    disabled={starFragments < SUMMON_COST}
                                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${starFragments >= SUMMON_COST
                                            ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-fuchsia-500/30'
                                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    SUMMON
                                </button>
                            </motion.div>
                        )}

                        {/* 2. Summoning Animation */}
                        {isSummoning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-24 h-24 border-b-4 border-fuchsia-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.5, 30], opacity: [1, 1, 0] }}
                                        transition={{ duration: 1.8, delay: 0.2, ease: "easeInOut" }}
                                        className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 3. Result Reveal */}
                        {result && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full"
                            >
                                <motion.div
                                    initial={{ y: -20 }}
                                    animate={{ y: 0 }}
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 border ${RARITY_COLORS[result.rarity]}`}
                                >
                                    {result.rarity.toUpperCase()}
                                </motion.div>

                                <h3 className="text-3xl font-black text-white mb-2 drop-shadow-md">
                                    {result.name}
                                </h3>
                                <div className="text-5xl mb-4 p-4">
                                    {result.type === 'Crew' ? '🧑‍🚀' : '🔫'}
                                </div>
                                <p className="text-indigo-200 italic mb-8 max-w-xs mx-auto">
                                    "{result.description}"
                                </p>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => setResult(null)}
                                        className="px-6 py-2 rounded-lg bg-indigo-800 text-indigo-100 hover:bg-indigo-700 font-bold"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleSummon}
                                        disabled={starFragments < SUMMON_COST}
                                        className={`px-6 py-2 rounded-lg font-bold border ${starFragments >= SUMMON_COST
                                                ? 'border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-900/30'
                                                : 'border-slate-600 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Summon Again
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
