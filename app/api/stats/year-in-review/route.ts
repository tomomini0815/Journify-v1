import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        // 総記録日数の計算
        const [journals, tasks, meetings] = await Promise.all([
            prisma.journalEntry.findMany({
                where: {
                    userId: user.id,
                    createdAt: { gte: yearStart, lte: yearEnd }
                },
                select: { createdAt: true }
            }),
            prisma.task.findMany({
                where: {
                    userId: user.id,
                    createdAt: { gte: yearStart, lte: yearEnd }
                },
                select: { createdAt: true }
            }),
            prisma.meetingLog.findMany({
                where: {
                    project: { userId: user.id },
                    createdAt: { gte: yearStart, lte: yearEnd }
                },
                select: { createdAt: true }
            })
        ]);

        // ユニークな日付を抽出
        const uniqueDates = new Set<string>();
        [...journals, ...tasks, ...meetings].forEach(item => {
            const dateStr = item.createdAt.toISOString().split('T')[0];
            uniqueDates.add(dateStr);
        });

        const totalRecordDays = uniqueDates.size;

        // 月別の生産性スコア計算
        const monthlyActivity: { [key: number]: number } = {};
        for (let month = 0; month < 12; month++) {
            monthlyActivity[month] = 0;
        }

        [...journals, ...tasks, ...meetings].forEach(item => {
            const month = item.createdAt.getMonth();
            monthlyActivity[month]++;
        });

        const mostProductiveMonth = Object.entries(monthlyActivity)
            .reduce((max, [month, count]) =>
                count > max.count ? { month: parseInt(month), count } : max,
                { month: 0, count: 0 }
            );

        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

        // 達成したゴール数
        const completedGoals = await prisma.goal.count({
            where: {
                userId: user.id,
                progress: 100,
                updatedAt: { gte: yearStart, lte: yearEnd }
            }
        });

        // 最も使った絵文字の分析
        const journalContents = await prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: yearStart, lte: yearEnd }
            },
            select: { content: true, title: true }
        });

        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const emojiCount: { [key: string]: number } = {};

        journalContents.forEach(journal => {
            const text = `${journal.title} ${journal.content}`;
            const emojis = text.match(emojiRegex) || [];
            emojis.forEach(emoji => {
                emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
            });
        });

        const mostUsedEmoji = Object.entries(emojiCount)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '📝';

        // テーマカラーの判定（感情分析）
        const moodScores = await prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: yearStart, lte: yearEnd },
                mood: { not: null }
            },
            select: { mood: true }
        });

        const avgMood = moodScores.length > 0
            ? moodScores.reduce((sum, entry) => sum + (entry.mood || 0), 0) / moodScores.length
            : 5;

        let themeColor = '青系（集中力の高さを示す）';
        if (avgMood >= 8) {
            themeColor = '黄色系（ポジティブなエネルギーを示す）';
        } else if (avgMood >= 6) {
            themeColor = '緑系（バランスの良さを示す）';
        } else if (avgMood >= 4) {
            themeColor = '青系（集中力の高さを示す）';
        } else {
            themeColor = '紫系（内省的な深さを示す）';
        }

        // 追加統計
        const stats = {
            totalJournals: journals.length,
            totalTasks: tasks.length,
            totalMeetings: meetings.length,
            totalGoals: await prisma.goal.count({ where: { userId: user.id } }),
            completedTasks: await prisma.task.count({
                where: {
                    userId: user.id,
                    completed: true,
                    updatedAt: { gte: yearStart, lte: yearEnd }
                }
            })
        };

        return NextResponse.json({
            year: currentYear,
            totalRecordDays,
            mostProductiveMonth: monthNames[mostProductiveMonth.month],
            mostProductiveMonthActivity: mostProductiveMonth.count,
            completedGoals,
            mostUsedEmoji,
            themeColor,
            stats,
            monthlyActivity: Object.entries(monthlyActivity).map(([month, count]) => ({
                month: monthNames[parseInt(month)],
                activity: count
            }))
        });

    } catch (error: any) {
        console.error("Year in Review error:", error);
        return NextResponse.json(
            { error: "Failed to calculate statistics", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
