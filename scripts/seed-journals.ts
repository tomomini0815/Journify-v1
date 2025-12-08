
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding journal entries...')

    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No user found to attach journals to. Please create a user first.')
        return
    }

    console.log(`Using user: ${user.email} (${user.id})`)

    // First, clear existing journal and life balance entries for this user
    console.log('Clearing existing journal and life balance entries for this user...')
    await prisma.journalEntry.deleteMany({
        where: { userId: user.id }
    })
    await prisma.lifeBalanceEntry.deleteMany({
        where: { userId: user.id }
    })

    // Explicit type safety hack if needed, but array literal usually works
    const entriesToCreate: any[] = []
    const lifeBalanceEntriesToCreate: any[] = []

    const today = new Date()
    const threeMonthsAgo = new Date(today)
    threeMonthsAgo.setMonth(today.getMonth() - 3)

    let currentDate = new Date(threeMonthsAgo)

    // Bias mood towards neutral/positive (3, 4, 5)
    const moods = [2, 3, 3, 3, 4, 4, 4, 4, 5, 5]
    const tagsList = ['仕事', '個人', 'アイデア', '振り返り', '健康', '学習', '趣味', '家族']

    const lifeBalanceCategories = [
        "身体的健康", "精神的健康", "人間関係", "社会貢献",
        "仕事・キャリア", "経済的安定", "学習・成長", "自己実現", "趣味・余暇"
    ]

    // Sample content generator
    const titles = [
        '日々の振り返り',
        '素晴らしいアイデア',
        '打ち合わせメモ',
        '運動ログ',
        '学習の進捗',
        'のんびりした休日',
        '生産的な一日',
        '今日は忙しかった',
        '良いニュース',
        '普通の一日'
    ]
    const contents = [
        '今日はごく普通の一日だった。仕事を少し進めて、夜はゆっくりできた。リラックスできたので明日も頑張ろう。',
        '会議が多かったが、とても生産的だった。チームの雰囲気も良く、プロジェクトが前に進んでいるのを感じる。週末が楽しみだ。',
        '少し疲れ気味。最近睡眠不足かもしれない。今日は早めに寝て、体調を整えようと思う。新しいプロジェクトの準備も進めた。',
        'すごい進捗があった！ずっと悩んでいた難しいバグがついに解決した。解決策が見つかった瞬間の爽快感はたまらない。',
        '今朝は早起きしてランニングに行った。空気が澄んでいて気分爽快。天気も完璧だった。運動はやはりメンタルに良い。',
        '新しい技術について読書と学習の時間を作った。技術の進化は早いが、新しいことを学ぶのは常にワクワクする。',
        '締め切りが近づいていて少しストレスを感じているが、計画通りに進めればなんとかなると思う。焦らず一つずつ片付けよう。',
        '久しぶりに友人と夕食に行った。美味しい食事と良い会話を楽しんだ。リフレッシュできた素晴らしい時間だった。',
        '今日の出来事を忘れないようにメモ。大きなイベントはなかったが、着実にタスクをこなせた。こういう日々の積み重ねが大事だ。',
        '次の四半期に向けていくつか新しいアイデアをブレインストーミングした。将来の展望が見えてきて、とても前向きな気分だ。'
    ]

    while (currentDate <= today) {
        const entryDate = new Date(currentDate)
        entryDate.setHours(Math.floor(Math.random() * 14) + 8) // 8 AM to 10 PM
        entryDate.setMinutes(Math.floor(Math.random() * 60))

        // Randomly decide if we skip a day (80% chance to have an entry)
        if (Math.random() > 0.2) {
            const mood = moods[Math.floor(Math.random() * moods.length)]
            const energy = Math.floor(Math.random() * 5) + 1
            const stress = Math.floor(Math.random() * 5) + 1
            const sleep = Math.floor(Math.random() * 5) + 1

            // Pick 1-3 random tags
            const numTags = Math.floor(Math.random() * 3) + 1
            const shuffledTags = tagsList.sort(() => 0.5 - Math.random())
            const tags = shuffledTags.slice(0, numTags)

            const randomIdx = Math.floor(Math.random() * titles.length)

            entriesToCreate.push({
                userId: user.id,
                title: titles[randomIdx],
                content: `<p>${contents[randomIdx]}</p><p>また、今日はもう少し詳しく書いておきたい気分だ。日々の些細なことの中にこそ、幸せがあるのかもしれない。</p>`,
                tags: tags,
                mood: mood,
                energy: energy,
                stress: stress,
                sleep: sleep,
                activities: { exercise: Math.random() > 0.5, reading: Math.random() > 0.5, meditation: Math.random() > 0.7 },
                createdAt: entryDate,
                updatedAt: entryDate
            })
        }

        // Generate Life Balance entries roughly once every 2 weeks (approx 14 days)
        // Using a simpler random check: 1/14 chance ~ 7%
        // Increased to 10% to fill more gaps
        if (Math.random() < 0.1 || currentDate.getTime() === threeMonthsAgo.getTime()) {
            lifeBalanceCategories.forEach(category => {
                // "Moderate" feel: Base 6, variance -1 to +3 -> Range 5 to 9.
                let score = 6 + Math.floor(Math.random() * 5) - 1;
                if (score > 10) score = 10;
                if (score < 1) score = 1;

                lifeBalanceEntriesToCreate.push({
                    userId: user.id,
                    category: category,
                    score: score,
                    date: entryDate,
                    createdAt: entryDate,
                    updatedAt: entryDate
                })
            })
        }

        // Default to strict daily increment
        currentDate.setDate(currentDate.getDate() + 1)
    }

    // FORCE add entries for "Today" (Now) to ensure the chart has the absolute latest data
    const now = new Date()
    console.log(`Forcing Life Balance entries for Today: ${now.toISOString()}`)
    lifeBalanceCategories.forEach(category => {
        // Optimistic today: Range 7 to 9 (mostly good)
        let score = 7 + Math.floor(Math.random() * 3);
        if (score > 10) score = 10;

        const todayEntry = {
            userId: user.id,
            category: category,
            score: score,
            date: now,
            createdAt: now,
            updatedAt: now
        }
        lifeBalanceEntriesToCreate.push(todayEntry)
    })

    console.log(`Generated ${entriesToCreate.length} journal entries.`)
    console.log(`Generated ${lifeBalanceEntriesToCreate.length} life balance entries.`)
    console.log('Inserting into database...')

    await prisma.journalEntry.createMany({
        data: entriesToCreate
    })

    await prisma.lifeBalanceEntry.createMany({
        data: lifeBalanceEntriesToCreate
    })

    console.log('Seeding completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
