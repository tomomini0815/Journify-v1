"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function DashboardGreeting() {
    const [greeting, setGreeting] = useState({ title: "", message: "" })

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) {
            setGreeting({
                title: "おはようございます! ☀️",
                message: "今日も素晴らしい1日の始まりですね。朝の積み重ねが、未来を変えます。"
            })
        } else if (hour >= 12 && hour < 18) {
            setGreeting({
                title: "こんにちは! 🌿",
                message: "調子はいかがですか?一息ついて、後半戦も楽しみましょう。"
            })
        } else if (hour >= 18 && hour < 23) {
            setGreeting({
                title: "こんばんは! 🌙",
                message: "今日もお疲れ様でした。1日の振り返りをして、心を整えましょう。"
            })
        } else {
            setGreeting({
                title: "夜遅くまでお疲れ様です ✨",
                message: "星が綺麗ですね。無理せず、ゆっくり休んでくださいね。"
            })
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
            <h1 className="text-[28px] font-bold mb-2">{greeting.title}</h1>
            <p className="text-white/60">{greeting.message}</p>
        </motion.div>
    )
}
