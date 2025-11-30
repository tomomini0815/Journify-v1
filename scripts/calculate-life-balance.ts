import { PrismaClient } from '@prisma/client'
import { calculateLifeBalanceScores } from '../lib/lifeBalanceScoring'

const prisma = new PrismaClient()

async function calculateScores() {
    // ユーザーを取得
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No user found')
        return
    }

    console.log(`\n📊 Calculating Life Balance scores for: ${user.email}\n`)

    // 過去30日のデータを取得
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // ジャーナルデータ取得
    const journals = await prisma.journalEntry.findMany({
        where: {
            userId: user.id,
            createdAt: { gte: thirtyDaysAgo }
        },
        select: {
            content: true,
            tags: true,
            mood: true,
            energy: true,
            stress: true,
            sleep: true,
            activities: true,
            createdAt: true
        }
    })

    console.log(`📝 Found ${journals.length} journal entries`)

    // タスクデータ取得
    const tasksData = await prisma.task.findMany({
        where: { userId: user.id },
        select: {
            text: true,
            completed: true
        }
    })

    const tasks = tasksData.map(t => ({
        title: t.text,
        completed: t.completed
    }))

    console.log(`✅ Found ${tasks.length} tasks`)

    // 目標データ取得
    const goals = await prisma.goal.findMany({
        where: { userId: user.id },
        select: {
            title: true,
            progress: true
        }
    })

    console.log(`🎯 Found ${goals.length} goals\n`)

    // スコア計算
    const scores = calculateLifeBalanceScores(
        journals as any,
        tasks as any,
        goals as any
    )

    console.log('計算されたスコア:')
    console.log(JSON.stringify(scores, null, 2))

    // カテゴリー名マッピング
    const categoryMapping = {
        physical: "身体的健康",
        mental: "精神的健康",
        relationships: "人間関係",
        social: "社会貢献",
        career: "仕事・キャリア",
        financial: "経済的安定",
        learning: "学習・成長",
        selfActualization: "自己実現",
        leisure: "趣味・余暇"
    }

    // データベースに保存
    console.log('\n💾 Saving scores to database...')

    const savePromises = Object.entries(scores).map(([key, value]) => {
        const category = categoryMapping[key as keyof typeof categoryMapping]
        return prisma.lifeBalanceEntry.create({
            data: {
                userId: user.id,
                category,
                score: value
            }
        })
    })

    await Promise.all(savePromises)

    console.log('✅ Scores saved successfully!\n')
    console.log('スコア一覧:')
    Object.entries(scores).forEach(([key, value]) => {
        const category = categoryMapping[key as keyof typeof categoryMapping]
        console.log(`  ${category}: ${value}点`)
    })

    console.log('\n🎉 完了！ダッシュボードをリフレッシュしてください。')
}

calculateScores()
    .catch((e) => {
        console.error('Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
