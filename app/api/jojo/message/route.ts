import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // ユーザーの統計を取得
        const [userStats, recentJournals, recentTasks, todayChallenge] = await Promise.all([
            prisma.userStats.findUnique({
                where: { userId: user.id }
            }),
            prisma.journalEntry.count({
                where: {
                    userId: user.id,
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            prisma.task.count({
                where: {
                    userId: user.id,
                    completed: true,
                    updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            prisma.dailyChallenge.findFirst({
                where: {
                    userId: user.id,
                    date: new Date(new Date().toDateString())
                }
            })
        ]);

        // 時間帯を判定
        const hour = new Date().getHours();
        let timeOfDay = "朝";
        if (hour >= 12 && hour < 18) {
            timeOfDay = "午後";
        } else if (hour >= 18) {
            timeOfDay = "夜";
        }

        // コンテキストを作成
        const context = {
            timeOfDay,
            level: userStats?.level || 1,
            currentStreak: userStats?.currentStreak || 0,
            recentJournals,
            recentTasks,
            challengeCompleted: todayChallenge?.completed || false,
            journalCreated: todayChallenge?.journalCreated || false,
            tasksCompleted: todayChallenge?.tasksCompleted || 0
        };

        // Gemini APIでメッセージ生成
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `あなたはJojo（ジョジョ）という名前の、ユーザーを励ますAIマスコットです。
フレンドリーで、ポジティブで、時々ユーモアを交えながら、ユーザーのモチベーションを高めるメッセージを送ります。

ユーザーの現在の状況:
- 時間帯: ${context.timeOfDay}
- レベル: ${context.level}
- 連続記録: ${context.currentStreak}日
- 今週のジャーナル: ${context.recentJournals}件
- 今週の完了タスク: ${context.recentTasks}件
- 今日のチャレンジ完了: ${context.challengeCompleted ? "はい" : "いいえ"}
- 今日のジャーナル作成: ${context.journalCreated ? "はい" : "いいえ"}
- 今日のタスク完了数: ${context.tasksCompleted}

以下のルールに従ってメッセージを生成してください:
1. 1-2文の短いメッセージ（最大50文字程度）
2. 絵文字を1-2個使用
3. ユーザーの状況に応じた適切な励ましや提案
4. 親しみやすく、カジュアルなトーン
5. 時間帯に応じた挨拶を含める

メッセージのみを返してください。説明は不要です。`;

        const result = await model.generateContent(prompt);
        const message = result.response.text().trim();

        return NextResponse.json({ message });

    } catch (error: any) {
        console.error("Jojo message generation error:", error);

        // フォールバックメッセージ
        const fallbackMessages = [
            "こんにちは！今日も一緒に頑張りましょう！✨",
            "素敵な一日になりますように！🌟",
            "あなたの成長を応援しています！💪",
            "小さな一歩が大きな変化を生みます！🚀",
            "今日も記録を続けましょう！📝"
        ];

        const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

        return NextResponse.json({ message: randomMessage });
    } finally {
        await prisma.$disconnect();
    }
}
