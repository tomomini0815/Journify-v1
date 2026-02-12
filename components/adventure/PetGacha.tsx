'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Gem } from 'lucide-react'

interface PetGachaProps {
    isOpen: boolean
    onClose: () => void
    crystals: number
    onSummonComplete: () => void
}

const SUMMON_COST = 100

const RARITY_COLORS: Record<string, string> = {
    common: "text-slate-400 border-slate-500 bg-slate-900/50",
    uncommon: "text-emerald-400 border-emerald-500 bg-emerald-900/50",
    rare: "text-cyan-400 border-cyan-500 bg-cyan-900/50",
    epic: "text-indigo-400 border-indigo-500 bg-indigo-900/50",
    legendary: "text-amber-400 border-amber-500 bg-amber-900/50",
}

export function PetGacha({ isOpen, onClose, crystals, onSummonComplete }: PetGachaProps) {
    const [isSummoning, setIsSummoning] = useState(false)
    const [result, setResult] = useState<any | null>(null)
    const [error, setError] = useState('')

    const handleSummon = async () => {
        if (crystals < SUMMON_COST) return

        setIsSummoning(true)
        setResult(null)
        setError('')

        try {
            // Animation delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            const res = await fetch('/api/game/gacha/summon', {
                method: 'POST',
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || '召喚に失敗しました')
            }

            const data = await res.json()
            setResult(data)
            onSummonComplete()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSummoning(false)
        }
    }

    const reset = () => {
        setResult(null)
        setError('')
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
                <div className="relative w-full max-w-lg bg-slate-900/90 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
                    {/* Header */}
                    <div className="bg-cyan-950/30 p-4 flex justify-between items-center border-b border-cyan-500/20">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="text-cyan-400" />
                            ペット召喚
                        </h2>
                        <button onClick={onClose} className="text-cyan-300 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="p-8 text-center min-h-[300px] flex flex-col justify-center items-center relative">
                        {/* Error Message */}
                        {error && (
                            <div className="absolute top-4 left-0 right-0 text-center text-red-400 font-bold">
                                {error}
                            </div>
                        )}

                        {/* 1. Idle State */}
                        {!isSummoning && !result && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="text-6xl mb-4">🔮</div>
                                <p className="text-indigo-200 mb-6">
                                    新しい仲間を召喚しましょう！<br />
                                    クリスタルを使ってガチャを回せます。
                                </p>
                                <div className="flex justify-center items-center gap-2 mb-8 bg-black/40 px-4 py-2 rounded-full border border-indigo-500/30 mx-auto w-fit">
                                    <Gem className="w-4 h-4 text-cyan-400" />
                                    <span className={`font-mono font-bold ${crystals < SUMMON_COST ? 'text-red-400' : 'text-white'}`}>
                                        {crystals}
                                    </span>
                                    <span className="text-cyan-300/60 text-sm">/ {SUMMON_COST}</span>
                                </div>

                                <button
                                    onClick={handleSummon}
                                    disabled={crystals < SUMMON_COST}
                                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${crystals >= SUMMON_COST
                                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    召喚する！ (100💎)
                                </button>
                            </motion.div>
                        )}

                        {/* 2. Summoning Animation */}
                        {isSummoning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-24 h-24 border-b-4 border-cyan-400 rounded-full"
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
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 border ${RARITY_COLORS[result.companion.rarity.toLowerCase()] || RARITY_COLORS.common}`}
                                >
                                    {result.companion.rarity.toUpperCase()}
                                </motion.div>

                                <h3 className="text-3xl font-black text-white mb-2 drop-shadow-md">
                                    {result.companion.name}
                                </h3>

                                <div className="text-8xl mb-4 p-4 animate-bounce">
                                    {result.companion.species === 'cat' && '🐱'}
                                    {result.companion.species === 'fox' && '🦊'}
                                    {result.companion.species === 'dragon' && '🐉'}
                                    {result.companion.species === 'bird' && '🐦'}
                                    {result.companion.species === 'wolf' && '🐺'}
                                    {result.companion.species === 'sprite' && '✨'}
                                    {!['cat', 'fox', 'dragon', 'bird', 'wolf', 'sprite'].includes(result.companion.species) && '🌟'}
                                </div>

                                {result.type === 'DUPLICATE' ? (
                                    <div className="mb-6 p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl">
                                        <p className="text-amber-200 text-sm font-bold">既に仲間です！</p>
                                        <p className="text-white text-xs">経験値 +500 EXP を獲得しました✨</p>
                                    </div>
                                ) : (
                                    <p className="text-indigo-200 italic mb-8 max-w-xs mx-auto">
                                        "{result.companion.description}"
                                    </p>
                                )}

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 rounded-lg bg-indigo-800 text-indigo-100 hover:bg-indigo-700 font-bold"
                                    >
                                        閉じる
                                    </button>
                                    <button
                                        onClick={reset}
                                        disabled={crystals < SUMMON_COST}
                                        className={`px-6 py-2 rounded-lg font-bold border ${crystals >= SUMMON_COST
                                            ? 'border-cyan-500 text-cyan-300 hover:bg-cyan-900/30'
                                            : 'border-slate-600 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        もう一度召喚
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
