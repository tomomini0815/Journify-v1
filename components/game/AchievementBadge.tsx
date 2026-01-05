'use client'

import { motion } from 'framer-motion'
import { Achievement, getRarityColor, getRarityGradient, getAchievementProgress } from '@/lib/game/achievementSystem'

interface AchievementBadgeProps {
    achievement: Achievement
    isUnlocked: boolean
    isEquipped?: boolean
    userStats?: any
    onClick?: () => void
    size?: 'sm' | 'md' | 'lg'
    showProgress?: boolean
}

export function AchievementBadge({
    achievement,
    isUnlocked,
    isEquipped = false,
    userStats,
    onClick,
    size = 'md',
    showProgress = false
}: AchievementBadgeProps) {
    const progress = userStats && !isUnlocked ? getAchievementProgress(achievement, userStats) : 100

    const sizeClasses = {
        sm: 'w-16 h-16 text-2xl',
        md: 'w-20 h-20 text-3xl',
        lg: 'w-24 h-24 text-4xl'
    }

    const rarityBorder = {
        common: 'border-gray-500/50',
        rare: 'border-blue-500/50',
        epic: 'border-purple-500/50',
        legendary: 'border-amber-500/50'
    }

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`group relative cursor-pointer ${onClick ? '' : 'cursor-default'}`}
        >
            {/* Badge Container */}
            <div
                className={`relative ${sizeClasses[size]} rounded-2xl border-2 ${isUnlocked ? rarityBorder[achievement.rarity] : 'border-white/20'
                    } ${isUnlocked
                        ? `bg-gradient-to-br ${getRarityGradient(achievement.rarity)}`
                        : 'bg-white/5'
                    } flex items-center justify-center transition-all overflow-hidden ${isEquipped ? 'ring-4 ring-amber-500/50' : ''
                    }`}
            >
                {/* Glow effect for unlocked */}
                {isUnlocked && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(achievement.rarity)} blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
                )}

                {/* Icon */}
                <span
                    className={`relative ${isUnlocked ? 'grayscale-0' : 'grayscale opacity-30'
                        } transition-all group-hover:scale-110`}
                >
                    {achievement.icon}
                </span>

                {/* Lock overlay for locked achievements */}
                {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-2xl">🔒</span>
                    </div>
                )}

                {/* Equipped indicator */}
                {isEquipped && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg"
                    >
                        <span className="text-xs">✓</span>
                    </motion.div>
                )}

                {/* Rarity indicator */}
                {isUnlocked && (
                    <div className={`absolute top-1 left-1 ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity === 'legendary' && '👑'}
                        {achievement.rarity === 'epic' && '💜'}
                        {achievement.rarity === 'rare' && '💙'}
                    </div>
                )}
            </div>

            {/* Progress bar for locked achievements */}
            {!isUnlocked && showProgress && (
                <div className="mt-2">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${getRarityGradient(achievement.rarity)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                    <div className="text-xs text-white/40 text-center mt-1">
                        {progress.toFixed(0)}%
                    </div>
                </div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-slate-900 border border-white/20 rounded-xl p-3 shadow-2xl min-w-[200px] max-w-[250px]">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{achievement.icon}</span>
                        <h4 className={`font-bold ${getRarityColor(achievement.rarity)}`}>
                            {achievement.title}
                        </h4>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/70 mb-2">{achievement.description}</p>

                    {/* Rarity */}
                    <div className="flex items-center gap-2 text-xs mb-2">
                        <span className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity.toUpperCase()}
                        </span>
                    </div>

                    {/* Rewards */}
                    {isUnlocked && (
                        <div className="border-t border-white/10 pt-2 mt-2">
                            <div className="text-xs text-white/60">報酬:</div>
                            <div className="flex gap-2 mt-1 text-xs">
                                {achievement.xpReward > 0 && (
                                    <span className="text-cyan-400">+{achievement.xpReward} XP</span>
                                )}
                                {achievement.statRewards && Object.entries(achievement.statRewards).map(([stat, value]) => (
                                    <span key={stat} className="text-purple-400">
                                        +{value} {stat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress for locked */}
                    {!isUnlocked && userStats && (
                        <div className="border-t border-white/10 pt-2 mt-2">
                            <div className="text-xs text-white/60">
                                進捗: {progress.toFixed(0)}%
                            </div>
                        </div>
                    )}

                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                </div>
            </div>
        </motion.div>
    )
}

// Achievement Grid Component
interface AchievementGridProps {
    achievements: (Achievement & { isUnlocked: boolean; isEquipped?: boolean })[]
    userStats?: any
    onBadgeClick?: (achievement: Achievement) => void
    columns?: number
}

export function AchievementGrid({
    achievements,
    userStats,
    onBadgeClick,
    columns = 4
}: AchievementGridProps) {
    const gridCols = {
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6'
    }

    return (
        <div className={`grid ${gridCols[columns as keyof typeof gridCols] || 'grid-cols-4'} gap-4`}>
            {achievements.map((achievement, index) => (
                <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <AchievementBadge
                        achievement={achievement}
                        isUnlocked={achievement.isUnlocked}
                        isEquipped={achievement.isEquipped}
                        userStats={userStats}
                        onClick={() => onBadgeClick?.(achievement)}
                        showProgress={!achievement.isUnlocked}
                    />
                </motion.div>
            ))}
        </div>
    )
}
