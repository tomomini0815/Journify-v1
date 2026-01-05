/**
 * Achievement System - LifeQuest
 * 称号の解放条件チェックと自動付与
 */

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface AchievementRequirement {
    type: 'streak' | 'journals' | 'goals' | 'level' | 'xp' | 'tasks' | 'projects' | 'voice_journals'
    count: number
    metadata?: any
}

export interface Achievement {
    id: string
    key: string
    title: string
    description: string
    icon: string
    rarity: AchievementRarity
    requirement: AchievementRequirement
    xpReward: number
    statRewards?: Record<string, number>
}

/**
 * 称号の解放条件をチェック
 */
export function checkAchievementUnlock(
    achievement: Achievement,
    userStats: {
        currentStreak?: number
        totalJournals?: number
        totalGoals?: number
        level?: number
        totalXP?: number
        totalTasks?: number
        totalProjects?: number
        totalVoiceJournals?: number
    }
): boolean {
    const req = achievement.requirement

    switch (req.type) {
        case 'streak':
            return (userStats.currentStreak || 0) >= req.count

        case 'journals':
            return (userStats.totalJournals || 0) >= req.count

        case 'goals':
            return (userStats.totalGoals || 0) >= req.count

        case 'level':
            return (userStats.level || 1) >= req.count

        case 'xp':
            return (userStats.totalXP || 0) >= req.count

        case 'tasks':
            return (userStats.totalTasks || 0) >= req.count

        case 'projects':
            return (userStats.totalProjects || 0) >= req.count

        case 'voice_journals':
            return (userStats.totalVoiceJournals || 0) >= req.count

        default:
            return false
    }
}

/**
 * レアリティに応じた色を取得
 */
export function getRarityColor(rarity: AchievementRarity): string {
    const colors: Record<AchievementRarity, string> = {
        common: 'text-gray-400',
        rare: 'text-blue-400',
        epic: 'text-purple-400',
        legendary: 'text-amber-400'
    }
    return colors[rarity]
}

/**
 * レアリティに応じた背景グラデーションを取得
 */
export function getRarityGradient(rarity: AchievementRarity): string {
    const gradients: Record<AchievementRarity, string> = {
        common: 'from-gray-500/20 to-gray-600/20',
        rare: 'from-blue-500/20 to-cyan-600/20',
        epic: 'from-purple-500/20 to-pink-600/20',
        legendary: 'from-amber-500/20 to-orange-600/20'
    }
    return gradients[rarity]
}

/**
 * デフォルトの称号定義
 */
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id' | 'createdAt'>[] = [
    // Streak Achievements
    {
        key: 'early_bird_7',
        title: '早起きの賢者',
        description: '7日連続ログイン',
        icon: '🌅',
        rarity: 'common',
        requirement: { type: 'streak', count: 7 },
        xpReward: 100,
        statRewards: { spirit: 10 }
    },
    {
        key: 'dedication_30',
        title: '献身の戦士',
        description: '30日連続ログイン',
        icon: '🔥',
        rarity: 'rare',
        requirement: { type: 'streak', count: 30 },
        xpReward: 500,
        statRewards: { spirit: 25, vitality: 15 }
    },
    {
        key: 'legend_100',
        title: '伝説の継続者',
        description: '100日連続ログイン',
        icon: '👑',
        rarity: 'legendary',
        requirement: { type: 'streak', count: 100 },
        xpReward: 2000,
        statRewards: { spirit: 50, vitality: 30, strength: 20 }
    },

    // Journal Achievements
    {
        key: 'writer_10',
        title: '駆け出しの記録者',
        description: 'ジャーナルを10回作成',
        icon: '📝',
        rarity: 'common',
        requirement: { type: 'journals', count: 10 },
        xpReward: 50,
        statRewards: { intelligence: 5 }
    },
    {
        key: 'writer_50',
        title: '熟練の記録者',
        description: 'ジャーナルを50回作成',
        icon: '📖',
        rarity: 'rare',
        requirement: { type: 'journals', count: 50 },
        xpReward: 300,
        statRewards: { intelligence: 15 }
    },
    {
        key: 'writer_100',
        title: '記録の巨匠',
        description: 'ジャーナルを100回作成',
        icon: '📚',
        rarity: 'epic',
        requirement: { type: 'journals', count: 100 },
        xpReward: 800,
        statRewards: { intelligence: 30, spirit: 20 }
    },

    // Goal Achievements
    {
        key: 'goal_master_10',
        title: '目標達成者',
        description: '目標を10個達成',
        icon: '🎯',
        rarity: 'common',
        requirement: { type: 'goals', count: 10 },
        xpReward: 100,
        statRewards: { strength: 10 }
    },
    {
        key: 'goal_master_50',
        title: '目標の達人',
        description: '目標を50個達成',
        icon: '🏆',
        rarity: 'epic',
        requirement: { type: 'goals', count: 50 },
        xpReward: 1000,
        statRewards: { strength: 40, charisma: 20 }
    },

    // Level Achievements
    {
        key: 'level_10',
        title: '成長の証',
        description: 'レベル10到達',
        icon: '⭐',
        rarity: 'common',
        requirement: { type: 'level', count: 10 },
        xpReward: 200,
        statRewards: { strength: 5, vitality: 5, intelligence: 5 }
    },
    {
        key: 'level_25',
        title: '熟練の冒険者',
        description: 'レベル25到達',
        icon: '✨',
        rarity: 'rare',
        requirement: { type: 'level', count: 25 },
        xpReward: 500,
        statRewards: { strength: 10, vitality: 10, intelligence: 10 }
    },
    {
        key: 'level_50',
        title: '伝説の勇者',
        description: 'レベル50到達',
        icon: '💫',
        rarity: 'legendary',
        requirement: { type: 'level', count: 50 },
        xpReward: 2000,
        statRewards: { strength: 25, vitality: 25, intelligence: 25, charisma: 25, luck: 25, spirit: 25 }
    },

    // Voice Journal Achievements
    {
        key: 'voice_master_10',
        title: '声の記録者',
        description: '音声ジャーナルを10回作成',
        icon: '🎤',
        rarity: 'common',
        requirement: { type: 'voice_journals', count: 10 },
        xpReward: 100,
        statRewards: { vitality: 10 }
    },
    {
        key: 'voice_master_50',
        title: '声の巨匠',
        description: '音声ジャーナルを50回作成',
        icon: '🎙️',
        rarity: 'epic',
        requirement: { type: 'voice_journals', count: 50 },
        xpReward: 800,
        statRewards: { vitality: 30, spirit: 20 }
    },

    // Task Achievements
    {
        key: 'task_master_100',
        title: 'タスクマスター',
        description: 'タスクを100個完了',
        icon: '✅',
        rarity: 'rare',
        requirement: { type: 'tasks', count: 100 },
        xpReward: 400,
        statRewards: { strength: 20, vitality: 10 }
    },

    // XP Achievements
    {
        key: 'xp_10000',
        title: '経験の探求者',
        description: '累計XP 10,000獲得',
        icon: '💎',
        rarity: 'epic',
        requirement: { type: 'xp', count: 10000 },
        xpReward: 1000,
        statRewards: { luck: 30 }
    }
]

/**
 * 称号の進捗率を計算
 */
export function getAchievementProgress(
    achievement: Achievement,
    userStats: any
): number {
    const req = achievement.requirement
    let current = 0

    switch (req.type) {
        case 'streak':
            current = userStats.currentStreak || 0
            break
        case 'journals':
            current = userStats.totalJournals || 0
            break
        case 'goals':
            current = userStats.totalGoals || 0
            break
        case 'level':
            current = userStats.level || 1
            break
        case 'xp':
            current = userStats.totalXP || 0
            break
        case 'tasks':
            current = userStats.totalTasks || 0
            break
        case 'voice_journals':
            current = userStats.totalVoiceJournals || 0
            break
    }

    return Math.min(100, (current / req.count) * 100)
}
