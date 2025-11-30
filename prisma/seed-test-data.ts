import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // ユーザーIDを取得（最初のユーザーを使用）
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No user found. Please create a user first.')
        return
    }

    console.log(`Creating test data for user: ${user.email}`)

    // 過去7日分のジャーナルデータを作成
    const testData = [
        {
            title: '月曜日 - 新しい週の始まり',
            content: '今週も頑張ろう！朝ランニングをして、仕事のプロジェクトを進めた。友人とランチで楽しい時間を過ごした。',
            tags: ['運動', '仕事', '友人'],
            mood: 4,
            energy: 4,
            stress: 2,
            sleep: 4,
            activities: {
                exercise: true,
                socializing: true,
                workDone: true,
                learning: false,
                hobby: false,
                healthyMeal: true,
                meditation: false,
                outdoor: true,
                helping: false,
                grateful: true
            },
            daysAgo: 6
        },
        {
            title: '火曜日 - 集中の日',
            content: '一日中集中して仕事。新しいスキルを学ぶためにオンライン講座を受講した。夜は読書。',
            tags: ['仕事', '学習', '読書'],
            mood: 3,
            energy: 3,
            stress: 3,
            sleep: 3,
            activities: {
                exercise: false,
                socializing: false,
                workDone: true,
                learning: true,
                hobby: true,
                healthyMeal: false,
                meditation: false,
                outdoor: false,
                helping: false,
                grateful: false
            },
            daysAgo: 5
        },
        {
            title: '水曜日 - リフレッシュ',
            content: 'ヨガクラスに参加してリフレッシュ。公園を散歩して自然を楽しんだ。瞑想も実践。',
            tags: ['健康', '自然', '瞑想'],
            mood: 5,
            energy: 5,
            stress: 1,
            sleep: 5,
            activities: {
                exercise: true,
                socializing: false,
                workDone: false,
                learning: false,
                hobby: false,
                healthyMeal: true,
                meditation: true,
                outdoor: true,
                helping: false,
                grateful: true
            },
            daysAgo: 4
        },
        {
            title: '木曜日 - 忙しい一日',
            content: '締め切りに追われて忙しかった。でも同僚を手伝えて良かった。夜は疲れた。',
            tags: ['仕事', 'ストレス'],
            mood: 2,
            energy: 2,
            stress: 4,
            sleep: 2,
            activities: {
                exercise: false,
                socializing: true,
                workDone: true,
                learning: false,
                hobby: false,
                healthyMeal: false,
                meditation: false,
                outdoor: false,
                helping: true,
                grateful: false
            },
            daysAgo: 3
        },
        {
            title: '金曜日 - プロジェクト完了！',
            content: 'プロジェクトを無事完了！チームで祝杯を上げた。達成感がすごい。',
            tags: ['仕事', '達成', '友人'],
            mood: 5,
            energy: 4,
            stress: 2,
            sleep: 4,
            activities: {
                exercise: false,
                socializing: true,
                workDone: true,
                learning: false,
                hobby: false,
                healthyMeal: true,
                meditation: false,
                outdoor: false,
                helping: false,
                grateful: true
            },
            daysAgo: 2
        },
        {
            title: '土曜日 - 趣味の時間',
            content: '絵を描いたり、音楽を聴いたり、好きなことをして過ごした。家族と映画鑑賞も。',
            tags: ['趣味', '家族', 'リラックス'],
            mood: 5,
            energy: 4,
            stress: 1,
            sleep: 5,
            activities: {
                exercise: false,
                socializing: true,
                workDone: false,
                learning: false,
                hobby: true,
                healthyMeal: true,
                meditation: false,
                outdoor: false,
                helping: false,
                grateful: true
            },
            daysAgo: 1
        },
        {
            title: '日曜日 - 充実の休日',
            content: 'ハイキングに行って自然を満喫。友人とブランチ。夜は来週の計画を立てた。',
            tags: ['自然', '運動', '友人', '計画'],
            mood: 5,
            energy: 5,
            stress: 1,
            sleep: 5,
            activities: {
                exercise: true,
                socializing: true,
                workDone: false,
                learning: true,
                hobby: true,
                healthyMeal: true,
                meditation: true,
                outdoor: true,
                helping: true,
                grateful: true
            },
            daysAgo: 0
        }
    ]

    // データを作成
    for (const data of testData) {
        const createdAt = new Date()
        createdAt.setDate(createdAt.getDate() - data.daysAgo)
        createdAt.setHours(20, 0, 0, 0) // 20:00に設定

        await prisma.journalEntry.create({
            data: {
                userId: user.id,
                title: data.title,
                content: data.content,
                tags: data.tags,
                mood: data.mood,
                energy: data.energy,
                stress: data.stress,
                sleep: data.sleep,
                activities: data.activities,
                createdAt: createdAt
            }
        })

        console.log(`✓ Created: ${data.title}`)
    }

    console.log('\n✅ Test data created successfully!')
    console.log('Now calculating Life Balance scores...')

    // Life Balanceスコアを計算
    // Note: 実際のアプリでは /api/calculate-life-balance を呼び出しますが、
    // ここでは手動で計算ロジックを実行する必要があります
    console.log('\n⚠️  Please visit http://localhost:3000/journal/new and save a new journal')
    console.log('   to trigger Life Balance score calculation, or call the API manually.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
