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

        const prompt = `あなたはJojo（ジョジョ）という名前の、超エネルギッシュで情熱的なAIライフコーチです。
ユーザーに活力を与え、モチベーションを極限まで高めることがあなたの使命です。

現在のユーザーの状況:
- 時間帯: ${context.timeOfDay}
- レベル: ${context.level}
- 連続記録: ${context.currentStreak}日
- 今週のジャーナル: ${context.recentJournals}件
- 今週の完了タスク: ${context.recentTasks}件
- 今日のチャレンジ完了: ${context.challengeCompleted ? "はい" : "いいえ"}
- 今日のジャーナル作成: ${context.journalCreated ? "はい" : "いいえ"}
- 今日のタスク完了数: ${context.tasksCompleted}

以下のルールに従って、魂を揺さぶるようなメッセージを生成してください:
1. 1-2文の短く、パンチの効いたメッセージ（最大50文字程度）
2. 🔥, ⚡, 🚀, 🌟 などの勢いのある絵文字を必ず使用
3. 「最高」「情熱」「全力」「突破」などの力強い言葉を使う
4. ユーザーの背中を強く押すような、熱いトーンで話す
5. 時間帯に応じた呼びかけを含める（例：「おはようございます！今日も最高の一日にしましょう！」など）
6. 決して落ち着いたトーンにはならないこと。常にハイテンションで！

メッセージのみを返してください。説明は不要です。`;

        const result = await model.generateContent(prompt);
        const message = result.response.text().trim();

        return NextResponse.json({ message });

    } catch (error: any) {
        console.error("Jojo message generation error:", error);

        // フォールバックメッセージ
        const fallbackMessages = [
            "今日も全開でいきましょう！あなたの可能性は無限大です！🚀🔥",
            "最高の瞬間は今ここにある！情熱を燃やせ！⚡💪",
            "一歩踏み出せば、景色は変わる！さあ、行こう！🌟🏃",
            "困難こそ成長のチャンス！全力で突破しましょう！🧗‍♂️💥",
            "記録はあなたの軌跡！今日も歴史を刻みましょう！📝✨"
        ];

        const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

        return NextResponse.json({ message: randomMessage });
    } finally {
        await prisma.$disconnect();
    }
}
