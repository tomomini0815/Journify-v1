"use client"

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { motion } from "framer-motion"

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

// 幸福バランスのデータ - 9つのライフバランス項目
const rawData = [
    { category: "身体的健康", value: 75 },
    { category: "精神的健康", value: 82 },
    { category: "人間関係", value: 88 },
    { category: "仕事・キャリア", value: 70 },
    { category: "経済的安定", value: 65 },
    { category: "学習・成長", value: 78 },
    { category: "趣味・余暇", value: 85 },
    { category: "社会貢献", value: 60 },
    { category: "自己実現", value: 72 },
]

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
            filter="drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))"
        />
    )
}

// カスタムラベル - 項目名を色分け
const CustomLabel = (props: any) => {
    const { x, y, payload, index } = props
    const color = categoryColors[payload.value]

    // ラベルの位置を調整
    const angle = (index / rawData.length) * 360
    const radians = (angle * Math.PI) / 180
    const radius = 15
    const labelX = x + Math.cos(radians) * radius
    const labelY = y + Math.sin(radians) * radius

    return (
        <text
            x={labelX}
            y={labelY}
            fill={color}
            fontSize={11}
            fontWeight={600}
            textAnchor={angle > 90 && angle < 270 ? 'end' : 'start'}
        >
            {payload.value}
        </text>
    )
}

export function LifeBalanceChart() {
    // 平均値を計算
    const average = Math.round(rawData.reduce((sum, item) => sum + item.value, 0) / rawData.length)

    // 最高・最低を見つける
    const highest = rawData.reduce((max, item) => item.value > max.value ? item : max, rawData[0])
    const lowest = rawData.reduce((min, item) => item.value < min.value ? item : min, rawData[0])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-1 text-white">
                    幸福度バランス
                </h3>
                <p className="text-white/60 text-sm">9つの項目で人生の充実度を可視化</p>
            </div>

            <div className="h-[400px] relative">
                {/* 背景のグロー効果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl blur-3xl"></div>

                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={rawData}>
                        <defs>
                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
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
                            stroke="#a855f7"
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
            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10">
                {rawData.map((item) => (
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
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
                    <p className="text-lg font-bold">{highest.value}</p>
                </div>
                <div>
                    <p className="text-white/60 text-xs mb-1">改善点</p>
                    <p
                        className="text-sm font-medium mb-1"
                        style={{ color: categoryColors[lowest.category] }}
                    >
                        {lowest.category}
                    </p>
                    <p className="text-lg font-bold">{lowest.value}</p>
                </div>
            </div>
        </motion.div>
    )
}
