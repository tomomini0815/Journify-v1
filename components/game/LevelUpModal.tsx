'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface LevelUpModalProps {
    isOpen: boolean
    onClose: () => void
    oldLevel: number
    newLevel: number
    rewards: {
        gold: number
        statPoints: number
        crystals?: number
    }
}

export function LevelUpModal({ isOpen, onClose, oldLevel, newLevel, rewards }: LevelUpModalProps) {
    const [showRewards, setShowRewards] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3000
            const end = Date.now() + duration

            const colors = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6']

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                })
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            }
            frame()

            // Show rewards after animation
            const timer = setTimeout(() => setShowRewards(true), 1500)
            return () => clearTimeout(timer)
        } else {
            setShowRewards(false)
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-amber-500/50"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-emerald-500/20 rounded-3xl blur-2xl -z-10" />

                            {/* Stars background */}
                            <div className="absolute inset-0 overflow-hidden rounded-3xl">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 bg-white rounded-full"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                        }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <div className="relative text-center">
                                {/* Title */}
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">
                                        レベルアップ！
                                    </h2>
                                    <p className="text-white/60 text-sm">おめでとうございます！</p>
                                </motion.div>

                                {/* Level Display */}
                                <div className="my-8 flex items-center justify-center gap-6">
                                    {/* Old Level */}
                                    <motion.div
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-white/20 flex items-center justify-center shadow-lg">
                                            <span className="text-3xl font-bold text-white/60">{oldLevel}</span>
                                        </div>
                                    </motion.div>

                                    {/* Arrow */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.6, type: 'spring' }}
                                        className="text-4xl"
                                    >
                                        →
                                    </motion.div>

                                    {/* New Level */}
                                    <motion.div
                                        initial={{ x: 50, opacity: 0, scale: 0.5 }}
                                        animate={{ x: 0, opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                                        className="relative"
                                    >
                                        {/* Glow rings */}
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-emerald-500 blur-xl"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 0.8, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                        />

                                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 via-yellow-400 to-emerald-500 border-4 border-white/30 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                                            <span className="text-4xl font-bold text-white drop-shadow-lg">{newLevel}</span>
                                        </div>

                                        {/* Sparkles */}
                                        {[...Array(8)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                }}
                                                animate={{
                                                    x: Math.cos((i / 8) * Math.PI * 2) * 60,
                                                    y: Math.sin((i / 8) * Math.PI * 2) * 60,
                                                    opacity: [1, 0],
                                                    scale: [0, 1],
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    delay: 0.8 + i * 0.1,
                                                    ease: 'easeOut',
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                </div>

                                {/* Rewards */}
                                <AnimatePresence>
                                    {showRewards && (
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                            <div>
                                                <h3 className="text-lg font-semibold text-white/90 mb-3">報酬</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.1, type: 'spring' }}
                                                        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3"
                                                    >
                                                        <div className="text-2xl mb-1">💰</div>
                                                        <div className="text-xl font-bold text-amber-400">+{rewards.gold}</div>
                                                        <div className="text-xs text-white/60">ゴールド</div>
                                                    </motion.div>

                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.2, type: 'spring' }}
                                                        className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3"
                                                    >
                                                        <div className="text-2xl mb-1">✨</div>
                                                        <div className="text-xl font-bold text-purple-400">+{rewards.statPoints}</div>
                                                        <div className="text-xs text-white/60">ステータスP</div>
                                                    </motion.div>

                                                    {rewards.crystals && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.3, type: 'spring' }}
                                                            className="col-span-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3"
                                                        >
                                                            <div className="text-2xl mb-1">💎</div>
                                                            <div className="text-xl font-bold text-cyan-400">+{rewards.crystals}</div>
                                                            <div className="text-xs text-white/60">クリスタル（ボーナス！）</div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Close Button */}
                                            <motion.button
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.4, type: 'spring' }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={onClose}
                                                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-xl font-bold text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-shadow"
                                            >
                                                続ける
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
