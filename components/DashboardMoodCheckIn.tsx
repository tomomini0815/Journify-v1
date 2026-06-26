"use client"

import { useEffect, useMemo, useState } from "react"
import { Check } from "lucide-react"

const moods = [
    { value: "great", label: "好調", emoji: "😊", tone: "bg-emerald-400/15 border-emerald-300/25 text-emerald-100" },
    { value: "calm", label: "穏やか", emoji: "😌", tone: "bg-cyan-400/15 border-cyan-300/25 text-cyan-100" },
    { value: "focused", label: "集中", emoji: "🎯", tone: "bg-blue-400/15 border-blue-300/25 text-blue-100" },
    { value: "motivated", label: "前向き", emoji: "🔥", tone: "bg-orange-400/15 border-orange-300/25 text-orange-100" },
    { value: "grateful", label: "感謝", emoji: "🌿", tone: "bg-lime-400/15 border-lime-300/25 text-lime-100" },
    { value: "anxious", label: "不安", emoji: "🌧️", tone: "bg-violet-400/15 border-violet-300/25 text-violet-100" },
    { value: "angry", label: "怒り", emoji: "😠", tone: "bg-red-400/15 border-red-300/25 text-red-100" },
    { value: "tired", label: "疲れ気味", emoji: "🌙", tone: "bg-slate-300/10 border-slate-200/20 text-slate-100" },
    { value: "stuck", label: "停滞", emoji: "🪨", tone: "bg-zinc-300/10 border-zinc-200/20 text-zinc-100" },
    { value: "other", label: "その他", emoji: "✦", tone: "bg-white/10 border-white/20 text-white" },
]

export function DashboardMoodCheckIn() {
    const storageKey = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10)
        return `journify-dashboard-mood-${today}`
    }, [])
    const [selectedMood, setSelectedMood] = useState<string>("")

    useEffect(() => {
        setSelectedMood(localStorage.getItem(storageKey) || "")
    }, [storageKey])

    const selectMood = (value: string) => {
        setSelectedMood(value)
        localStorage.setItem(storageKey, value)
    }

    return (
        <div className="dashboard-panel-subtle p-2.5">
            <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                    <p className="dashboard-section-label mb-0.5">Mood</p>
                    <p className="text-sm font-semibold text-white">今日の気分</p>
                </div>
                {selectedMood && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-200">
                        <Check className="h-3.5 w-3.5" />
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {moods.map((mood) => {
                    const isSelected = selectedMood === mood.value
                    return (
                        <button
                            key={mood.value}
                            type="button"
                            onClick={() => selectMood(mood.value)}
                            className={`flex h-8 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-semibold transition-colors ${isSelected ? mood.tone : "border-white/[0.07] bg-white/[0.035] text-white/56 hover:bg-white/[0.065] hover:text-white"}`}
                            aria-pressed={isSelected}
                        >
                            <span aria-hidden>{mood.emoji}</span>
                            <span>{mood.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
