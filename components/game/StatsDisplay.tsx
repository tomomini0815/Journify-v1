'use client'

import { motion } from 'framer-motion'
import { XPBar } from './XPBar'
import { getLevelInfo } from '@/lib/game/levelSystem'

interface StatsDisplayProps {
    stats: {
        level: number
        totalXP: number
        xp: number
        strength: number
        vitality: number
        intelligence: number
        charisma: number
        luck: number
        spirit: number
        gold: number
        crystals: number
        currentStreak: number
    }
    compact?: boolean
    hideLevel?: boolean
    variant?: 'cyberpunk' | 'solarpunk' | 'celestial'
}

export function StatsDisplay({ stats, compact = false, hideLevel = false, variant = 'cyberpunk' }: StatsDisplayProps) {
    const isSolarpunk = variant === 'solarpunk'
    const isCelestial = variant === 'celestial'
    const levelInfo = getLevelInfo(stats.totalXP)

    const rpgStats = [
        { key: 'strength', label: '力', value: stats.strength, icon: '⚔️', color: 'from-red-500 to-orange-500', description: '仕事・目標達成力' },
        { key: 'vitality', label: '体力', value: stats.vitality, icon: '❤️', color: 'from-pink-500 to-red-500', description: '健康・スタミナ' },
        { key: 'intelligence', label: '知力', value: stats.intelligence, icon: '📚', color: 'from-blue-500 to-cyan-500', description: '学習・スキル' },
        { key: 'charisma', label: '魅力', value: stats.charisma, icon: '✨', color: 'from-purple-500 to-pink-500', description: '人間関係' },
        { key: 'luck', label: '運', value: stats.luck, icon: '🍀', color: 'from-green-500 to-emerald-500', description: '財産・チャンス' },
        { key: 'spirit', label: '精神', value: stats.spirit, icon: '🧘', color: 'from-indigo-500 to-purple-500', description: 'マインドフルネス' },
    ]

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={isSolarpunk
                    ? "bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 text-emerald-900 shadow-lg"
                    : isCelestial
                        ? "bg-indigo-950/80 backdrop-blur-xl border border-indigo-400/30 rounded-2xl p-4 text-white shadow-lg shadow-indigo-900/50"
                        : "bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white"
                }
            >
                <div className="flex items-center justify-between mb-3">
                    {!hideLevel && (
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${isSolarpunk ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-500/30' :
                                isCelestial ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/50' :
                                    'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-cyan-500/50'
                                }`}>
                                {stats.level}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">
                                    {isCelestial ? 'Rank ' : 'レベル '}{stats.level}
                                </h3>
                                <p className="text-xs opacity-60">
                                    {isSolarpunk ? 'Gardener' : isCelestial ? 'Captain' : '勇者'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={`flex gap-4 text-sm ${hideLevel ? 'w-full justify-around' : ''}`}>
                        <div className="text-center">
                            <div className={`font-semibold ${isSolarpunk ? 'text-amber-600' : 'text-amber-400'}`}>{stats.gold.toLocaleString()}</div>
                            <div className="opacity-40 text-xs">ゴールド</div>
                        </div>
                        <div className="text-center">
                            <div className={`font-semibold ${isSolarpunk ? 'text-cyan-600' : 'text-cyan-400'}`}>{stats.crystals}</div>
                            <div className="opacity-40 text-xs">クリスタル</div>
                        </div>
                    </div>
                </div>

                {!hideLevel && (
                    <XPBar
                        currentXP={levelInfo.currentXP}
                        xpForNextLevel={levelInfo.xpForNextLevel}
                        level={stats.level}
                        size="md"
                        showLabel={false}
                    />
                )}
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={
                isSolarpunk ? "bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl text-emerald-900" :
                    isCelestial ? "bg-indigo-950/80 backdrop-blur-xl border border-indigo-400/30 rounded-3xl p-8 shadow-2xl shadow-indigo-900/50 text-white" :
                        "bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl text-white"
            }
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {/* Level Badge */}
                    <motion.div
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ${isSolarpunk ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30' :
                            isCelestial ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/50 border border-indigo-300/30' :
                                'bg-gradient-to-br from-cyan-500 via-emerald-500 to-cyan-500 shadow-cyan-500/50'
                            }`}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${isSolarpunk ? 'bg-emerald-400/40' :
                            isCelestial ? 'bg-indigo-500/40' :
                                'bg-gradient-to-br from-cyan-400/50 to-emerald-400/50'
                            }`} />
                        <span className="relative text-4xl font-bold text-white drop-shadow-lg">
                            {stats.level}
                        </span>
                    </motion.div>

                    <div>
                        <h2 className={
                            isSolarpunk ? "text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent" :
                                isCelestial ? "text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent" :
                                    "text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent"
                        }>
                            {isSolarpunk ? 'Garden Records' : isCelestial ? 'Captain\'s Log' : '勇者の記録'}
                        </h2>
                        <p className={`text-sm mt-1 ${isSolarpunk ? 'text-emerald-700/60' : isCelestial ? 'text-indigo-200/60' : 'text-white/60'}`}>
                            {isCelestial ? 'Rank' : 'レベル'} {stats.level} • {stats.currentStreak}日連続
                        </p>
                    </div>
                </div>

                {/* Currency */}
                <div className="flex gap-6">
                    <motion.div
                        className={`text-center px-4 py-2 rounded-xl border ${isSolarpunk ? 'bg-amber-100/50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'
                            }`}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className={`text-2xl font-bold ${isSolarpunk ? 'text-amber-600' : 'text-amber-400'}`}>
                            {stats.gold.toLocaleString()}
                        </div>
                        <div className={`text-xs ${isSolarpunk ? 'text-amber-700/60' : 'text-amber-300/60'}`}>ゴールド</div>
                    </motion.div>

                    <motion.div
                        className={`text-center px-4 py-2 rounded-xl border ${isSolarpunk ? 'bg-cyan-100/50 border-cyan-200' : 'bg-cyan-500/10 border-cyan-500/20'
                            }`}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className={`text-2xl font-bold ${isSolarpunk ? 'text-cyan-600' : 'text-cyan-400'}`}>
                            {stats.crystals}
                        </div>
                        <div className={`text-xs ${isSolarpunk ? 'text-cyan-700/60' : 'text-cyan-300/60'}`}>クリスタル</div>
                    </motion.div>
                </div>
            </div>

            {/* XP Bar */}
            <div className="mb-8">
                <XPBar
                    currentXP={levelInfo.currentXP}
                    xpForNextLevel={levelInfo.xpForNextLevel}
                    level={stats.level}
                    size="lg"
                />
            </div>

            {/* RPG Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {rpgStats.map((stat, index) => (
                    <motion.div
                        key={stat.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className={`group relative backdrop-blur-sm border rounded-2xl p-4 hover:border-opacity-100 transition-all cursor-pointer overflow-hidden ${isSolarpunk
                            ? "bg-white/40 border-white/40 hover:border-emerald-400/50"
                            : isCelestial
                                ? "bg-indigo-900/40 border-indigo-500/30 hover:border-indigo-400/50"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }`}
                    >
                        {/* Background gradient on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{stat.icon}</span>
                                    <span className={`font-semibold ${isSolarpunk ? 'text-emerald-800' : 'text-white/90'}`}>{stat.label}</span>
                                </div>
                                <span className={`text-xl font-bold ${isSolarpunk ? 'text-emerald-900' : 'text-white'}`}>
                                    {stat.value}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className={`relative h-2 rounded-full overflow-hidden ${isSolarpunk ? 'bg-emerald-900/10' : 'bg-white/10'}`}>
                                <motion.div
                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${stat.color} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.value}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                />

                                {/* Glow effect */}
                                <motion.div
                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${stat.color} blur-sm opacity-50`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.value}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                />
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 border border-white/20 rounded-lg text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {stat.description}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Streak Badge */}
            {stats.currentStreak >= 7 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                    className="mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl"
                >
                    <span className="text-2xl">🔥</span>
                    <span className="font-semibold text-orange-300">
                        {stats.currentStreak}日連続ストリーク！
                    </span>
                </motion.div>
            )}
        </motion.div>
    )
}
