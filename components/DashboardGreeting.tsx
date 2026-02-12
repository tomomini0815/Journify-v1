"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

// 時間帯ごとの挨拶バリエーション
const morningGreetings = [
    { title: "おはようございます! ☀️", message: "今日も素晴らしい1日の始まりですね。朝の積み重ねが、未来を変えます。" },
    { title: "おはようございます! 🌅", message: "新しい朝、新しいチャンス。今日はどんな発見があるでしょう？" },
    { title: "おはようございます! 🌤️", message: "朝のひとときを大切に。心地よいスタートが最高の1日を作ります。" },
    { title: "おはようございます! ☕", message: "深呼吸して、一杯のコーヒーとともに。今日も自分らしく過ごしましょう。" },
    { title: "Good Morning! 🌄", message: "Morning routine が人生を変える。今日も小さな一歩を踏み出そう。" },
    { title: "おはようございます! 🐦", message: "早起きは三文の徳。今日という日を最大限に活かしましょう。" },
    { title: "おはようございます! 🌿", message: "自然のリズムに合わせて、穏やかな朝を。今日も一歩ずつ前へ。" },
    { title: "おはようございます! 💪", message: "昨日の自分を超える日。さあ、今日のチャレンジを楽しもう！" },
]

const afternoonGreetings = [
    { title: "こんにちは! 🌿", message: "調子はいかがですか？一息ついて、後半戦も楽しみましょう。" },
    { title: "こんにちは! 🍵", message: "午後のティータイムはいかが？リフレッシュして後半も頑張ろう。" },
    { title: "こんにちは! 🌻", message: "太陽のように明るく、午後も自分のペースで進みましょう。" },
    { title: "お疲れ様です! ✌️", message: "ここまでよく頑張りました。残りの時間を有意義に使いましょう。" },
    { title: "こんにちは! 🎯", message: "午前中の勢いそのままに。目標に向かって一歩ずつ進もう。" },
    { title: "こんにちは! 🌈", message: "午後の時間を味方に。焦らず丁寧に、今できることを。" },
    { title: "こんにちは! 📚", message: "知識は最高の投資。午後も学びの時間を大切にしましょう。" },
    { title: "Good Afternoon! 🌞", message: "一日の折り返し地点。ペースを整えて、ゴールに向かおう。" },
]

const eveningGreetings = [
    { title: "こんばんは! 🌙", message: "今日もお疲れ様でした。1日の振り返りをして、心を整えましょう。" },
    { title: "こんばんは! 🌃", message: "夜のひとときは自分だけの時間。今日の頑張りを褒めてあげよう。" },
    { title: "お疲れ様でした! 🍃", message: "今日1日を乗り越えた自分に拍手。ゆっくりリラックスしよう。" },
    { title: "こんばんは! 🎵", message: "好きな音楽でも聴きながら、心穏やかな夜を過ごしましょう。" },
    { title: "こんばんは! 📝", message: "今日の感謝を3つ見つけてみよう。小さな幸せが明日の力になる。" },
    { title: "Good Evening! ✨", message: "今日も一歩前進しましたね。明日への準備を楽しもう。" },
    { title: "こんばんは! 🌜", message: "今日の成果を振り返って、明日への糧にしましょう。" },
    { title: "こんばんは! 🧘", message: "心と体をほぐす時間。深呼吸して、今日の緊張を解放しよう。" },
]

const lateNightGreetings = [
    { title: "夜遅くまでお疲れ様です ✨", message: "星が綺麗ですね。無理せず、ゆっくり休んでくださいね。" },
    { title: "まだ起きているんですね 🌠", message: "夜更かしもほどほどに。明日の自分のために、そろそろ休もう。" },
    { title: "深夜のひととき 🦉", message: "静かな夜は考え事にぴったり。でもぐっすり眠ることも大切です。" },
    { title: "こんな時間まで…! 🌌", message: "真夜中のクリエイティビティを大切に。でも体も大事にしてね。" },
    { title: "お夜食タイム? 🍜", message: "遅い時間ですが、自分を労ってあげましょう。お疲れ様です。" },
    { title: "夜ふかしさん 🐱", message: "この時間は自分だけの秘密基地。でも明日の元気も確保しよう。" },
]

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function DashboardGreeting() {
    const [greeting, setGreeting] = useState({ title: "", message: "" })

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) {
            setGreeting(pickRandom(morningGreetings))
        } else if (hour >= 12 && hour < 18) {
            setGreeting(pickRandom(afternoonGreetings))
        } else if (hour >= 18 && hour < 23) {
            setGreeting(pickRandom(eveningGreetings))
        } else {
            setGreeting(pickRandom(lateNightGreetings))
        }
    }, [])

    if (!greeting.title) return <div className="h-20" /> // Loading placeholder

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
        >
            <div className="flex items-center gap-4 mb-2">
                <h1 className="text-[28px] font-bold">{greeting.title}</h1>
            </div>
            <p className="text-white/60">{greeting.message}</p>
        </motion.div>
    )
}
