import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { message } = await req.json();
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ reply: "APIキーが設定されていません。" });
        }

        // インテント分析（簡易的）
        const isTaskQuery = /タスク|やる|予定|リスト/.test(message);
        const isNewsQuery = /ニュース|情報|出来事/.test(message);

        let contextInfo = "";

        if (isTaskQuery) {
            const tasks = await prisma.task.findMany({
                where: {
                    userId: user.id,
                    completed: false
                },
                take: 5,
                orderBy: { scheduledDate: "asc" }
            });

            if (tasks.length > 0) {
                contextInfo = `未完了のタスク: ${tasks.map(t => t.text).join(", ")}`;
            } else {
                contextInfo = "未完了のタスクはありません。";
            }
        }

        if (isNewsQuery) {
            // ニュースAPIがないため、豆知識を提供
            contextInfo = "ユーザーはニュースを聞いていますが、リアルタイムニュース機能はないため、代わりに元気が出る「今日の豆知識」か「最新テックトレンドの小話」を1つ教えてください。";
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `あなたはJojo（ジョジョ）という名前の、超エネルギッシュで情熱的なAIライフコーチです。
ユーザーからの音声入力に対して、短く（50文字以内）、パンチの効いた返答をしてください。

ユーザーの入力: "${message}"
追加コンテキスト: ${contextInfo}

ルール:
1. 常にハイテンションで、情熱的に話すこと。
2. 絵文字（🔥, ⚡, 🚀など）を適度に使用すること。
3. 音声で読み上げられることを想定し、聞き取りやすい言葉を選ぶこと。
4. 説明的になりすぎず、会話のキャッチボールを重視すること。

返答のみをテキストで出力してください。`;

        const result = await model.generateContent(prompt);
        const reply = result.response.text().trim();

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("Chat API Error Detailed:", error);
        return NextResponse.json({ reply: `ごめんなさい！ちょっと調子が悪いみたいです！🔥 (Error: ${error.message})` });
    } finally {
        await prisma.$disconnect();
    }
}
