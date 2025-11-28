"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion, AnimatePresence } from "framer-motion"

// 期間の型定義
type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL"

// カラーテーマの定義
const colorThemes: Record<string, { main: string, gradient: string, stroke: string, label: string }> = {
    "1W": {
        main: "#8b5cf6", // Violet
        gradient: "from-violet-500/5",
        stroke: "#a78bfa",
        label: "週間"
    },
    "1M": {
        main: "#3b82f6", // Blue
        gradient: "from-blue-500/5",
        stroke: "#60a5fa",
        label: "月間"
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
        label: "6ヶ月"
    },
    "1Y": {
        main: "#ec4899", // Pink
        gradient: "from-pink-500/5",
        stroke: "#f472b6",
        label: "年間"
    }
}

// サンプルデータ生成関数
const generateData = (range: string) => {
    const data = []
    const count = 12 // ポイント数を統一
    const today = new Date()

    let baseValue = 75
    // 期間ごとに特徴的な動きをつける
    if (range === "1W") baseValue = 70;
    if (range === "1M") baseValue = 65;
    if (range === "3M") baseValue = 80;
    if (range === "6M") baseValue = 60;
    if (range === "1Y") baseValue = 75;

    for (let i = 0; i < count; i++) {
        const volatility = Math.floor(Math.random() * 15) - 5
        let value = baseValue + volatility

        // トレンドをつける
        if (range === "1W") value += i * 1.5;
        if (range === "1M") value += i * 0.5;
        if (range === "3M") value -= i * 0.5;
        if (range === "6M") value += Math.sin(i) * 10;
        if (range === "1Y") value += i * 0.2;

        value = Math.max(40, Math.min(100, Math.round(value)))
        baseValue = value

        // 日付ラベルの生成
        let dateLabel = ""
        const d = new Date(today)

        if (range === "1W") {
            // 直近12日間
            d.setDate(today.getDate() - (count - 1 - i))
            dateLabel = `${d.getMonth() + 1}/${d.getDate()}`
        } else if (range === "1M") {
            // 直近1ヶ月（約3日おき）
            d.setDate(today.getDate() - (count - 1 - i) * 3)
            dateLabel = `${d.getMonth() + 1}/${d.getDate()}`
        } else if (range === "3M") {
            // 直近3ヶ月（1週間おき）
            d.setDate(today.getDate() - (count - 1 - i) * 7)
            dateLabel = `${d.getMonth() + 1}/${d.getDate()}`
        } else if (range === "6M") {
            // 直近6ヶ月（2週間おき）
            d.setDate(today.getDate() - (count - 1 - i) * 14)
            dateLabel = `${d.getMonth() + 1}/${d.getDate()}`
        } else if (range === "1Y") {
            // 直近1年（1ヶ月おき）
            d.setMonth(today.getMonth() - (count - 1 - i))
            dateLabel = `${d.getMonth() + 1}月`
        }

        data.push({ index: i, date: dateLabel, value: value })
    }
    return data
}

// データセット
const rawDatasets: Record<string, any[]> = {
    "1W": generateData("1W"),
    "1M": generateData("1M"),
    "3M": generateData("3M"),
    "6M": generateData("6M"),
    "1Y": generateData("1Y"),
}

// 統合データセット（ALLモード用）
const mergedData = Array.from({ length: 12 }, (_, i) => {
    // ALLモード時のラベルはインデックス（経過）とするか、代表的な期間の日付を使う
    // ここではシンプルに経過ポイントとして表示（ツールチップで詳細が見れるため）
    return {
        index: i,
        date: `${i + 1}`,
        "1W": rawDatasets["1W"][i].value,
        "1M": rawDatasets["1M"][i].value,
        "3M": rawDatasets["3M"][i].value,
        "6M": rawDatasets["6M"][i].value,
        "1Y": rawDatasets["1Y"][i].value,
    }
})

// カスタムツールチップ
const CustomTooltip = ({ active, payload, label, range }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a]/95 border border-white/20 rounded-xl p-3 backdrop-blur-sm shadow-xl min-w-[150px]">
                <p className="text-white/60 text-xs mb-2">ポイント {label}</p>
                <div className="flex flex-col gap-2">
                    {payload.map((entry: any, index: number) => {
                        // ALLモードまたは選択された期間のみ表示
                        if (range !== "ALL" && entry.name !== range) return null;

                        const theme = colorThemes[entry.name as keyof typeof colorThemes] || { main: "#fff", label: entry.name };
                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                        style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className="text-sm font-medium text-white">{theme.label}</span>
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

export function HappinessChart() {
    const [range, setRange] = useState<TimeRange>("1M")

    // 表示するデータと設定
    const isAll = range === "ALL"
    const currentData = isAll ? mergedData : rawDatasets[range]
    const currentTheme = isAll ? null : colorThemes[range]

    // 統計計算（単一期間選択時のみ）
    let stats = { current: 0, average: 0, trend: 0 }
    if (!isAll) {
        const data = rawDatasets[range]
        const currentVal = data[data.length - 1].value
        const startVal = data[0].value
        stats = {
            current: currentVal,
            average: Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length),
            trend: Math.round(((currentVal - startVal) / startVal) * 100)
        }
    }

    // カスタムドット
    const CustomDot = (props: any) => {
        const { cx, cy, payload, dataKey } = props;
        if (!isAll && payload.index === 11) {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold mb-1 text-white">幸福度の推移</h3>
                        <p className="text-white/60 text-sm">時間とともに心の状態を追跡</p>
                    </div>

                    {/* 期間切り替えボタン */}
                    <div className="flex flex-wrap gap-1 bg-black/20 p-1 rounded-xl backdrop-blur-md border border-white/5">
                        {[...Object.keys(colorThemes), "ALL"].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r as TimeRange)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${range === r
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                                    }`}
                                style={range === r && r !== "ALL" ? { color: colorThemes[r as keyof typeof colorThemes].main, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
                            >
                                {r === "ALL" ? "全期間" : colorThemes[r as keyof typeof colorThemes].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-[300px] sm:h-[400px] relative">
                {/* 背景のグロー効果 */}
                <div className={`absolute inset-0 bg-gradient-to-t ${!isAll ? currentTheme?.gradient : 'from-white/5'} via-transparent to-transparent rounded-2xl transition-colors duration-500`}></div>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={isAll ? mergedData : currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {Object.entries(colorThemes).map(([key, theme]) => (
                                <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.main} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={theme.main} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.4)"
                            style={{ fontSize: '11px' }}
                            tickMargin={10}
                            axisLine={false}
                            tickLine={false}
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

                        {/* 各期間のエリアを描画 */}
                        {(Object.keys(colorThemes) as Array<keyof typeof colorThemes>).map((key) => {
                            // ALLモードか、その期間が選択されている場合のみ描画
                            if (range !== "ALL" && range !== key) return null;

                            const theme = colorThemes[key];
                            return (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={isAll ? key : "value"}
                                    name={key}
                                    stroke={theme.main}
                                    strokeWidth={isAll ? 2 : 3}
                                    fill={`url(#color-${key})`}
                                    fillOpacity={isAll ? 0.1 : 1}
                                    dot={!isAll ? <CustomDot /> : false}
                                    activeDot={{ r: 6, fill: theme.main, stroke: "#fff", strokeWidth: 2 }}
                                    animationDuration={1000}
                                />
                            );
                        })}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 凡例 (Legend) */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-6 pt-6 border-t border-white/10">
                {(Object.keys(colorThemes) as Array<keyof typeof colorThemes>).map((key) => (
                    <div
                        key={key}
                        className="flex items-center justify-center gap-2"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colorThemes[key].main }}
                        ></div>
                        <span className="text-xs text-white/70">{colorThemes[key].label}</span>
                    </div>
                ))}
            </div>

            {/* Stats - ALLモード時は非表示または概要を表示 */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                {!isAll ? (
                    <>
                        <div>
                            <p className="text-white/60 text-xs mb-1">現在</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">
                                {stats.current} <span className="text-sm font-normal text-white/40">/ 100</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs mb-1">平均 ({colorThemes[range].label})</p>
                            <p className="text-xl sm:text-2xl font-bold" style={{ color: currentTheme?.stroke }}>{stats.average}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs mb-1">トレンド</p>
                            <div className="flex items-baseline gap-1">
                                <p className={`text-xl sm:text-2xl font-bold ${stats.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {stats.trend >= 0 ? '+' : ''}{stats.trend}%
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="col-span-3 text-center text-white/60 text-sm">
                        全期間のデータを比較表示中
                    </div>
                )}
            </div>
        </motion.div>
    )
}
