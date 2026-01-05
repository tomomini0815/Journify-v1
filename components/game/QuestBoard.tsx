'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Quest, UserQuestProgress, getDifficultyStars, getCategoryIcon } from '@/lib/game/questSystem'

interface QuestBoardProps {
    dailyQuests: (Quest & { progress?: UserQuestProgress })[]
    weeklyQuests: (Quest & { progress?: UserQuestProgress })[]
    onCompleteQuest?: (questId: string) => void
    onClaimReward?: (questId: string) => void
    variant?: 'cyberpunk' | 'solarpunk' | 'celestial'
}

export function QuestBoard({ dailyQuests, weeklyQuests, onCompleteQuest, onClaimReward, variant = 'cyberpunk' }: QuestBoardProps) {
    const isSolarpunk = variant === 'solarpunk'
    const isCelestial = variant === 'celestial'
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily')

    const quests = activeTab === 'daily' ? dailyQuests : weeklyQuests

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={isSolarpunk
                ? "bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl"
                : isCelestial
                    ? "bg-indigo-950/80 backdrop-blur-xl border border-indigo-400/30 rounded-3xl p-6 shadow-2xl shadow-indigo-900/50"
                    : "bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
            }
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isSolarpunk ? 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-400/30' :
                            isCelestial ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-indigo-500/50 text-white' :
                                'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/50'
                        }`}>
                        <span className="text-2xl">{isCelestial ? '🛸' : '📜'}</span>
                    </div>
                    <div>
                        <h2 className={isSolarpunk
                            ? "text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"
                            : isCelestial
                                ? "text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent"
                                : "text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
                        }>
                            {isSolarpunk ? 'Daily Tasks' : isCelestial ? 'Mission Log' : 'クエストボード'}
                        </h2>
                        <p className={isSolarpunk ? "text-emerald-700/60 text-sm" : isCelestial ? "text-indigo-200/60 text-sm" : "text-white/60 text-sm"}>
                            {isSolarpunk ? 'Sanctuary maintenance' : isCelestial ? 'Starfleet directives' : '冒険者の依頼'}
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className={`flex gap-2 p-1 rounded-xl border ${isSolarpunk ? 'bg-white/40 border-emerald-100' :
                        isCelestial ? 'bg-indigo-900/40 border-indigo-500/30' :
                            'bg-white/5 border-white/10'
                    }`}>
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'daily'
                            ? isSolarpunk
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                                : isCelestial
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/50'
                            : isSolarpunk
                                ? 'text-emerald-800/60 hover:text-emerald-900'
                                : isCelestial
                                    ? 'text-indigo-200/60 hover:text-indigo-100'
                                    : 'text-white/60 hover:text-white/80'
                            }`}
                    >
                        {isCelestial ? 'Daily Ops' : 'デイリー'}
                    </button>
                    <button
                        onClick={() => setActiveTab('weekly')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'weekly'
                            ? isSolarpunk
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                : isCelestial
                                    ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/50'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                            : isSolarpunk
                                ? 'text-emerald-800/60 hover:text-emerald-900'
                                : isCelestial
                                    ? 'text-indigo-200/60 hover:text-indigo-100'
                                    : 'text-white/60 hover:text-white/80'
                            }`}
                    >
                        {isCelestial ? 'Weekly Ops' : 'ウィークリー'}
                    </button>
                </div>
            </div>

            {/* Quest List */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {quests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎉</div>
                            <p className={isSolarpunk ? "text-emerald-800/60" : "text-white/60"}>全てのクエストを完了しました！</p>
                            <p className={isSolarpunk ? "text-emerald-800/40 text-sm mt-2" : "text-white/40 text-sm mt-2"}>明日また新しいクエストが登場します</p>
                        </div>
                    ) : (
                        quests.map((quest, index) => (
                            <QuestCard
                                key={quest.id}
                                quest={quest}
                                index={index}
                                onComplete={onCompleteQuest}
                                onClaim={onClaimReward}
                                variant={variant}
                            />
                        ))
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}

interface QuestCardProps {
    quest: Quest & { progress?: UserQuestProgress }
    index: number
    onComplete?: (questId: string) => void
    onClaim?: (questId: string) => void
    variant?: 'cyberpunk' | 'solarpunk' | 'celestial'
}

function QuestCard({ quest, index, onComplete, onClaim, variant = 'cyberpunk' }: QuestCardProps) {
    const isSolarpunk = variant === 'solarpunk'
    const isCelestial = variant === 'celestial'
    const progress = quest.progress?.progress || 0
    const isCompleted = quest.progress?.isCompleted || false
    const requiredCount = (quest.requirement as any)?.count || 1
    const progressPercent = Math.min(100, (progress / requiredCount) * 100)

    const difficultyColor = {
        1: 'text-green-400',
        2: 'text-blue-400',
        3: 'text-purple-400',
        4: 'text-orange-400',
        5: 'text-red-400'
    }[quest.difficulty] || 'text-gray-400'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`group relative backdrop-blur-sm border rounded-2xl p-5 transition-all overflow-hidden ${isCompleted
                    ? isSolarpunk
                        ? 'border-emerald-500/50 bg-emerald-100/50'
                        : isCelestial
                            ? 'border-indigo-400/50 bg-indigo-500/20'
                            : 'border-emerald-500/50 bg-emerald-500/10'
                    : isSolarpunk
                        ? 'bg-white/40 border-white/60 hover:border-emerald-400/60'
                        : isCelestial
                            ? 'bg-indigo-900/40 border-indigo-500/30 hover:border-indigo-400/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
        >
            {/* Background glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isCompleted
                    ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10'
                    : 'bg-gradient-to-br from-amber-500/5 to-orange-500/5'
                }`} />

            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isCompleted
                                ? isSolarpunk ? 'bg-emerald-200 text-emerald-700' : 'bg-emerald-500/20 border border-emerald-500/30'
                                : isSolarpunk ? 'bg-white/60 text-emerald-800' : isCelestial ? 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-300' : 'bg-white/10 border border-white/20'
                            }`}>
                            {isCompleted ? '✅' : quest.icon}
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold text-lg ${isCompleted
                                        ? isSolarpunk ? 'text-emerald-800' : 'text-emerald-300'
                                        : isSolarpunk ? 'text-emerald-900' : 'text-white'
                                    }`}>
                                    {quest.title}
                                </h3>
                                <span className={`text-xs ${isSolarpunk ? 'text-emerald-700/60' : 'text-white/40'}`}>
                                    {getCategoryIcon(quest.category as any)}
                                </span>
                            </div>
                            <p className={`text-sm ${isSolarpunk ? 'text-emerald-800/70' : isCelestial ? 'text-indigo-200/70' : 'text-white/60'}`}>
                                {quest.description}
                            </p>
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className={`text-sm ${difficultyColor}`}>
                        {getDifficultyStars(quest.difficulty)}
                    </div>
                </div>

                {/* Progress Bar */}
                {!isCompleted && (
                    <div className="mb-4">
                        <div className={`flex justify-between text-xs mb-2 ${isSolarpunk ? 'text-emerald-800/60' : 'text-white/60'}`}>
                            <span>進捗</span>
                            <span>{progress} / {requiredCount}</span>
                        </div>
                        <div className={`relative h-2 rounded-full overflow-hidden ${isSolarpunk ? 'bg-emerald-900/10' : 'bg-white/10'}`}>
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-400 blur-sm opacity-50"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                )}

                {/* Rewards */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="text-cyan-400">⚡</span>
                            <span className={`${isSolarpunk ? 'text-emerald-800' : 'text-white/80'} font-semibold`}>+{quest.xpReward} XP</span>
                        </div>
                        {quest.goldReward > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-amber-400">💰</span>
                                <span className={`${isSolarpunk ? 'text-emerald-800' : 'text-white/80'} font-semibold`}>+{quest.goldReward}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    {isCompleted ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onClaim?.(quest.id)}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm shadow-lg transition-shadow ${isSolarpunk
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
                                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-emerald-500/50 hover:shadow-emerald-500/70'
                                }`}
                        >
                            報酬を受け取る
                        </motion.button>
                    ) : progressPercent >= 100 ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onComplete?.(quest.id)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold text-sm shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-shadow"
                        >
                            完了する
                        </motion.button>
                    ) : (
                        <div className={`px-4 py-2 border rounded-xl text-sm ${isSolarpunk
                                ? 'bg-white/40 border-emerald-100 text-emerald-800/40'
                                : isCelestial
                                    ? 'bg-indigo-900/40 border-indigo-500/30 text-indigo-300/40'
                                    : 'bg-white/5 border-white/10 text-white/40'
                            }`}>
                            進行中
                        </div>
                    )}
                </div>
            </div>

            {/* Completion Checkmark */}
            {isCompleted && (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50"
                >
                    <span className="text-white text-lg">✓</span>
                </motion.div>
            )}
        </motion.div>
    )
}
