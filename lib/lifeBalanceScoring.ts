// Life Balance Scoring Algorithm
// 完全無料・高精度の幸福度分析システム

export interface JournalActivities {
    exercise?: boolean
    socializing?: boolean
    workDone?: boolean
    learning?: boolean
    hobby?: boolean
    healthyMeal?: boolean
    meditation?: boolean
    outdoor?: boolean
    helping?: boolean
    grateful?: boolean
    [key: string]: boolean | undefined
}

interface JournalData {
    content: string
    tags: string[]
    mood?: number | null
    energy?: number | null
    stress?: number | null
    sleep?: number | null
    activities?: JournalActivities | null
    createdAt: Date
}

interface TaskData {
    title: string
    completed: boolean
    tags?: string[]
}

interface GoalData {
    title: string
    progress: number
    category?: string
}

interface LifeBalanceScores {
    physical: number
    mental: number
    relationships: number
    social: number
    career: number
    financial: number
    learning: number
    selfActualization: number
    leisure: number
}

// キーワード辞書
const keywords = {
    physical: ['運動', '健康', '体調', 'ジム', 'ヨガ', 'ランニング', '筋トレ', '睡眠', '疲れ', 'トレーニング', 'ウォーキング', 'スポーツ'],
    mental: ['感謝', '幸せ', 'リラックス', '瞑想', 'ストレス', '不安', '落ち着く', '癒し', 'マインドフルネス', '呼吸', '安心'],
    relationships: ['友人', '家族', '会った', '話した', 'デート', '連絡', '電話', '恋人', 'パートナー', '仲間', '親', '子供'],
    social: ['ボランティア', '助けた', '貢献', '寄付', '支援', '手伝った', '社会', 'コミュニティ', '地域'],
    career: ['仕事', '会議', 'プロジェクト', '完了', '達成', 'キャリア', '昇進', '業務', 'タスク', '成果', '目標'],
    financial: {
        positive: ['貯金', '収入', '増えた', '安心', '貯まった', '給料', '昇給', '節約', '投資', '安定'],
        negative: ['不安', '足りない', '心配', '借金', '支払い', '高い', '出費', '赤字']
    },
    learning: ['学んだ', '読書', '勉強', '本', 'セミナー', '資格', 'スキル', '知識', '学習', '研修', '講座'],
    achievement: ['達成', '成長', '自信', '成功', '実現', '目標', '進歩', '向上', '改善'],
    leisure: ['楽しい', '趣味', '遊び', '映画', '音楽', 'ゲーム', '旅行', 'リフレッシュ', '休暇', '娯楽', '自然']
}

/**
 * テキスト内のキーワード出現回数をカウント
 */
function countKeywords(text: string, keywordList: string[]): number {
    let count = 0
    const lowerText = text.toLowerCase()
    keywordList.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi')
        const matches = lowerText.match(regex)
        if (matches) count += matches.length
    })
    return count
}

/**
 * ジャーナルデータを分析
 */
function analyzeJournals(journals: JournalData[], days: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentJournals = journals.filter(j => new Date(j.createdAt) >= cutoffDate)

    const analysis = {
        physical: 0,
        mental: 0,
        relationships: 0,
        social: 0,
        career: 0,
        financialPositive: 0,
        financialNegative: 0,
        learning: 0,
        achievement: 0,
        leisure: 0,
        totalMood: 0,
        totalEnergy: 0,
        totalStress: 0,
        totalSleep: 0,
        moodCount: 0,
        activities: {
            exercise: 0,
            socializing: 0,
            workDone: 0,
            learning: 0,
            hobby: 0,
            healthyMeal: 0,
            meditation: 0,
            outdoor: 0,
            helping: 0,
            grateful: 0
        }
    }

    recentJournals.forEach(journal => {
        const fullText = `${journal.content} ${journal.tags.join(' ')}`

        // キーワードカウント
        analysis.physical += countKeywords(fullText, keywords.physical)
        analysis.mental += countKeywords(fullText, keywords.mental)
        analysis.relationships += countKeywords(fullText, keywords.relationships)
        analysis.social += countKeywords(fullText, keywords.social)
        analysis.career += countKeywords(fullText, keywords.career)
        analysis.financialPositive += countKeywords(fullText, keywords.financial.positive)
        analysis.financialNegative += countKeywords(fullText, keywords.financial.negative)
        analysis.learning += countKeywords(fullText, keywords.learning)
        analysis.achievement += countKeywords(fullText, keywords.achievement)
        analysis.leisure += countKeywords(fullText, keywords.leisure)

        // 気分データ集計
        if (journal.mood) {
            analysis.totalMood += journal.mood
            analysis.moodCount++
        }
        if (journal.energy) analysis.totalEnergy += journal.energy
        if (journal.stress) analysis.totalStress += journal.stress
        if (journal.sleep) analysis.totalSleep += journal.sleep

        // 活動データ集計
        if (journal.activities) {
            const acts = journal.activities
            if (acts.exercise) analysis.activities.exercise++
            if (acts.socializing) analysis.activities.socializing++
            if (acts.workDone) analysis.activities.workDone++
            if (acts.learning) analysis.activities.learning++
            if (acts.hobby) analysis.activities.hobby++
            if (acts.healthyMeal) analysis.activities.healthyMeal++
            if (acts.meditation) analysis.activities.meditation++
            if (acts.outdoor) analysis.activities.outdoor++
            if (acts.helping) analysis.activities.helping++
            if (acts.grateful) analysis.activities.grateful++
        }
    })

    return { analysis, journalCount: recentJournals.length }
}

/**
 * タスクデータを分析
 */
function analyzeTasks(tasks: TaskData[]) {
    const taskAnalysis = {
        health: { total: 0, completed: 0 },
        social: { total: 0, completed: 0 },
        work: { total: 0, completed: 0 },
        learning: { total: 0, completed: 0 }
    }

    tasks.forEach(task => {
        const text = `${task.title} ${task.tags?.join(' ') || ''}`

        if (countKeywords(text, keywords.physical) > 0) {
            taskAnalysis.health.total++
            if (task.completed) taskAnalysis.health.completed++
        }
        if (countKeywords(text, keywords.relationships) > 0 || countKeywords(text, keywords.social) > 0) {
            taskAnalysis.social.total++
            if (task.completed) taskAnalysis.social.completed++
        }
        if (countKeywords(text, keywords.career) > 0) {
            taskAnalysis.work.total++
            if (task.completed) taskAnalysis.work.completed++
        }
        if (countKeywords(text, keywords.learning) > 0) {
            taskAnalysis.learning.total++
            if (task.completed) taskAnalysis.learning.completed++
        }
    })

    return taskAnalysis
}

/**
 * 目標データを分析
 */
function analyzeGoals(goals: GoalData[]) {
    const goalAnalysis = {
        career: [] as number[],
        financial: [] as number[],
        learning: [] as number[],
        overall: [] as number[]
    }

    goals.forEach(goal => {
        const text = `${goal.title} ${goal.category || ''}`

        if (countKeywords(text, keywords.career) > 0) {
            goalAnalysis.career.push(goal.progress)
        }
        if (countKeywords(text, keywords.financial.positive) > 0) {
            goalAnalysis.financial.push(goal.progress)
        }
        if (countKeywords(text, keywords.learning) > 0) {
            goalAnalysis.learning.push(goal.progress)
        }

        goalAnalysis.overall.push(goal.progress)
    })

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

    return {
        careerAvg: avg(goalAnalysis.career),
        financialAvg: avg(goalAnalysis.financial),
        learningAvg: avg(goalAnalysis.learning),
        overallAvg: avg(goalAnalysis.overall)
    }
}

/**
 * メイン: Life Balanceスコアを計算
 */
export function calculateLifeBalanceScores(
    journals: JournalData[],
    tasks: TaskData[],
    goals: GoalData[],
    days: number = 30
): LifeBalanceScores {
    const { analysis, journalCount } = analyzeJournals(journals, days)
    const taskAnalysis = analyzeTasks(tasks)
    const goalAnalysis = analyzeGoals(goals)

    // 1. 身体的健康
    const journalPhysicalScore = Math.min((analysis.physical / Math.max(1, days)) * 100 * (30 / days), 100)
    const activityScore = (analysis.activities.exercise / Math.max(1, days)) * 100 * (30 / days)
    const healthTaskScore = taskAnalysis.health.total > 0
        ? (taskAnalysis.health.completed / taskAnalysis.health.total) * 100
        : 50
    const energyScore = analysis.moodCount > 0
        ? (analysis.totalEnergy / analysis.moodCount / 5) * 100
        : 50
    const sleepScore = analysis.moodCount > 0
        ? (analysis.totalSleep / analysis.moodCount / 5) * 100
        : 50

    const physical = Math.round(
        journalPhysicalScore * 0.2 +
        activityScore * 0.3 +
        healthTaskScore * 0.2 +
        energyScore * 0.15 +
        sleepScore * 0.15
    )

    // 2. 精神的健康
    const moodScore = analysis.moodCount > 0
        ? (analysis.totalMood / analysis.moodCount / 5) * 100
        : 50
    const stressScore = analysis.moodCount > 0
        ? ((5 - analysis.totalStress / analysis.moodCount) / 5) * 100
        : 50
    const positiveJournals = Math.min((analysis.mental / Math.max(1, days)) * 100 * (30 / days), 100)
    const meditationScore = (analysis.activities.meditation / Math.max(1, days)) * 100 * (30 / days)

    const mental = Math.round(
        moodScore * 0.4 +
        stressScore * 0.3 +
        positiveJournals * 0.2 +
        meditationScore * 0.1
    )

    // 3. 人間関係
    const socialActivityScore = (analysis.activities.socializing / Math.max(1, days)) * 100 * (30 / days)
    const relationshipJournalScore = Math.min((analysis.relationships / Math.max(1, days)) * 100 * (30 / days), 100)
    const socialTaskScore = taskAnalysis.social.total > 0
        ? (taskAnalysis.social.completed / taskAnalysis.social.total) * 100
        : 50

    const relationships = Math.round(
        socialActivityScore * 0.5 +
        relationshipJournalScore * 0.3 +
        socialTaskScore * 0.2
    )

    // 4. 社会貢献
    const helpingScore = (analysis.activities.helping / Math.max(1, days)) * 100 * (30 / days)
    const contributionJournalScore = Math.min((analysis.social / Math.max(1, days)) * 100 * (30 / days), 100)

    const social = Math.round(
        helpingScore * 0.6 +
        contributionJournalScore * 0.4
    )

    // 5. 仕事・キャリア
    const workTaskScore = taskAnalysis.work.total > 0
        ? (taskAnalysis.work.completed / taskAnalysis.work.total) * 100
        : 50
    const careerGoalScore = goalAnalysis.careerAvg
    const workActivityScore = (analysis.activities.workDone / Math.max(1, days)) * 100 * (30 / days)

    const career = Math.round(
        workTaskScore * 0.5 +
        careerGoalScore * 0.3 +
        workActivityScore * 0.2
    )

    // 6. 経済的安定
    const financialSentiment = analysis.financialPositive - analysis.financialNegative
    const sentimentScore = Math.max(0, Math.min(100, 50 + financialSentiment * 10))
    const financialGoalScore = goalAnalysis.financialAvg

    const financial = Math.round(
        sentimentScore * 0.7 +
        financialGoalScore * 0.3
    )

    // 7. 学習・成長
    const learningActivityScore = (analysis.activities.learning / Math.max(1, days)) * 100 * (30 / days)
    const learningJournalScore = Math.min((analysis.learning / Math.max(1, days)) * 100 * (30 / days), 100)
    const learningTaskScore = taskAnalysis.learning.total > 0
        ? (taskAnalysis.learning.completed / taskAnalysis.learning.total) * 100
        : 50
    const learningGoalScore = goalAnalysis.learningAvg

    const learning = Math.round(
        learningActivityScore * 0.4 +
        learningJournalScore * 0.3 +
        learningTaskScore * 0.2 +
        learningGoalScore * 0.1
    )

    // 8. 自己実現
    const overallGoalScore = goalAnalysis.overallAvg
    const achievementJournalScore = Math.min((analysis.achievement / Math.max(1, days)) * 100 * (30 / days), 100)

    const selfActualization = Math.round(
        overallGoalScore * 0.6 +
        achievementJournalScore * 0.4
    )

    // 9. 趣味・余暇
    const hobbyActivityScore = (analysis.activities.hobby / Math.max(1, days)) * 100 * (30 / days)
    const leisureJournalScore = Math.min((analysis.leisure / Math.max(1, days)) * 100 * (30 / days), 100)
    const outdoorScore = (analysis.activities.outdoor / Math.max(1, days)) * 100 * (30 / days)

    const leisure = Math.round(
        hobbyActivityScore * 0.4 +
        leisureJournalScore * 0.3 +
        outdoorScore * 0.3
    )

    return {
        physical: Math.max(0, Math.min(100, physical)),
        mental: Math.max(0, Math.min(100, mental)),
        relationships: Math.max(0, Math.min(100, relationships)),
        social: Math.max(0, Math.min(100, social)),
        career: Math.max(0, Math.min(100, career)),
        financial: Math.max(0, Math.min(100, financial)),
        learning: Math.max(0, Math.min(100, learning)),
        selfActualization: Math.max(0, Math.min(100, selfActualization)),
        leisure: Math.max(0, Math.min(100, leisure))
    }
}
