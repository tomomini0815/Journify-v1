"use client"

import dynamic from 'next/dynamic'

const DashboardCharts = dynamic(() => import("./DashboardCharts"), { ssr: false })

interface DashboardChartsProps {
    happinessData: { date: string; score: number }[]
    lifeBalance: { category: string; value: number }[]
}

export default function DashboardChartsWrapper(props: DashboardChartsProps) {
    return <DashboardCharts {...props} />
}
