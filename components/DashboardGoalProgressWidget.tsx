"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type DashboardGoal = {
    id: string;
    title: string;
    progress: number;
    priority?: string | null;
    timeframe?: string | null;
};

type GoalTab = "short" | "mid" | "long";

const labels = {
    section: "\u76ee\u6a19\u306e\u9032\u6357",
    showAll: "\u3059\u3079\u3066\u8868\u793a",
    short: "\u77ed\u671f",
    mid: "\u4e2d\u671f",
    long: "\u9577\u671f",
    empty: "\u76ee\u6a19\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093",
};

function priorityDotClass(priority?: string | null) {
    switch (priority) {
        case "urgent":
            return "bg-red-500 shadow-red-500/50 animate-pulse";
        case "high":
            return "bg-orange-500 shadow-orange-500/50";
        case "low":
            return "bg-emerald-500 shadow-emerald-500/50";
        case "medium":
        default:
            return "bg-yellow-500 shadow-yellow-500/50";
    }
}

export default function DashboardGoalProgressWidget({ goals }: { goals: DashboardGoal[] }) {
    const [activeTab, setActiveTab] = useState<GoalTab>("short");

    const tabCounts = {
        short: goals.filter((goal) => (goal.timeframe || "short") === "short").length,
        mid: goals.filter((goal) => goal.timeframe === "mid").length,
        long: goals.filter((goal) => goal.timeframe === "long").length,
    };

    const tabs: { id: GoalTab; label: string }[] = [
        { id: "short", label: labels.short },
        { id: "mid", label: labels.mid },
        { id: "long", label: labels.long },
    ];

    const filteredGoals = goals
        .filter((goal) => (goal.timeframe || "short") === activeTab)
        .slice(0, 3);

    return (
        <div className="dashboard-panel p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="dashboard-section-label mb-1">Goals</p>
                    <h3 className="text-lg font-semibold leading-tight">{labels.section}</h3>
                </div>
                <Link
                    href="/goals"
                    prefetch={true}
                    aria-label={labels.showAll}
                    title={labels.showAll}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-emerald-300 transition-colors hover:border-emerald-300/25 hover:bg-emerald-400/10 hover:text-emerald-200"
                >
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="flex bg-black/40 p-1 rounded-xl gap-0.5 overflow-x-auto no-scrollbar mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex min-w-fit items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                            }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${activeTab === tab.id ? "bg-white/15 text-white" : "bg-white/10 text-white/50"}`}>
                            {tabCounts[tab.id]}
                        </span>
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredGoals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${priorityDotClass(goal.priority)}`} />
                                <h4 className="truncate font-medium">{goal.title}</h4>
                            </div>
                            <span className="text-sm text-white/60">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                                style={{ width: `${goal.progress}%` }}
                            />
                        </div>
                    </div>
                ))}
                {filteredGoals.length === 0 && (
                    <p className="text-center text-white/40 text-sm py-2">{labels.empty}</p>
                )}
            </div>
        </div>
    );
}
