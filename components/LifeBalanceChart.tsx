"use client"

import { useState, useEffect } from "react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

// カテゴリーごとの色定義 - より鮮やかでスタイリッシュなカラーパレット
const categoryColors: Record<string, string> = {
    "身体的健康": "#10b981", // エメラルドグリーン
    "精神的健康": "#8b5cf6", // バイオレット
    "人間関係": "#ec4899", // ピンク
    "仕事・キャリア": "#f59e0b", // アンバー
    "経済的安定": "#06b6d4", // シアン
    "学習・成長": "#3b82f6", // ブルー
    "趣味・余暇": "#f97316", // オレンジ
    "社会貢献": "#14b8a6", // ティール
    "自己実現": "#a855f7", // パープル
}

// カスタムツールチップ
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const category = payload[0].payload.category
        const color = categoryColors[category]
        return (
            <div className="bg-[#1a1a1a]/95 border border-white/20 rounded-xl p-3 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <p className="text-white font-medium">{category}</p>
                </div>
                <p className="text-sm" style={{ color }}>
                    {payload[0].value}点 <span className="text-white/60">/ 100点</span>
                </p>
            </div>
        )
    }
    return null
}

// カスタムドット - 各ポイントを色分け
const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    const color = categoryColors[payload.category]

    return (
        <circle
            cx={cx}
            cy={cy}
            r={5}
            fill={color}
            stroke="#fff"
            strokeWidth={2}
            filter="drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))"
        />
    )
}

// CustomLabel - 項目名を色分け
const CustomLabel = (props: any) => {
    const { x, y, payload, index } = props
    const color = categoryColors[payload.value]

    // ラベルの位置を調整
    const total = 9
    const angle = (index / total) * 360

    const { cx, cy } = props

    // 中心からの角度を再計算
    const radian = Math.atan2(y - cy, x - cx)
    const radius = 10 // オフセット距離を調整

    const labelX = x + Math.cos(radian) * radius
    const labelY = y + Math.sin(radian) * radius

    // 角度に基づいてテキストのアンカー位置を調整
    const degree = (radian * 180) / Math.PI
    const normalizedDegree = degree < 0 ? degree + 360 : degree

    let textAnchor: "start" | "middle" | "end" = 'middle'
    if (normalizedDegree > 280 || normalizedDegree < 80) {
        textAnchor = 'start'
    } else if (normalizedDegree > 100 && normalizedDegree < 260) {
        textAnchor = 'end'
    }

    let dominantBaseline: "auto" | "hanging" | "central" = 'central'
    if (normalizedDegree > 45 && normalizedDegree < 135) {
        dominantBaseline = 'hanging' // 下
    } else if (normalizedDegree > 225 && normalizedDegree < 315) {
        dominantBaseline = 'auto' // 上
    }

    return (
        <text
            x={labelX}
            y={labelY}
            fill={color}
            fontSize={11}
            fontWeight={600}
            textAnchor={textAnchor}
            dominantBaseline={dominantBaseline}
        >
            {payload.value}
        </text>
    )
}

export function LifeBalanceChart({ data: initialData }: { data?: { category: string, value: number }[] }) {
    const [period, setPeriod] = useState('1month')
    const [chartData, setChartData] = useState(initialData || [])
    const [isLoading, setIsLoading] = useState(false)

    // Default data structure
    const defaultData = [
        { category: "身体的健康", value: 0 },
        { category: "精神的健康", value: 0 },
        { category: "人間関係", value: 0 },
        { category: "社会貢献", value: 0 },
        { category: "仕事・キャリア", value: 0 },
        { category: "経済的安定", value: 0 },
        { category: "学習・成長", value: 0 },
        { category: "自己実現", value: 0 },
        { category: "趣味・余暇", value: 0 },
    ]

    const displayData = chartData.length > 0 ? chartData : defaultData

    // 期間変更時にデータを取得
    useEffect(() => {
        const fetchData = async () => {
            if (period === '1month' && initialData && initialData.length > 0) {
                // 初期データを使用（初回レンダリング時など）
                // ただし、ユーザーが明示的に1ヶ月を選択し直した場合は再取得しても良いが、
                // ここではシンプルにするため、APIを常に呼ぶようにする
            }

            setIsLoading(true)
            try {
                const response = await fetch(`/api/life-balance/stats?period=${period}`)
                if (response.ok) {
                    const result = await response.json()
                    // APIのレスポンス形式（オブジェクト）をチャート用の配列に変換
                    const scores = result.scores
                    const formattedData = [
                        { category: "身体的健康", value: scores.physical },
                        { category: "精神的健康", value: scores.mental },
                        { category: "人間関係", value: scores.relationships },
                        { category: "社会貢献", value: scores.social },
                        { category: "仕事・キャリア", value: scores.career },
                        { category: "経済的安定", value: scores.financial },
                        { category: "学習・成長", value: scores.learning },
                        { category: "自己実現", value: scores.selfActualization },
                        { category: "趣味・余暇", value: scores.leisure },
                    ]
                    setChartData(formattedData)
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setIsLoading(false)
            }
        }

        // 初回マウント時はinitialDataがあればスキップ、なければ取得
        if (period === '1month' && initialData && initialData.length > 0 && chartData === initialData) {
            return
        }

        fetchData()
    }, [period])

    // 平均値を計算
    const average = Math.round(displayData.reduce((sum, item) => sum + item.value, 0) / displayData.length)

    // 最高・最低を見つける
    const highest = displayData.reduce((max, item) => item.value > max.value ? item : max, displayData[0])
    const lowest = displayData.reduce((min, item) => item.value < min.value ? item : min, displayData[0])

    const periods = [
        { id: '1day', label: '1日' },
        { id: '1week', label: '1週間' },
        { id: '1month', label: '1ヶ月' },
        { id: '6months', label: '半年' },
        { id: '1year', label: '1年' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold mb-1 text-white">
                        幸福度バランス
                    </h3>
                    <p className="text-white/60 text-sm">9つの項目で人生の充実度を可視化</p>
                </div>

                {/* 期間セレクター */}
                <div className="flex bg-black/40 p-1 rounded-xl overflow-x-auto">
                    {periods.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${period === p.id
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] sm:h-[400px] min-h-[300px] relative outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none *:focus:outline-none" style={{ width: '100%' }}>
                {/* 背景のグロー効果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 rounded-2xl blur-3xl"></div>

                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={displayData}>
                        <defs>
                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <PolarGrid stroke="rgba(255, 255, 255, 0.15)" strokeWidth={1.5} />
                        <PolarAngleAxis
                            dataKey="category"
                            tick={<CustomLabel />}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            stroke="rgba(255, 255, 255, 0.2)"
                            style={{ fontSize: '10px' }}
                            tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
                        />
                        <Radar
                            name="幸福度"
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="url(#radarGradient)"
                            fillOpacity={0.6}
                            strokeWidth={3}
                            dot={<CustomDot />}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Color Legend - 9つの項目を色付きで表示 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10">
                {displayData.map((item) => (
                    <div key={item.category} className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: categoryColors[item.category] }}
                        ></div>
                        <span className="text-xs text-white/70">{item.category}</span>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                    <p className="text-white/60 text-xs mb-1">平均値</p>
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {average}
                    </p>
                </div>
                <div>
                    <p className="text-white/60 text-xs mb-1">最高</p>
                    <p
                        className="text-sm font-medium mb-1"
                        style={{ color: categoryColors[highest.category] }}
                    >
                        {highest.category}
                    </p>
                    <p className="text-lg sm:text-lg font-bold">{highest.value}</p>
                </div>
                <div>
                    <p className="text-white/60 text-xs mb-1">改善点</p>
                    <p
                        className="text-sm font-medium mb-1"
                        style={{ color: categoryColors[lowest.category] }}
                    >
                        {lowest.category}
                    </p>
                    <p className="text-lg sm:text-lg font-bold">{lowest.value}</p>
                </div>
            </div>
        </motion.div>
    )
}
