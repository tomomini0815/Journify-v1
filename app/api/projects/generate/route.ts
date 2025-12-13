import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Mock delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock Logic (Fallback)
const generateMockPlan = (goal: string) => {
    let plan = null
    const goalLower = goal.toLowerCase()

    if (goalLower.includes("痩") || goalLower.includes("ダイエット") || goalLower.includes("筋トレ")) {
        plan = {
            title: "理想のボディメイク・プロジェクト",
            description: `目標: ${goal}。科学的なアプローチで、リバウンドなく着実に成果を出すための戦略プラン。`,
            milestones: [
                {
                    title: "フェーズ1: 基礎代謝向上と習慣化",
                    description: "最初の1ヶ月は無理な食事制限をせず、運動習慣をつけることに集中する。",
                    tasks: [
                        { text: "現状の体重・体脂肪を記録し、目標数値を壁に貼る", priority: "high" },
                        { text: "週3回のウォーキング（30分）スケジュールを確保", priority: "medium" },
                        { text: "タンパク質中心の朝食メニューを3パターン決める", priority: "medium" },
                        { text: "1日2リットルの水を飲むボトルを用意する", priority: "low" }
                    ]
                },
                {
                    title: "フェーズ2: 強度アップと食事管理",
                    description: "体が慣れてきたところで、運動強度を上げ、食事の質をさらに改善する。",
                    tasks: [
                        { text: "ジムの見学または自宅用ダンベルの購入", priority: "high" },
                        { text: "夕食の炭水化物を半分にする", priority: "medium" },
                        { text: "睡眠時間を7時間確保するためのルーチン作成", priority: "high" }
                    ]
                },
                {
                    title: "フェーズ3: ラストスパートと維持",
                    description: "最終目標に向けて追い込みつつ、終了後も維持できるスタイルを確立する。",
                    tasks: [
                        { text: "有酸素運動と筋トレのセットメニューを実践", priority: "high" },
                        { text: "新しい服を買いに行き、モチベーションを最大化", priority: "medium" }
                    ]
                }
            ],
            risks: [
                "飲み会や外食によるカロリーオーバー（対策：前後で調整）",
                "雨天時の運動不足（対策：室内HIIT動画を用意）",
                "停滞期によるモチベーション低下（対策：体重ではなく見た目の変化を重視）"
            ]
        }
    } else if (goalLower.includes("アプリ") || goalLower.includes("開発") || goalLower.includes("プログラミング")) {
        plan = {
            title: "MVPアプリ開発ロードマップ",
            description: `目標: ${goal}。最小限の機能（MVP）で最速リリースを目指すアジャイル開発プラン。`,
            milestones: [
                {
                    title: "企画・設計フェーズ",
                    description: "迷いのない開発のために、要件とデザインを固める。",
                    tasks: [
                        { text: "コア機能（これがなきゃ意味がない機能）を1つ決める", priority: "high" },
                        { text: "紙とペンで画面遷移図（UIフロー）を描く", priority: "high" },
                        { text: "使用する技術スタック（言語・DB）を選定", priority: "medium" }
                    ]
                },
                {
                    title: "プロトタイプ開発フェーズ",
                    description: "見栄えは後回し。まずは動くものを作る。",
                    tasks: [
                        { text: "開発環境の構築（Hello World表示）", priority: "high" },
                        { text: "データベース設計とスキーマ作成", priority: "medium" },
                        { text: "コア機能の実装（見た目はプレーンでOK）", priority: "high" }
                    ]
                },
                {
                    title: "ブラッシュアップとリリース",
                    description: "ユーザーに使ってもらえる品質に仕上げる。",
                    tasks: [
                        { text: "UIデザインの適用とレスポンシブ対応", priority: "medium" },
                        { text: "バグ出しと修正（友人1人に触ってもらう）", priority: "high" },
                        { text: "デプロイと公開URLの取得", priority: "high" }
                    ]
                }
            ],
            risks: [
                "こだわりすぎて完成しない（対策：機能は削る勇気を持つ）",
                "技術的なハマり（対策：ChatGPTやコミュニティで即質問）",
                "本業の忙しさ（対策：朝1時間を確保）"
            ]
        }
    } else {
        // Default generic plan
        plan = {
            title: "目標達成のための戦略プラン",
            description: `目標: ${goal}。これを確実に達成するためのステップバイステップ計画。`,
            milestones: [
                {
                    title: "準備とリサーチ",
                    description: "成功の8割は準備で決まる。必要な情報と環境を整える。",
                    tasks: [
                        { text: "成功事例やロールモデルを3つ調べる", priority: "medium" },
                        { text: "必要な道具やリソースをリストアップして調達", priority: "medium" },
                        { text: "やらないことリスト（時間を空けるため）を作成", priority: "high" }
                    ]
                },
                {
                    title: "実践と習慣化",
                    description: "まずは質より量。行動を継続することにフォーカスする。",
                    tasks: [
                        { text: "毎日5分だけでも取り組む時間をスケジュール", priority: "high" },
                        { text: "進捗を記録するノートまたはアプリを用意", priority: "medium" }
                    ]
                },
                {
                    title: "改善と完了",
                    description: "結果を見直して修正し、ゴールテープを切る。",
                    tasks: [
                        { text: "中間振り返りを行い、計画を微修正", priority: "high" },
                        { text: "最終成果物の作成または目標数値の達成", priority: "high" }
                    ]
                }
            ],
            risks: [
                "初期の熱量の低下（対策：小さな成功を祝う）",
                "予期せぬトラブル（対策：バッファ期間を設ける）"
            ]
        }
    }
    return plan
}

export async function POST(req: Request) {
    let body;
    try {
        body = await req.json()
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    try {
        const { goal, duration, feedback, currentPlan, action, chatHistory } = body

        // If no API key, check if env has it (runtime check)
        const apiKey = process.env.GEMINI_API_KEY

        console.log(`[API] Action: ${action || 'generate'}, API Key present: ${!!apiKey}`)

        if (!apiKey) {
            console.log("No GEMINI_API_KEY found, using mock.")
            await delay(2000)

            if (action === 'consult') {
                return NextResponse.json({
                    response: "（モックモード）APIキーが設定されていないため、高度な相談機能は利用できませんが、目標を入力してプランを作成することは可能です。"
                })
            }

            // Mock doesn't support feedback refinement yet, just return original mock capability
            const plan = generateMockPlan(goal)
            return NextResponse.json(plan)
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        // Try Pro model first for better quality
        let model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })
        let usingProModel = true

        // --- Consultation Mode (Chat) ---
        if (action === 'consult') {
            const systemPrompt = `
あなたはプロフェッショナルなプロジェクト戦略コンサルタントです。
ユーザーは何か目標を達成したいと考えていますが、まだ具体的になっていないかもしれません。
ユーザーとの対話を通じて、真の目的、制約条件、モチベーションの源泉を引き出してください。
最終的に具体的なプロジェクト計画（マイルストーンやタスク）を作成するための材料を集めることがあなたの役割です。
回答は短潔に、ユーザーが答えやすい質問を含めてください。励ますようなトーンで。
            `

            let prompt = ""
            if (chatHistory && chatHistory.length > 0) {
                // simple history concatenation for now
                prompt = chatHistory.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Consultant'}: ${msg.content}`).join("\n")
                prompt += `\nUser: ${goal}\nConsultant:`
            } else {
                prompt = `User: ${goal}\nConsultant:`
            }

            try {
                const result = await model.generateContent([systemPrompt, prompt])
                const response = await result.response
                const text = response.text()
                return NextResponse.json({ response: text })
            } catch (error: any) {
                // Fallback to Flash model if Pro quota exceeded
                if ((error.message?.includes('quota') || error.message?.includes('429')) && usingProModel) {
                    console.log('[API] Pro model quota exceeded, falling back to Flash')
                    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
                    const result = await model.generateContent([systemPrompt, prompt])
                    const response = await result.response
                    const text = response.text()
                    return NextResponse.json({ response: text })
                }
                throw error
            }
        }

        // --- Plan Generation Mode ---
        let systemPrompt = `
あなたは世界最高峰のプロジェクトマネージャー兼戦略コンサルタントです。
ユーザーの目標を達成するための具体的で実行可能なプロジェクト計画を立案してください。

**出力フォーマット（厳密なJSON）:**
{
  "title": "プロジェクトの魅力的なタイトル",
  "description": "プロジェクトの概要と戦略的アプローチ（100文字程度）",
  "milestones": [
    {
      "title": "マイルストーン（フェーズ）のタイトル",
      "description": "このフェーズの目的と詳細",
      "tasks": [
        { "text": "具体的なアクションプラン（タスク）", "priority": "high/medium/low" }
      ]
    }
  ],
  "risks": [
    "想定されるリスクと、その具体的な対策"
  ]
}

**要件:**
- JSON形式のみを出力してください。Markdownのバッククォートは不要です。
- 言語は「日本語」で出力してください。
- 具体的でアクション可能なタスクを提案してください。
- ユーザーのモチベーションを高めるような、ポジティブかつプロフェッショナルなトーンで記述してください。
        `

        let userPrompt = ""
        if (feedback && currentPlan) {
            userPrompt = `
現在の計画: ${JSON.stringify(currentPlan)}

ユーザーからの修正依頼: "${feedback}"

上記を踏まえて、計画を修正・改善してください。JSON形式で出力してください。
            `
        } else if (chatHistory && chatHistory.length > 0) {
            // Generate based on consultation history
            const conversation = chatHistory.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Consultant'}: ${msg.content}`).join("\n")
            userPrompt = `
これまでの相談内容:
${conversation}

最終的な目標: "${goal}"
期間: "${duration || '未定'}"

これまでの対話を踏まえて、最適なプロジェクトロードマップを作成してください。
             `
        } else {
            userPrompt = `
目標: "${goal}"
期間: "${duration || '未定（最適な期間を提案）'}"

この目標を達成するための最適なロードマップを作成してください。
            `
        }

        try {
            const result = await model.generateContent([systemPrompt, userPrompt])
            const response = await result.response
            let text = response.text()

            // Clean up markdown code blocks if present
            text = text.replace(/```json/g, "").replace(/```/g, "").trim()

            const plan = JSON.parse(text)
            return NextResponse.json(plan)
        } catch (planError: any) {
            // Fallback to Flash model if Pro quota exceeded
            if ((planError.message?.includes('quota') || planError.message?.includes('429')) && usingProModel) {
                console.log('[API] Pro model quota exceeded during plan generation, falling back to Flash')
                model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
                const result = await model.generateContent([systemPrompt, userPrompt])
                const response = await result.response
                let text = response.text()
                text = text.replace(/```json/g, "").replace(/```/g, "").trim()
                const plan = JSON.parse(text)
                return NextResponse.json(plan)
            }
            throw planError
        }

    } catch (error: any) {
        console.error("Strategy generation failed:", error)
        console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)))

        // Fallback to mock on error
        if (body && body.goal) {
            console.log("Falling back to mock plan due to error.")
            return NextResponse.json(generateMockPlan(body.goal))
        }
        return NextResponse.json({ error: "Failed to generate strategy" }, { status: 500 })
    }
}
