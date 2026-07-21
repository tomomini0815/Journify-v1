"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText, Mic } from "lucide-react";

export type DashboardRecentJournal = {
    id: string;
    type: "text" | "voice";
    displayTitle: string;
    displayBody: string;
    mood: number | null;
    sentiment?: string | null;
    createdAt: string;
};

type RecentJournalTab = "all" | "text" | "voice";

const labels = {
    title: "\u6700\u8fd1\u306e\u8a18\u9332",
    all: "\u3059\u3079\u3066",
    text: "\u30c6\u30ad\u30b9\u30c8",
    voice: "\u97f3\u58f0",
    empty: "\u307e\u3060\u8a18\u9332\u304c\u3042\u308a\u307e\u305b\u3093",
    showAll: "\u3059\u3079\u3066\u8868\u793a",
};

function getMoodEmoji(mood: number | null | undefined, sentiment?: string | null): string {
    if (mood) {
        if (mood <= 5) {
            if (mood === 1) return "\u{1f622}";
            if (mood === 2) return "\u{1f614}";
            if (mood === 3) return "\u{1f610}";
            if (mood === 4) return "\u{1f642}";
            return "\u{1f60a}";
        }

        if (mood <= 2) return "\u{1f622}";
        if (mood <= 4) return "\u{1f614}";
        if (mood <= 6) return "\u{1f610}";
        if (mood <= 8) return "\u{1f642}";
        return "\u{1f60a}";
    }

    if (sentiment) {
        const lower = sentiment.toLowerCase();
        if (lower.includes("positive") || lower.includes("happy")) return "\u{1f60a}";
        if (lower.includes("negative") || lower.includes("sad")) return "\u{1f622}";
        if (lower.includes("neutral")) return "\u{1f610}";
    }

    return "\u2022";
}

function formatJournalDate(value: string) {
    return new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
    }).format(new Date(value));
}

export default function DashboardRecentJournalsWidget({ journals }: { journals: DashboardRecentJournal[] }) {
    const [activeTab, setActiveTab] = useState<RecentJournalTab>("all");

    const tabCounts = {
        all: journals.length,
        text: journals.filter((journal) => journal.type === "text").length,
        voice: journals.filter((journal) => journal.type === "voice").length,
    };

    const tabs: { id: RecentJournalTab; label: string }[] = [
        { id: "all", label: labels.all },
        { id: "text", label: labels.text },
        { id: "voice", label: labels.voice },
    ];

    const filteredJournals = journals
        .filter((journal) => activeTab === "all" || journal.type === activeTab)
        .slice(0, 3);

    return (
        <div className="dashboard-panel p-4 h-full flex flex-col justify-start gap-3">
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="dashboard-section-label mb-1">Journal</p>
                        <h3 className="text-lg font-semibold leading-tight">{labels.title}</h3>
                    </div>
                    <Link
                        href="/journal"
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
            </div>

            <div className="space-y-3">
                {filteredJournals.map((journal) => (
                    <Link
                        href={journal.type === "text" ? `/journal/${journal.id}` : `/voice-journal/${journal.id}`}
                        key={`${journal.type}-${journal.id}`}
                        className="block group"
                    >
                        <div className="p-3 rounded-lg bg-white/[0.045] hover:bg-white/[0.075] transition-colors cursor-pointer border border-white/[0.06] group-hover:border-emerald-500/30">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {journal.type === "text" ? (
                                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                                    ) : (
                                        <Mic className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
                                    )}
                                    <span className="truncate text-xs text-white/45">{formatJournalDate(journal.createdAt)}</span>
                                </div>
                                <span className="text-2xl shrink-0 ml-2">{getMoodEmoji(journal.mood, journal.sentiment)}</span>
                            </div>
                            <p className="pl-6 text-sm leading-relaxed text-white/65 line-clamp-2">{journal.displayBody}</p>
                        </div>
                    </Link>
                ))}
                {filteredJournals.length === 0 && (
                    <p className="text-center text-white/40 text-sm py-2">{labels.empty}</p>
                )}
            </div>
        </div>
    );
}
