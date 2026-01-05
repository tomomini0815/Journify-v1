/**
 * Level System - LifeQuest
 * レベルとXPの計算ロジック
 */

export interface LevelInfo {
    level: number
    currentXP: number
    xpForNextLevel: number
    totalXP: number
    progress: number // 0-100
}

/**
 * XPから現在のレベルを計算
 * Formula: level = floor(sqrt(totalXP / 100)) + 1
 */
export function calculateLevel(totalXP: number): number {
    if (totalXP < 0) return 1
    return Math.floor(Math.sqrt(totalXP / 100)) + 1
}

/**
 * 次のレベルまでに必要なXPを計算
 * Formula: xpForLevel(n) = n^2 * 100
 */
export function xpForLevel(level: number): number {
    return level * level * 100
}

/**
 * 現在レベルの開始XPを計算
 */
export function xpForLevelStart(level: number): number {
    if (level <= 1) return 0
    return (level - 1) * (level - 1) * 100
}

/**
 * XPを追加してレベル情報を更新
 */
export function addXP(currentTotalXP: number, xpToAdd: number): {
    newTotalXP: number
    oldLevel: number
    newLevel: number
    leveledUp: boolean
    levelsGained: number
} {
    const oldLevel = calculateLevel(currentTotalXP)
    const newTotalXP = currentTotalXP + xpToAdd
    const newLevel = calculateLevel(newTotalXP)

    return {
        newTotalXP,
        oldLevel,
        newLevel,
        leveledUp: newLevel > oldLevel,
        levelsGained: newLevel - oldLevel
    }
}

/**
 * 現在のレベル情報を取得
 */
export function getLevelInfo(totalXP: number): LevelInfo {
    const level = calculateLevel(totalXP)
    const levelStartXP = xpForLevelStart(level)
    const nextLevelXP = xpForLevel(level)
    const currentXP = totalXP - levelStartXP
    const xpForNextLevel = nextLevelXP - levelStartXP
    const progress = (currentXP / xpForNextLevel) * 100

    return {
        level,
        currentXP,
        xpForNextLevel,
        totalXP,
        progress: Math.min(100, Math.max(0, progress))
    }
}

/**
 * レベルアップ報酬を計算
 */
export function getLevelUpRewards(newLevel: number): {
    gold: number
    statPoints: number
    crystals?: number
} {
    const baseGold = 100
    const gold = baseGold * newLevel
    const statPoints = Math.floor(newLevel / 5) + 1 // Every 5 levels, +1 stat point

    // Special rewards at milestone levels
    const rewards: any = { gold, statPoints }

    if (newLevel % 10 === 0) {
        rewards.crystals = newLevel * 10 // Bonus crystals every 10 levels
    }

    return rewards
}

/**
 * XP獲得量の計算（アクション別）
 */
export const XP_REWARDS = {
    // Journal
    JOURNAL_CREATE: 10,
    JOURNAL_WITH_MOOD: 15,
    JOURNAL_LONG: 20, // 500+ characters

    // Voice Journal
    VOICE_JOURNAL_CREATE: 15,
    VOICE_JOURNAL_WITH_TAGS: 20,

    // Goals
    GOAL_CREATE: 5,
    GOAL_COMPLETE: 50,
    GOAL_MILESTONE: 100,

    // Projects
    PROJECT_CREATE: 20,
    PROJECT_COMPLETE: 200,
    TASK_COMPLETE: 10,

    // Daily Activities
    DAILY_LOGIN: 5,
    STREAK_BONUS: 10, // Per day of streak

    // Social
    SHARE_JOURNAL: 15,
    HELP_OTHERS: 25,

    // Learning
    COMPLETE_TUTORIAL: 30,
    READ_GUIDE: 10,
} as const

/**
 * ストリークボーナスXPを計算
 */
export function getStreakBonusXP(streakDays: number): number {
    if (streakDays < 3) return 0
    if (streakDays < 7) return 10
    if (streakDays < 30) return 25
    if (streakDays < 100) return 50
    return 100 // 100+ days streak
}

/**
 * レベルに基づくXP倍率（高レベルほど多くXPが必要）
 */
export function getXPMultiplier(level: number): number {
    if (level < 10) return 1.0
    if (level < 25) return 0.9
    if (level < 50) return 0.8
    if (level < 100) return 0.7
    return 0.6
}
