/**
 * Quest System - LifeQuest
 * クエストの進捗管理と完了判定
 */

export type QuestType = 'daily' | 'weekly' | 'main' | 'event'
export type QuestCategory = 'goals' | 'health' | 'learning' | 'relationships' | 'work' | 'creativity' | 'finance' | 'mindfulness' | 'social' | 'fun'

export interface QuestRequirement {
    type: 'journal' | 'voice_journal' | 'goal' | 'task' | 'project' | 'meditation' | 'exercise' | 'streak'
    count: number
    metadata?: any
}

export interface Quest {
    id: string
    type: QuestType
    category: QuestCategory
    title: string
    description: string
    icon: string
    difficulty: number
    requirement: QuestRequirement
    minLevel: number
    xpReward: number
    goldReward: number
    statRewards: Record<string, number>
    isActive: boolean
}

export interface UserQuestProgress {
    id: string
    userId: string
    questId: string
    progress: number
    isCompleted: boolean
    completedAt?: Date
    lastResetAt: Date
}

/**
 * クエスト進捗をチェック
 */
export function checkQuestProgress(
    quest: Quest,
    progress: UserQuestProgress,
    userActivity: {
        journalsToday?: number
        voiceJournalsToday?: number
        goalsCompleted?: number
        tasksCompleted?: number
        meditationMinutes?: number
        currentStreak?: number
    }
): boolean {
    const req = quest.requirement

    switch (req.type) {
        case 'journal':
            return (userActivity.journalsToday || 0) >= req.count

        case 'voice_journal':
            return (userActivity.voiceJournalsToday || 0) >= req.count

        case 'goal':
            return (userActivity.goalsCompleted || 0) >= req.count

        case 'task':
            return (userActivity.tasksCompleted || 0) >= req.count

        case 'meditation':
            return (userActivity.meditationMinutes || 0) >= req.count

        case 'streak':
            return (userActivity.currentStreak || 0) >= req.count

        default:
            return false
    }
}

/**
 * クエスト進捗を更新
 */
export function updateQuestProgress(
    currentProgress: number,
    requirement: QuestRequirement,
    increment: number = 1
): {
    newProgress: number
    isCompleted: boolean
} {
    const newProgress = Math.min(currentProgress + increment, requirement.count)
    const isCompleted = newProgress >= requirement.count

    return { newProgress, isCompleted }
}

/**
 * デイリークエストのリセットが必要かチェック
 */
export function shouldResetDailyQuest(lastResetAt: Date): boolean {
    const now = new Date()
    const lastReset = new Date(lastResetAt)

    // 日付が変わっていればリセット
    return (
        now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()
    )
}

/**
 * ウィークリークエストのリセットが必要かチェック（月曜日0時）
 */
export function shouldResetWeeklyQuest(lastResetAt: Date): boolean {
    const now = new Date()
    const lastReset = new Date(lastResetAt)

    // 週が変わっていればリセット
    const nowWeek = getWeekNumber(now)
    const lastWeek = getWeekNumber(lastReset)

    return nowWeek !== lastWeek
}

function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * デフォルトのデイリークエスト
 */
export const DEFAULT_DAILY_QUESTS: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        type: 'daily',
        category: 'mindfulness',
        title: '朝の瞑想',
        description: '1日を穏やかに始めよう',
        icon: '🧘',
        difficulty: 1,
        requirement: { type: 'meditation', count: 5 },
        minLevel: 1,
        xpReward: 15,
        goldReward: 10,
        statRewards: { spirit: 5 },
        isActive: true
    },
    {
        type: 'daily',
        category: 'goals',
        title: '今日の振り返り',
        description: 'ジャーナルを書いて1日を振り返る',
        icon: '📝',
        difficulty: 1,
        requirement: { type: 'journal', count: 1 },
        minLevel: 1,
        xpReward: 10,
        goldReward: 5,
        statRewards: { intelligence: 3 },
        isActive: true
    },
    {
        type: 'daily',
        category: 'work',
        title: 'タスクマスター',
        description: 'タスクを3つ完了する',
        icon: '✅',
        difficulty: 2,
        requirement: { type: 'task', count: 3 },
        minLevel: 1,
        xpReward: 20,
        goldReward: 15,
        statRewards: { strength: 5 },
        isActive: true
    },
    {
        type: 'daily',
        category: 'health',
        title: '音声ジャーナル',
        description: '声で思いを記録しよう',
        icon: '🎤',
        difficulty: 1,
        requirement: { type: 'voice_journal', count: 1 },
        minLevel: 3,
        xpReward: 15,
        goldReward: 10,
        statRewards: { vitality: 4 },
        isActive: true
    }
]

/**
 * デフォルトのウィークリークエスト
 */
export const DEFAULT_WEEKLY_QUESTS: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        type: 'weekly',
        category: 'goals',
        title: '週間レビュー',
        description: 'ジャーナルを7日間書く',
        icon: '📖',
        difficulty: 3,
        requirement: { type: 'journal', count: 7 },
        minLevel: 1,
        xpReward: 100,
        goldReward: 50,
        statRewards: { intelligence: 10, spirit: 5 },
        isActive: true
    },
    {
        type: 'weekly',
        category: 'goals',
        title: '目標達成者',
        description: '目標を3つ達成する',
        icon: '🎯',
        difficulty: 4,
        requirement: { type: 'goal', count: 3 },
        minLevel: 5,
        xpReward: 150,
        goldReward: 75,
        statRewards: { strength: 15 },
        isActive: true
    },
    {
        type: 'weekly',
        category: 'mindfulness',
        title: '継続の力',
        description: '7日連続ログイン',
        icon: '🔥',
        difficulty: 3,
        requirement: { type: 'streak', count: 7 },
        minLevel: 1,
        xpReward: 120,
        goldReward: 60,
        statRewards: { spirit: 10, vitality: 5 },
        isActive: true
    }
]

/**
 * クエストの難易度に応じた星の数を取得
 */
export function getDifficultyStars(difficulty: number): string {
    return '⭐'.repeat(Math.min(5, Math.max(1, difficulty)))
}

/**
 * クエストカテゴリーのアイコンを取得
 */
export function getCategoryIcon(category: QuestCategory): string {
    const icons: Record<QuestCategory, string> = {
        goals: '🎯',
        health: '❤️',
        learning: '📚',
        relationships: '👥',
        work: '💼',
        creativity: '🎨',
        finance: '💰',
        mindfulness: '🧘',
        social: '🌍',
        fun: '🎉'
    }
    return icons[category] || '⚔️'
}
