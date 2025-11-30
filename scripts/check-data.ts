import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
    // ユーザーを取得
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No user found')
        return
    }

    console.log(`\n📊 Checking data for user: ${user.email}\n`)

    // ジャーナルエントリー数を確認
    const journalCount = await prisma.journalEntry.count({
        where: { userId: user.id }
    })
    console.log(`📝 Journal Entries: ${journalCount}`)

    // 最新のジャーナルを表示
    const latestJournals = await prisma.journalEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
            title: true,
            mood: true,
            energy: true,
            stress: true,
            sleep: true,
            createdAt: true
        }
    })

    console.log('\n最新のジャーナル:')
    latestJournals.forEach((j, i) => {
        console.log(`  ${i + 1}. ${j.title}`)
        console.log(`     気分:${j.mood} エネルギー:${j.energy} ストレス:${j.stress} 睡眠:${j.sleep}`)
        console.log(`     作成日: ${j.createdAt}`)
    })

    // Life Balanceエントリー数を確認
    const lifeBalanceCount = await prisma.lifeBalanceEntry.count({
        where: { userId: user.id }
    })
    console.log(`\n📈 Life Balance Entries: ${lifeBalanceCount}`)

    // 最新のLife Balanceスコアを表示
    const latestScores = await prisma.lifeBalanceEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 9,
        select: {
            category: true,
            score: true,
            createdAt: true
        }
    })

    if (latestScores.length > 0) {
        console.log('\n最新のLife Balanceスコア:')
        latestScores.forEach(s => {
            console.log(`  ${s.category}: ${s.score}点 (${s.createdAt})`)
        })
    } else {
        console.log('\n⚠️  Life Balanceスコアが見つかりません！')
        console.log('   スコアを計算する必要があります。')
    }

    // タスク数を確認
    const taskCount = await prisma.task.count({
        where: { userId: user.id }
    })
    console.log(`\n✅ Tasks: ${taskCount}`)

    // 目標数を確認
    const goalCount = await prisma.goal.count({
        where: { userId: user.id }
    })
    console.log(`🎯 Goals: ${goalCount}`)

    console.log('\n' + '='.repeat(50))
    if (lifeBalanceCount === 0) {
        console.log('❌ Life Balanceスコアが計算されていません')
        console.log('   /api/calculate-life-balance を呼び出す必要があります')
    } else {
        console.log('✅ データは正常に保存されています')
        console.log('   ダッシュボードをリフレッシュしてください')
    }
}

checkData()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
