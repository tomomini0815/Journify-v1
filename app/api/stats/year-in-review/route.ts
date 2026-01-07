import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

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
        if (process.env.GOOGLE_API_KEY) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                const prompt = `
                User Statistics Analysis for Productivity Coaching:
                - Total Active Days: ${totalRecordDays}
                - Total Words Written: ${totalCharacters}
                - Goals Completed: ${completedGoals}
                - Most Productive Day: ${dayNames[mostProductiveDayIndex]}
                - Most Productive Month: ${monthNames[mostProductiveMonth.month]}
                - Task Completion Rate: ${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                - Average Mood (1-10): ${avgMood.toFixed(1)}
                - Most Used Emoji: ${mostUsedEmoji}
                - Activity Breakdown: Journals(${stats.totalJournals}), Tasks(${stats.totalTasks}), Meetings(${stats.totalMeetings})

                Based on this specific data, provide 3 highly specific, actionable, and data-driven coaching tips (bullet points) in Japanese.
                
                Guidelines:
                1. **Be Specific:** Don't just say "Keep it up". Say "You are most productive on Fridays, so schedule complex tasks then." or "Your task completion rate is 60%, try breaking down tasks to improve this."
                2. **Use Data:** Explicitly mention the numbers or trends in the advice (e.g., "You've written ${totalCharacters} characters...").
                3. **Action-Oriented:** Give a concrete next step.
                4. **Tone:** Professional yet encouraging productivity coach.
                
                Format: JSON array of strings. Example: ["Tip 1", "Tip 2", "Tip 3"]
                Do not include markdown blocks like \`\`\`json. Just the raw array.
                `;

                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                try {
                    aiAdvice = JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse AI advice JSON, falling back to text split", text);
                    aiAdvice = text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
                }
            } catch (e) {
                console.error("AI Generation failed:", e);
                aiAdvice = [
                    "継続は力なり！毎日の記録があなたの大きな財産になっています。",
                    "調子の良い日は、新しいことに挑戦するチャンスです。",
                    "疲れた時は無理せず休むことも、長期的な成功の秘訣です。"
                ];
            }
        } else {
            aiAdvice = [
                "APIキーが設定されていないため、一般的なアドバイスを表示しています。",
                "継続は力なり！毎日の記録があなたの大きな財産になっています。",
                "バランスの取れた生活を心がけましょう。"
            ];
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
