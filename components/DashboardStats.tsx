"use client"

import { motion } from "framer-motion"
import { BookOpen, Calendar, LucideIcon, Target, TrendingUp } from "lucide-react"

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
            className="dashboard-panel-subtle p-3 transition-colors hover:bg-white/[0.07]"
        >
            <div className="flex h-full flex-col justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center sm:h-8 sm:w-8 sm:rounded-lg sm:border sm:border-emerald-400/20 sm:bg-emerald-400/10">
                        <Icon className="w-3.5 h-3.5 text-emerald-400 sm:h-4 sm:w-4" />
                    </div>
                    <p className="min-w-0 text-[10px] font-normal leading-tight text-white/70 sm:text-sm">{label}</p>
                </div>

                <div className="flex items-end justify-between gap-2">
                    <p className="text-2xl font-semibold leading-none tracking-normal text-white sm:text-3xl">{value}</p>
                    <span className="shrink-0 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-emerald-300 sm:px-2 sm:text-xs">{trend}</span>
                </div>
            </div>
        </motion.div>
    )
}

interface DashboardStatsProps {
    stats: {
        journalCount: number
        journalTrend?: string
        goalCount: number
        goalTrend?: string
        streak: number
        streakTrend?: string
        happiness: number
        happinessTrend?: string
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <StatCard
                icon={BookOpen}
                label="統計記録数"
                value={stats.journalCount}
                trend={stats.journalTrend || "+0"}
                delay={0.1}
            />
            <StatCard
                icon={Target}
                label="進行中の目標"
                value={stats.goalCount}
                trend={stats.goalTrend || "→"}
                delay={0.2}
            />
            <StatCard
                icon={TrendingUp}
                label="平均幸福度"
                value={stats.happiness}
                trend={stats.happinessTrend || "+0%"}
                delay={0.3}
            />
            <StatCard
                icon={Calendar}
                label="連続日数"
                value={stats.streak}
                trend={stats.streakTrend || "+0"}
                delay={0.4}
            />
        </div>
    )
}
