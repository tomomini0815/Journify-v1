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
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all"
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                {/* Left column: Icon and Value and Trend (Mobile) */}
                <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex-shrink-0">
                        <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">{value}</p>
                        <span className="sm:hidden text-xs text-emerald-400 font-medium">{trend}</span>
                    </div>
                </div>

                {/* Right column: Trend (Desktop) and Label */}
                <div className="text-left sm:text-right w-full sm:w-auto pl-[3.25rem] sm:pl-0">
                    <span className="hidden sm:block text-xs text-emerald-400 font-medium mb-1">{trend}</span>
                    <p className="text-xs text-white/60 whitespace-nowrap">{label}</p>
                </div>
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
                label="平均幸福度"
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
