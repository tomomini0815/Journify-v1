import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Remove year filters to fetch lifetime data
        // const currentYear = new Date().getFullYear();
        // const yearStart = new Date(currentYear, 0, 1);
        // const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        // 総記録日数の計算 (Lifetime)
        const [journals, tasks, meetings, userProfile] = await Promise.all([
            prisma.journalEntry.findMany({
                where: { userId: user.id },
                select: { createdAt: true, content: true, mood: true }
            }),
            prisma.task.findMany({
                where: { userId: user.id },
                select: { createdAt: true, completed: true, updatedAt: true, priority: true }
            }),
            prisma.meetingLog.findMany({
                where: { project: { userId: user.id } },
                select: { createdAt: true }
            }),
            prisma.user.findUnique({
                where: { id: user.id },
                select: { createdAt: true }
            })
        ]);

        // Calculate Total Characters
        const totalCharacters = journals.reduce((acc, j) => acc + (j.content?.length || 0), 0);

        // ユニークな日付を抽出
        const uniqueDates = new Set<string>();
        [...journals, ...tasks, ...meetings].forEach(item => {
            const dateStr = item.createdAt.toISOString().split('T')[0];
            uniqueDates.add(dateStr);
        });

        const totalRecordDays = uniqueDates.size;

        // 月別の生産性スコア計算 (Cumulative)
        const monthlyActivity: { [key: number]: number } = {};
        for (let month = 0; month < 12; month++) {
            monthlyActivity[month] = 0;
        }

        // 曜日別アクティビティ
        const dayOfWeekActivity: { [key: number]: number } = {};
        for (let day = 0; day < 7; day++) {
            dayOfWeekActivity[day] = 0;
        }

        [...journals, ...tasks, ...meetings].forEach(item => {
            const date = new Date(item.createdAt);
            const month = date.getMonth();
            const day = date.getDay();
            monthlyActivity[month]++;
            dayOfWeekActivity[day]++;
        });

        const mostProductiveMonth = Object.entries(monthlyActivity)
            .reduce((max, [month, count]) =>
                count > max.count ? { month: parseInt(month), count } : max,
                { month: 0, count: 0 }
            );

        const mostProductiveDayIndex = Object.entries(dayOfWeekActivity)
            .reduce((max, [day, count]) =>
                count > max.count ? { day: parseInt(day), count } : max,
                { day: 0, count: 0 }
            ).day;

        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

        // 達成したゴール数 (Lifetime)
        const completedGoals = await prisma.goal.count({
            where: {
                userId: user.id,
                progress: 100
            }
        });

        // 最も使った絵文字の分析
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const emojiCount: { [key: string]: number } = {};

        journals.forEach(journal => {
            const text = `${journal.content}`;
            const emojis = text.match(emojiRegex) || [];
            emojis.forEach(emoji => {
                emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
            });
        });

        const mostUsedEmoji = Object.entries(emojiCount)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '📝';

        // テーマカラーの判定（感情分析 Lifetime）
        const validMoods = journals.filter(j => j.mood !== null);
        const avgMood = validMoods.length > 0
            ? validMoods.reduce((sum, entry) => sum + (entry.mood || 0), 0) / validMoods.length
            : 5;

        // More nuanced colors
        let themeColor = '青系（集中力の高さを示す）';
        if (avgMood >= 8) {
            themeColor = '黄金（輝かしい実績とポジティブさ）';
        } else if (avgMood >= 6) {
            themeColor = 'エメラルド（着実な成長と安定）';
        } else if (avgMood >= 4) {
            themeColor = 'サファイア（深い思考と冷静な判断）';
        } else {
            themeColor = 'アメジスト（内面との対話と感性）';
        }

        // 追加統計
        const stats = {
            totalJournals: journals.length,
            totalTasks: tasks.length,
            totalMeetings: meetings.length,
            totalGoals: await prisma.goal.count({ where: { userId: user.id } }),
            completedTasks: tasks.filter(t => t.completed).length,
            totalCharacters,
            memberSince: userProfile?.createdAt
        };

        // --- AI Coaching Generation ---
        let aiAdvice: string[] = [];

        // Fetch additional context (Life Balance) needed for both AI and Fallback
        const lifeBalanceEntries = await prisma.lifeBalanceEntry.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Calculate Life Balance Highs/Lows
        const balanceMap: Record<string, number> = {};
        lifeBalanceEntries.forEach(e => {
            if (!balanceMap[e.category]) balanceMap[e.category] = e.score;
        });
        const balanceSorted = Object.entries(balanceMap).sort(([, a], [, b]) => b - a);
        const strongestArea = balanceSorted[0] ? `${balanceSorted[0][0]} (${balanceSorted[0][1]}/10)` : "データなし";
        const weakestArea = balanceSorted.length > 0 ? `${balanceSorted[balanceSorted.length - 1][0]} (${balanceSorted[balanceSorted.length - 1][1]}/10)` : null;

        // Dynamic Rule-Based Fallback Generator
        const generateSmartMyAdvice = () => {
            const tips = [];

            // 1. Consistency / Momentum
            if (totalRecordDays < 10) {
                tips.push(`🚀 まだ始まったばかりです！まずは10日間の記録を目指して、「習慣化」の第一歩を踏み出しましょう。`);
            } else if (totalRecordDays >= 30) {
                tips.push(`🔥 素晴らしい継続力です。${totalRecordDays}日間の記録は、あなたの誠実さの証です。この調子で！`);
            } else {
                tips.push(`📅 継続は力なり。${totalRecordDays}日間の記録が溜まってきました。振り返りを行うのに良い時期です。`);
            }

            // 2. Productivity / Action
            const rate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
            if (rate > 80) {
                tips.push(`⚡ 実行力が非常に高いです（完了率 ${rate}%）。次は「重要だが緊急でない」タスクに時間を割いてみましょう。`);
            } else if (rate < 40 && stats.totalTasks > 5) {
                tips.push(`🔍 タスク完了率が${rate}%です。欲張りすぎていませんか？ 1日の「最優先タスク」を1つに絞ってみましょう。`);
            } else {
                tips.push(`⚖️ バランスの取れた活動ができています。${dayNames[mostProductiveDayIndex]}曜日が最もはかどるようなので、重いタスクはこの日に。`);
            }

            // 3. Balance / Mood / Focus
            if (avgMood >= 7.5) {
                tips.push(`🌟 メンタル状態が非常に良好です（平均 ${avgMood.toFixed(1)}）。この「好調の要因」をジャーナルに書き留めておきましょう。`);
            } else if (avgMood <= 4.5) {
                tips.push(`💙 少しお疲れのようです（平均 ${avgMood.toFixed(1)}）。「${monthNames[mostProductiveMonth.month]}」に頑張りすぎた反動かもしれません。休息も仕事のうちです。`);
            } else {
                tips.push(`🧘 安定したメンタルバランスです。ライフバランスの「${weakestArea || '未入力項目'}」に少し意識を向けると、さらに充実するでしょう。`);
            }

            return tips;
        };

        if (process.env.GOOGLE_API_KEY) {
            try {
                // Fetch Recent Goal Titles
                const recentGoals = await prisma.goal.findMany({
                    where: { userId: user.id, progress: 100 },
                    orderBy: { updatedAt: 'desc' },
                    take: 3,
                    select: { title: true }
                });
                const goalTitles = recentGoals.map(g => g.title).join(", ");

                // Use gemini-1.5-flash for speed and reliability
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `
You are an expert productivity coach. Analyze the user's "Year in Review" stats and give 3 specific, data-driven advice tips in Japanese.

User Data:
- Total Active Days: ${totalRecordDays}
- Completed Goals: ${completedGoals} (Recent: ${goalTitles || "None"})
- Life Balance: Strongest=${strongestArea}, Weakest=${weakestArea || "N/A"}
- Most Productive: ${dayNames[mostProductiveDayIndex]}, ${monthNames[mostProductiveMonth.month]}
- Task Completion: ${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
- Average Mood: ${avgMood.toFixed(1)}/10

Requirements:
1. **Specific & Actionable**: Use the numbers above. specific advice only.
2. **Japanese**: Natural, professional, encouraging tone.
3. **Format**: Valid JSON array of 3 strings. NO markdown code blocks.
Example: ["Tip 1...", "Tip 2...", "Challenge: ..."]
`;

                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

                try {
                    aiAdvice = JSON.parse(text);
                    // Validate it's an array
                    if (!Array.isArray(aiAdvice) || aiAdvice.length === 0) throw new Error("Invalid AI response format");
                } catch (e) {
                    console.error("Failed to parse AI advice JSON:", text);
                    // Fallback to split if it looks like a list
                    if (text.includes('\n')) {
                        aiAdvice = text.split('\n').filter(line => line.length > 10).slice(0, 3);
                    } else {
                        throw e; // Use smart fallback
                    }
                }
            } catch (e) {
                console.error("AI Generation failed, using smart fallback:", e);
                aiAdvice = generateSmartMyAdvice();
            }
        } else {
            // No API key, use smart fallback
            aiAdvice = generateSmartMyAdvice();
        }

        return NextResponse.json({
            year: "All Time",
            totalRecordDays,
            mostProductiveMonth: monthNames[mostProductiveMonth.month],
            mostProductiveMonthActivity: mostProductiveMonth.count,
            mostProductiveDay: dayNames[mostProductiveDayIndex],
            completedGoals,
            mostUsedEmoji,
            themeColor,
            stats,
            aiAdvice, // Added field
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
