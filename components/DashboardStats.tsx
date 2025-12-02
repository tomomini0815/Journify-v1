"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: number | string
    trend: string
    delay: number
}

export function StatCard({ icon: Icon, label, value, trend, delay }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:from-white/15 hover:to-white/10 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm text-green-400">{trend}</span>
            </div>
            <div>
                <p className="text-2xl font-bold mb-1">{value}</p>
                <p className="text-sm text-white/60">{label}</p>
            </div>
        </motion.div>
    )
}

interface DashboardStatsProps {
    stats: {
        journalCount: number
        goalCount: number
        streak: number
        happiness: number
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const { BookOpen, Target, TrendingUp, Calendar } = require("lucide-react")

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
                icon={BookOpen}
                label="今月の記録数"
                value={stats.journalCount}
                trend="+3"
                delay={0.1}
            />
            <StatCard
                icon={Target}
                label="進行中の目標"
                value={stats.goalCount}
                trend="→"
                delay={0.2}
            />
            <StatCard
                icon={TrendingUp}
                label="平均幸福度(過去30日)"
                value={stats.happiness}
                trend="+5%"
                delay={0.3}
            />
            <StatCard
                icon={Calendar}
                label="連続日数"
                value={stats.streak}
                trend="+2"
                delay={0.4}
            />
        </div>
    )
}
