import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Mock delay to simulate AI generation
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(req: Request) {
    try {
        // In a real app, we'd get the user from the session
        // const session = await auth()
        // const userId = session?.user?.id

        // Mock User ID for prototype
        const USER_ID = "42c1eda0-18f2-4213-86b0-55b47ee003f3"

        // Fetch recent activity (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const [tasks, journals, goals] = await Promise.all([
            prisma.task.findMany({
                where: {
                    userId: USER_ID,
                    completed: true,
                    updatedAt: { gte: sevenDaysAgo }
                }
            }),
            prisma.journalEntry.findMany({
                where: {
                    userId: USER_ID,
                    createdAt: { gte: sevenDaysAgo }
                }
            }),
            prisma.goal.findMany({
                where: { userId: USER_ID }
            })
        ])

        // Analyze for story generation
        const taskCount = tasks.length
        const journalCount = journals.length
        const highPriorityTasks = tasks.filter(t => t.priority === 'high').length

        // Determine the "Hero Archetype" based on stats
        let archetype = "見習い冒険者"
        if (taskCount > 10) archetype = "歴戦の勇者"
        if (journalCount > 5) archetype = "賢者"
        if (taskCount > 10 && journalCount > 5) archetype = "伝説の英雄"

        // Determine the "Tone"
        const recentMood = journals.length > 0 ? (journals[0].mood || 3) : 3
        const tone = recentMood >= 4 ? "希望に満ちた" : recentMood <= 2 ? "苦難を乗り越える" : "着実な"

        // Generate the Story (Mock Template System)
        await delay(2000) // Simulate "thinking" time

        const titles = [
            "静寂と情熱のクロニクル",
            "境界を超える旅路",
            "星々が語る英雄の詩",
            "暁の決意"
        ]
        const randomTitle = titles[Math.floor(Math.random() * titles.length)]

        let storyContent = ""

        // Intro
        storyContent += `　かつてこの地に、${archetype}としてその名を轟かせる一人の魂がいた。\n`
        storyContent += `その者の名は、現代の魔法使い。${tone}光を瞳に宿し、未知なる一週間という荒野へと旅立った。\n\n`

        // Challenge (Tasks)
        if (taskCount > 0) {
            storyContent += `　旅の途中、${taskCount}体の「タスク」という名の魔物が立ちはだかった。`
            if (highPriorityTasks > 0) {
                storyContent += `その中には、ひときわ巨大な${highPriorityTasks}体の「重要案件」も含まれていたが、`
                storyContent += `英雄は一歩も引くことなく、知恵と勇気でこれらを次々と討ち果たしていった。\n`
            } else {
                storyContent += `しかし、日々の鍛錬を怠らぬ英雄にとって、これらはただの準備運動に過ぎなかった。\n`
            }
        } else {
            storyContent += `　今週は、剣を置き、心身を休めるための休息の時であったのかもしれない。静かな森で、英雄は次なる戦いに備えていた。\n`
        }

        // Reflection (Journals)
        if (journalCount > 0) {
            storyContent += `\n　夜が訪れると、英雄は焚き火を囲み、${journalCount}夜にわたり自身の心と対話した（ジャーナル）。`
            storyContent += `内なる声に耳を傾けることこそが、真の強さの源であることを知っていたからだ。\n`
        }

        // Conclusion
        storyContent += `\n　そして今、新たな週という地平線から朝日が昇ろうとしている。`
        storyContent += `物語はまだ終わらない。次なる章で、どのような奇跡が描かれるのか——それは、神のみぞ知る領域だ。`
        storyContent += `\n\n（To Be Continued...）`

        return NextResponse.json({
            title: randomTitle,
            content: storyContent,
            stats: {
                taskCount,
                journalCount,
                archetype
            }
        })

    } catch (error) {
        console.error("Story generation failed:", error)
        return NextResponse.json(
            { error: "Failed to generate story" },
            { status: 500 }
        )
    }
}
