'use client'

import { useGameStats, useQuests, useCompleteQuest, useClaimQuestReward } from '@/lib/hooks/useGame'
import { StatsDisplay } from './game/StatsDisplay'
import { QuestBoard } from './game/QuestBoard'
import { AvatarDisplay } from './game/AvatarDisplay'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface GameDashboardProps {
    variant?: 'cyberpunk' | 'solarpunk' | 'celestial'
}

export function GameDashboard({ variant = 'cyberpunk' }: GameDashboardProps) {
    const { data: stats, isLoading: statsLoading } = useGameStats()
    const { data: quests, isLoading: questsLoading } = useQuests()
    const { mutate: completeQuest } = useCompleteQuest()
    const { mutate: claimReward } = useClaimQuestReward()
    const [showQuests, setShowQuests] = useState(true)

    if (statsLoading || questsLoading) {
        return (
            <div className="space-y-6">
                <div className="h-48 bg-white/5 rounded-3xl animate-pulse" />
                <div className="h-96 bg-white/5 rounded-3xl animate-pulse" />
            </div>
        )
    }

    if (!stats) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
                {/* Avatar Section */}
                <div className="lg:sticky lg:top-4">
                    <AvatarDisplay level={stats.level} avatarSet={variant} />
                </div>

                {/* Game Stats & Quests Section */}
                <div className="space-y-6">
                    {/* Stats Display - Compact Version */}
                    <StatsDisplay stats={stats} compact={true} variant={variant} />

                    {/* Quest Board Toggle */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            冒険者の依頼
                        </h2>
                        <button
                            onClick={() => setShowQuests(!showQuests)}
                            className={`text-sm transition-colors ${variant === 'solarpunk' ? 'text-emerald-700 hover:text-emerald-900' : 'text-white/60 hover:text-white/80'}`}
                        >
                            {showQuests ? '非表示' : '表示'}
                        </button>
                    </div>

                    {/* Quest Board */}
                    {showQuests && quests && (
                        <QuestBoard
                            dailyQuests={quests.daily || []}
                            weeklyQuests={quests.weekly || []}
                            variant={variant}
                            onCompleteQuest={completeQuest}
                            onClaimReward={claimReward}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    )
}
