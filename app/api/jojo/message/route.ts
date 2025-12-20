import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inspirationalQuotes } from "@/lib/quotes-data";

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // ランダムに名言を選択
        const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];

        // メッセージを整形
        const message = `"${randomQuote.quote}"\nby ${randomQuote.author}`;

        return NextResponse.json({ message });

    } catch (error: any) {
        console.error("Jojo message error:", error);

        // フォールバックメッセージ
        const fallbackMessages = [
            "\"人間の偉大さは、恐怖に立ち向かう勇気によって測られる。\"\nby ウィンストン・チャーチル",
            "\"真の覚悟とは、未知への道を自ら切り開く決意である。\"\nby スティーブ・ジョブズ",
            "\"自分の信念に従って行動すれば、決して後悔することはない。\"\nby マハトマ・ガンジー",
            "\"誰もが内に秘めた無限の可能性を持っている。それを信じることから全てが始まる。\"\nby ヘレン・ケラー",
            "\"幸福は目的地ではなく、旅そのものの中にある。\"\nby ラルフ・ワルド・エマーソン"
        ];

        const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

        return NextResponse.json({ message: randomMessage });
    }
}
