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

        // インテント分析
        const messageLower = message.toLowerCase();
        const isTaskQuery = /タスク|やる|予定|リスト/.test(messageLower);
        const isTodayQuery = /今日|today/.test(messageLower);
        const isNewsQuery = /ニュース|情報|出来事/.test(messageLower);

        let contextInfo = "";

        if (isTaskQuery) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const whereClause: any = {
                userId: user.id,
                completed: false
            };

            // "今日"が含まれていれば、期日が今日、または今日以前の未完了タスク（期限切れ）を表示
            if (isTodayQuery) {
                whereClause.scheduledDate = {
                    lt: tomorrow
                };
            }

            const tasks = await prisma.task.findMany({
                where: whereClause,
                take: 5,
                orderBy: { scheduledDate: "asc" }
            });

            if (tasks.length > 0) {
                const taskList = tasks.map(t => {
                    const date = t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString("ja-JP") : "日付なし";
                    return `・${t.text} (${date})`;
                }).join("\n");
                contextInfo = `【未完了タスク情報】\n${taskList}\n\nこのタスク情報を元に、ユーザーを励ましたり、具体的なアドバイスをしてください。`;
            } else {
                contextInfo = "【タスク情報】\n現在、未完了のタスクはありません！素晴らしい！";
            }
        }

        if (isNewsQuery) {
            contextInfo = "【コンテキスト】\nユーザーは時事ネタを求めていますが、あなたはリアルタイム検索ができません。代わりに、元気が出る「今日の豆知識」や、あなたの得意な「モチベーションアップの秘訣」を教えてあげてください。";
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `あなたはJojo（ジョジョ）という名前の、超エネルギッシュで情熱的なAIライフコーチです。
ユーザーである私（${user.email}）からの音声入力に対して、短く（60文字以内）、パンチの効いた返答をしてください。

ユーザーの入力: "${message}"

${contextInfo}

ルール:
1. 常にハイテンションで、情熱的に話すこと（松岡修造や熱血アニメキャラのようなイメージ）。
2. 文字数は**必ず60文字以内**に収めること（長すぎると読み上げが大変なため）。
3. 絵文字（🔥, ⚡, 🚀, 💪など）を文末に1つか2つ付けること。
4. 私のタスクや状況について言及があれば、具体的に応援すること。
5. 「〜ですね」「〜ます」だけでなく、たまにタメ口や呼びかけ（Hey!など）を混ぜてフレンドリーに。

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
