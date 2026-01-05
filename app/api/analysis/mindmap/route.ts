import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    console.log("=== Mind Map Generation Started ===");
    try {
        const { startDate, endDate, userId, focusTopic, intent } = await req.json(); // intent: 'expansion' | 'advice'
        console.log(`Request range: ${startDate} to ${endDate}, Focus: ${focusTopic || 'None'}, Intent: ${intent || 'topic'}`);

        if (!process.env.GOOGLE_API_KEY) {
            console.error("Missing GOOGLE_API_KEY");
            return NextResponse.json({ error: "Gemini API key not configured (GOOGLE_API_KEY)" }, { status: 500 });
        }

        // 1. Fetch Journals
        // Ideally we filter by userId, but for local demo we might fetch all if no auth
        // Assuming we have a way to identify user or just fetching first user's for demo
        const journals = await prisma.journalEntry.findMany({
            where: {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
                // userId: userId // Uncomment if auth is ready
            },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit for context window safety
        });

        const voiceJournals = await prisma.voiceJournal.findMany({
            where: {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        console.log(`Found ${journals.length} journals and ${voiceJournals.length} voice journals.`);

        if (journals.length === 0 && voiceJournals.length === 0) {
            console.warn("No journals found for this period.");
            return NextResponse.json({ nodes: [], edges: [], coaching: "この期間のジャーナルが見つかりませんでした。記録を始めてみましょう！" });
        }

        // 2. Prepare Context for AI
        let contextText = "Here are the user's journal entries:\n";

        journals.forEach(j => {
            contextText += `[${j.createdAt.toISOString().split('T')[0]}] (Text) Title: ${j.title}, Content: ${j.content}, Mood: ${j.mood}\n`;
        });

        voiceJournals.forEach(j => {
            contextText += `[${j.createdAt.toISOString().split('T')[0]}] (Voice) Transcript: ${j.transcript}, Summary: ${j.aiSummary}, Mood: ${j.mood}\n`;
        });

        console.log("Sending prompt to Gemini...");

        // 3. Call Gemini
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // Using flash for speed/cost, currently flash-exp or 1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let promptInstruction = `
        あなたはユーザーのジャーナル（日記）を分析するAIコーチです。
        あなたのタスクは、ユーザーの思考・出来事・感情のつながりを可視化する「マインドマップ」を作成し、さらに「コーチングアドバイス」を提供することです。
        
        **全ての出力は日本語で行ってください（キー名は英語のままでOK）。**
        `;

        if (focusTopic) {
            if (intent === 'advice') {
                promptInstruction += `
                 \n**重要: 「${focusTopic}」というトピックに対して、具体的なアドバイスや解決策、ポジティブな視点（リフレーミング）を提案してください。**
                 中心ノードは「${focusTopic}」とし、そこから「具体的なアクション」「気づき」「励まし」などを枝として展開してください。
                 ノードのタイプは 'leaf' とし、ラベルには短いアドバイス文を入れてください。
                 `;
            } else {
                promptInstruction += `
                 \n**重要: 今回は特に「${focusTopic}」というトピックに焦点を当てて深掘りしてください。**
                 中心ノードは「${focusTopic}」とし、そこから関連する詳細な要素を展開してください。
                 `;
            }
        } else {
            promptInstruction += `
             \n1. **マインドマップの構造 (Mind Map Structure)**:
             - **Central Node (中心ノード)**: この期間の核心となるテーマ (例: "2026年1月", "成長と葛藤", "家族との時間"など)。
             `;
        }

        const prompt = `
        ${promptInstruction}

        1. **マインドマップの構造 (Mind Map Structure)**:
           ${focusTopic ? '' : '- **Central Node (中心ノード)**: 上記参照。'}
           - **Main Branches (主要な枝)**: 3-5個の関連要素。${intent === 'advice' ? '（アドバイスや解決策）' : ''}
           - **Leaf Nodes (葉ノード)**: 具体的な気づき、出来事、感情。
           - **Nodes**: 重複しない 'id'、'label' (短い日本語のテキスト)、'type' ('root', 'branch', 'leaf' のいずれか)、および 'originalJournalId' (特定の記事に関連する場合、そうでなければnull) を含めてください。
           - **Edges**: source id と target id を接続してください。

        2. **コーチング (Coaching)**:
           - ユーザーの状態を統合・分析してください。
           - **Observation (観察)**: ユーザーのパターンや傾向についての受容的な観察 (例: "あなたは...のように感じているようですね")。
           - **Question (問い)**: 前に進むためのパワフルなコーチング質問を1つ。
           - **Action (アクション)**: 具体的で小さなアクションの提案を1つ。

        出力は以下のフォーマットの純粋なJSONのみにしてください (markdownのcode blockは不要):
        {
          "nodes": [
            { "id": "1", "type": "root", "label": "${focusTopic || '1月のテーマ'}" },
            { "id": "2", "type": "branch", "label": "仕事" }
          ],
          "edges": [
            { "id": "e1-2", "source": "1", "target": "2" }
          ],
          "coaching": {
            "observation": "...",
            "question": "...",
            "action": "..."
          }
        }

        ジャーナルデータ:
        ${contextText}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("Gemini Response received.");

        // Cleanup markdown if present
        const jsonStr = responseText.replace(/```json\n?|```\n?/g, "").trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Mindmap generation error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate mind map" }, { status: 500 });
    }
}
