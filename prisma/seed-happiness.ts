import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error('No user found')
        return
    }

    console.log(`Generating 1 year of happiness data for ${user.email}...`)

    // 以前のテストデータを削除（重複防止）
    console.log('Cleaning up old test data...')
    await prisma.journalEntry.deleteMany({
        where: {
            userId: user.id,
            title: { startsWith: '記録 ' },
            content: '幸福度推移テスト用の自動生成データです。'
        }
    })

    const today = new Date()
    let currentMood = 3 // Start with neutral

    // 過去365日分のデータを生成
    for (let i = 365; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        // 時間をランダムに設定 (9:00 - 22:00)
        date.setHours(9 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60), 0, 0)

        // Random walk: -1, 0, or +1, but bias towards keeping same mood
        const rand = Math.random()
        let change = 0
        if (rand < 0.2) change = -1
        else if (rand > 0.8) change = 1

        currentMood += change

        // Clamp between 1 and 5
        if (currentMood < 1) currentMood = 1
        if (currentMood > 5) currentMood = 5

        // ランダムな活動データ生成
        const activities = {
            exercise: Math.random() > 0.6,
            socializing: Math.random() > 0.7,
            workDone: Math.random() > 0.3, // 仕事は頻度高め
            learning: Math.random() > 0.6,
            hobby: Math.random() > 0.5,
            healthyMeal: Math.random() > 0.4,
            meditation: Math.random() > 0.8,
            outdoor: Math.random() > 0.7,
            helping: Math.random() > 0.8,
            grateful: Math.random() > 0.5
        }

        // Create journal entry
        await prisma.journalEntry.create({
            data: {
                userId: user.id,
                title: `記録 ${date.getMonth() + 1}/${date.getDate()}`,
                content: '幸福度推移テスト用の自動生成データです。',
                mood: currentMood,
                energy: Math.max(1, Math.min(5, currentMood + (Math.random() > 0.5 ? 1 : -1))),
                stress: Math.max(1, Math.min(5, 6 - currentMood)), // 気分が良いとストレスは低い傾向
                sleep: Math.floor(Math.random() * 3) + 3, // 3-5
                activities: activities,
                tags: ['テストデータ'],
                createdAt: date,
                updatedAt: date
            }
        })

        if (i % 30 === 0) {
            process.stdout.write('.')
        }
    }

    console.log('\n✅ Done! Generated 1 year of test data with complex activities.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
