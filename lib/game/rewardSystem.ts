/**
 * Reward System - LifeQuest
 * XP、ゴールド、ステータスの付与と更新
 */

import { addXP, getLevelUpRewards } from './levelSystem'

export interface RewardResult {
    xpGained: number
    goldGained: number
    crystalsGained?: number
    statChanges: Record<string, number>
    leveledUp: boolean
    newLevel?: number
    levelsGained?: number
    achievements?: string[] // Unlocked achievement IDs
}

export interface UserStats {
    totalXP: number
    level: number
    xp: number
    gold: number
    crystals: number
    strength: number
    vitality: number
    intelligence: number
    charisma: number
    luck: number
    spirit: number
}

/**
 * XPを付与してステータスを更新
 */
export function grantXP(
    currentStats: UserStats,
    xpAmount: number
): {
    updatedStats: Partial<UserStats>
    result: RewardResult
} {
    const xpResult = addXP(currentStats.totalXP, xpAmount)

    const result: RewardResult = {
        xpGained: xpAmount,
        goldGained: 0,
        statChanges: {},
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
        levelsGained: xpResult.levelsGained
    }

    const updatedStats: Partial<UserStats> = {
        totalXP: xpResult.newTotalXP,
        level: xpResult.newLevel,
        xp: xpResult.newTotalXP - ((xpResult.newLevel - 1) ** 2 * 100)
    }

    // レベルアップ報酬を付与
    if (xpResult.leveledUp) {
        const levelRewards = getLevelUpRewards(xpResult.newLevel)
        result.goldGained = levelRewards.gold
        result.crystalsGained = levelRewards.crystals

        updatedStats.gold = (currentStats.gold || 0) + levelRewards.gold
        if (levelRewards.crystals) {
            updatedStats.crystals = (currentStats.crystals || 0) + levelRewards.crystals
        }
    }

    return { updatedStats, result }
}

/**
 * ゴールドを付与
 */
export function grantGold(
    currentGold: number,
    amount: number
): number {
    return Math.max(0, currentGold + amount)
}

/**
 * クリスタルを付与
 */
export function grantCrystals(
    currentCrystals: number,
    amount: number
): number {
    return Math.max(0, currentCrystals + amount)
}

/**
 * ステータスを更新（上限100）
 */
export function updateStat(
    currentValue: number,
    change: number,
    min: number = 0,
    max: number = 100
): number {
    return Math.min(max, Math.max(min, currentValue + change))
}

/**
 * 複数のステータスを一括更新
 */
export function updateStats(
    currentStats: UserStats,
    statChanges: Record<string, number>
): Partial<UserStats> {
    const updated: Partial<UserStats> = {}

    const statKeys: (keyof UserStats)[] = ['strength', 'vitality', 'intelligence', 'charisma', 'luck', 'spirit']

    for (const key of statKeys) {
        if (statChanges[key]) {
            updated[key] = updateStat(currentStats[key] as number, statChanges[key])
        }
    }

    return updated
}

/**
 * クエスト完了報酬を付与
 */
export function grantQuestReward(
    currentStats: UserStats,
    quest: {
        xpReward: number
        goldReward: number
        statRewards: Record<string, number>
    }
): {
    updatedStats: Partial<UserStats>
    result: RewardResult
} {
    // XP付与
    const { updatedStats: xpStats, result: xpResult } = grantXP(currentStats, quest.xpReward)

    // ゴールド付与
    const newGold = grantGold(currentStats.gold, quest.goldReward)

    // ステータス更新
    const statUpdates = updateStats(currentStats, quest.statRewards)

    const updatedStats: Partial<UserStats> = {
        ...xpStats,
        gold: newGold,
        ...statUpdates
    }

    const result: RewardResult = {
        ...xpResult,
        goldGained: xpResult.goldGained + quest.goldReward,
        statChanges: quest.statRewards
    }

    return { updatedStats, result }
}

/**
 * 称号解放報酬を付与
 */
export function grantAchievementReward(
    currentStats: UserStats,
    achievement: {
        xpReward: number
        statRewards?: Record<string, number>
    }
): {
    updatedStats: Partial<UserStats>
    result: RewardResult
} {
    // XP付与
    const { updatedStats: xpStats, result: xpResult } = grantXP(currentStats, achievement.xpReward)

    // ステータス更新
    const statUpdates = achievement.statRewards
        ? updateStats(currentStats, achievement.statRewards)
        : {}

    const updatedStats: Partial<UserStats> = {
        ...xpStats,
        ...statUpdates
    }

    const result: RewardResult = {
        ...xpResult,
        statChanges: achievement.statRewards || {}
    }

    return { updatedStats, result }
}

/**
 * デイリーログインボーナス
 */
export function getDailyLoginBonus(streakDays: number): {
    xp: number
    gold: number
    crystals?: number
} {
    const baseXP = 5
    const baseGold = 10

    // ストリークボーナス
    const streakMultiplier = Math.min(3, 1 + (streakDays / 30))

    const bonus: { xp: number; gold: number; crystals?: number } = {
        xp: Math.floor(baseXP * streakMultiplier),
        gold: Math.floor(baseGold * streakMultiplier)
    }

    // 特別ボーナス（7日ごと）
    if (streakDays % 7 === 0) {
        bonus.crystals = Math.floor(streakDays / 7) * 5
    }

    return bonus
}

/**
 * 報酬の合計を計算
 */
export function calculateTotalRewards(rewards: RewardResult[]): RewardResult {
    return rewards.reduce((total, reward) => ({
        xpGained: total.xpGained + reward.xpGained,
        goldGained: total.goldGained + reward.goldGained,
        crystalsGained: (total.crystalsGained || 0) + (reward.crystalsGained || 0),
        statChanges: {
            ...total.statChanges,
            ...Object.entries(reward.statChanges).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: (total.statChanges[key] || 0) + value
            }), {})
        },
        leveledUp: total.leveledUp || reward.leveledUp,
        newLevel: reward.newLevel || total.newLevel,
        levelsGained: (total.levelsGained || 0) + (reward.levelsGained || 0),
        achievements: [...(total.achievements || []), ...(reward.achievements || [])]
    }), {
        xpGained: 0,
        goldGained: 0,
        crystalsGained: 0,
        statChanges: {},
        leveledUp: false,
        achievements: []
    })
}

/**
 * 報酬を視覚的に表示するためのフォーマット
 */
export function formatRewardDisplay(result: RewardResult): string[] {
    const messages: string[] = []

    if (result.xpGained > 0) {
        messages.push(`+${result.xpGained} XP`)
    }

    if (result.goldGained > 0) {
        messages.push(`+${result.goldGained} ゴールド`)
    }

    if (result.crystalsGained && result.crystalsGained > 0) {
        messages.push(`+${result.crystalsGained} クリスタル`)
    }

    Object.entries(result.statChanges).forEach(([stat, value]) => {
        if (value > 0) {
            const statNames: Record<string, string> = {
                strength: '力',
                vitality: '体力',
                intelligence: '知力',
                charisma: '魅力',
                luck: '運',
                spirit: '精神'
            }
            messages.push(`+${value} ${statNames[stat] || stat}`)
        }
    })

    if (result.leveledUp) {
        messages.push(`🎉 レベルアップ！ Lv.${result.newLevel}`)
    }

    return messages
}
