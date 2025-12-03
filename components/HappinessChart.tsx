"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

// 期間の型定義
type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL"

// カラーテーマの定義
const colorThemes: Record<string, { main: string, gradient: string, stroke: string, label: string }> = {
    "1W": {
        main: "#8b5cf6", // Violet
        gradient: "from-violet-500/5",
        stroke: "#a78bfa",
        label: "1週間"
    },
    "1M": {
        main: "#3b82f6", // Blue
        gradient: "from-blue-500/5",
        stroke: "#60a5fa",
        label: "1ヶ月"
    },
    "3M": {
        main: "#10b981", // Emerald
        gradient: "from-emerald-500/5",
        stroke: "#34d399",
        label: "3ヶ月"
    },
    "6M": {
        main: "#f59e0b", // Amber
        gradient: "from-amber-500/5",
        stroke: "#fbbf24",
        label: "半年"
    },
    "1Y": {
        main: "#ec4899", // Pink
        gradient: "from-pink-500/5",
        stroke: "#f472b6",
        label: "1年"
    },
    "ALL": {
        main: "#6366f1", // Indigo
        gradient: "from-indigo-500/5",
        stroke: "#818cf8",
        label: "全期間"
    }
}

// カスタムツールチップ
const CustomTooltip = ({ active, payload, label, range }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a]/95 border border-white/20 rounded-xl p-3 backdrop-blur-sm shadow-xl min-w-[150px]">
                <p className="text-white/60 text-xs mb-2">{label}</p>
                <div className="flex flex-col gap-2">
                    {payload.map((entry: any, index: number) => {
                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                        style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className="text-sm font-medium text-white">幸福度</span>
                                </div>
                                <span className="text-sm font-bold" style={{ color: entry.color }}>
                                    {entry.value}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
    return null
}

export function HappinessChart({ data: initialData }: { data?: any[] }) {
    const [range, setRange] = useState<TimeRange>("1M")
    const [chartData, setChartData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // APIパラメータへのマッピング
    const rangeToPeriod: Record<TimeRange, string> = {
        "1W": "1week",
        "1M": "1month",
        "3M": "3months",
        "6M": "6months",
        "1Y": "1year",
        "ALL": "all"
    }

    // データ取得
    useEffect(() => {
        const fetchData = async () => {
            // 初期ロード時かつ1ヶ月の場合は初期データを使用（あれば）
            if (range === "1M" && initialData && initialData.length > 0 && chartData.length === 0) {
                const formatted = initialData.map((d: any) => ({
                    date: new Date(d.date).toLocaleDateString(),
                    value: d.score,
                    originalDate: d.date // ソートや比較用
                }))
                setChartData(formatted)
                return
            }

            setIsLoading(true)
            try {
                const period = rangeToPeriod[range]
                const response = await fetch(`/api/happiness/stats?period=${period}`, { cache: 'no-store' })
                if (response.ok) {
                    const result = await response.json()
                    const formatted = result.data.map((d: any) => ({
                        date: new Date(d.date).toLocaleDateString(),
                        value: d.score,
                        originalDate: d.date
                    }))
                    setChartData(formatted)
                }
            } catch (error) {
                console.error("Failed to fetch happiness stats:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [range])

    const currentTheme = colorThemes[range] || colorThemes["1M"]
    const hasData = chartData.length > 0

    // Stats calculation
    let stats = { current: 0, average: 0, trend: 0 }
    if (hasData) {
        const currentVal = chartData[chartData.length - 1].value
        const startVal = chartData[0].value
        stats = {
            current: currentVal,
            average: Math.round(chartData.reduce((sum: number, item: any) => sum + item.value, 0) / chartData.length),
            trend: startVal !== 0 ? Math.round(((currentVal - startVal) / startVal) * 100) : 0
        }
    }

    // Custom Dot
    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (payload.index === chartData.length - 1) {
            return (
                <g>
                    <circle cx={cx} cy={cy} r={6} fill={props.stroke} stroke="#fff" strokeWidth={2} />
                    <circle cx={cx} cy={cy} r={12} fill="none" stroke={props.stroke} strokeWidth={1} opacity={0.5}>
                        <animate attributeName="r" from="6" to="12" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                </g>
            );
        }
        return null;
    }

    // 日付フォーマッター
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        if (range === "1W" || range === "1M") {
            return `${date.getMonth() + 1}/${date.getDate()}`
        } else if (range === "3M" || range === "6M") {
            return `${date.getMonth() + 1}/${date.getDate()}`
        } else {
            return `${date.getFullYear()}/${date.getMonth() + 1}`
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold mb-1 text-white">幸福度の推移</h3>
                        <p className="text-white/60 text-sm">時間とともに心の状態を追跡</p>
                    </div>

                    {/* 期間セレクター (上部に配置) */}
                    <div className="flex bg-black/40 p-1 rounded-xl overflow-x-auto no-scrollbar">
                        {(Object.keys(colorThemes) as TimeRange[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setRange(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${range === t
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                    }`}
                            >
                                {colorThemes[t].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-[300px] sm:h-[400px] min-h-[300px] min-w-0 relative outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none *:focus:outline-none" style={{ width: '100%' }}>
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-t ${currentTheme.gradient} via-transparent to-transparent rounded-2xl transition-colors duration-500`}></div>

                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                )}

                {!hasData && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
                        データがありません
                    </div>
                )}

                {hasData && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="color-main" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentTheme.main} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={currentTheme.main} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.4)"
                                style={{ fontSize: '11px' }}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                                tickFormatter={formatDate}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.4)"
                                style={{ fontSize: '11px' }}
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={<CustomTooltip range={range} />}
                                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '5 5' }}
                            />

                            <Area
                                type="monotone"
                                dataKey="value"
                                name="happiness"
                                stroke={currentTheme.main}
                                strokeWidth={3}
                                fill="url(#color-main)"
                                fillOpacity={1}
                                dot={<CustomDot />}
                                activeDot={{ r: 6, fill: currentTheme.main, stroke: "#fff", strokeWidth: 2 }}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Color Legend - 純粋な凡例 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentTheme.main }}
                    ></div>
                    <span className="text-xs text-white/70">幸福度</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                    <p className="text-white/60 text-xs mb-1">現在</p>
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {stats.current}
                    </p>
                </div>
                <div>
                    <p className="text-white/60 text-xs mb-1">平均</p>
                    <p
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: currentTheme.stroke }}
                    >
                        {stats.average}
                    </p>
                </div>
                <div>
                    <p className="text-white/60 text-xs mb-1">トレンド</p>
                    <div className="flex items-baseline gap-1">
                        <p className={`text-xl sm:text-2xl font-bold ${stats.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stats.trend >= 0 ? '+' : ''}{stats.trend}%
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
