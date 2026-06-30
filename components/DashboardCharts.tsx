"use client"

import { HappinessChart } from "./HappinessChart"
import { LifeBalanceChart } from "./LifeBalanceChart"

interface DashboardChartsProps {
    happinessData: { date: string; score: number }[]
    lifeBalance: { category: string; value: number }[]
}

export default function DashboardCharts({ happinessData, lifeBalance }: DashboardChartsProps) {
    return (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Life Balance Radar Chart */}
            <LifeBalanceChart data={lifeBalance} />

            {/* Happiness Chart */}
            <HappinessChart data={happinessData} />
        </div>
    )
}
