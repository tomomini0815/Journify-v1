"use client"

import { useState } from "react"
import Link from "next/link"
import { Mic, PenTool } from "lucide-react"
import VoiceJournalRecorder from "./VoiceJournalRecorder"

interface VoiceRecordingSectionProps {
    projectId?: string
    projectTitle?: string
}

export default function VoiceRecordingSection({ projectId, projectTitle }: VoiceRecordingSectionProps) {
    const [activeTab, setActiveTab] = useState<"journal" | "meeting">("journal")

    return (
        <div className="mb-4">
            {/* Section Header with Tab Switcher */}
            <div className="mb-2">

                {/* Tab Switcher */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
                    <button
                        onClick={() => setActiveTab("journal")}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                            ${activeTab === "journal"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }
                        `}
                    >
                        <PenTool className="w-4 h-4" />
                        <span>ジャーナル記録</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("meeting")}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                            ${activeTab === "meeting"
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }
                        `}
                    >
                        <Mic className="w-4 h-4" />
                        <span>議事録</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === "journal" ? (
                    // Voice Journal Recorder
                    <VoiceJournalRecorder compact={true} />
                ) : (
                    // Meeting Minutes Link
                    <Link
                        href={projectId ? `/projects/${projectId}?action=new-meeting` : "/projects"}
                        className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-[1px] transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-cyan-500/10"
                    >
                        <div className="relative flex items-center justify-between overflow-hidden rounded-[23px] bg-[#1a1a1a]/80 backdrop-blur-xl p-6 transition-colors group-hover:bg-[#1a1a1a]/60">
                            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl transition-all group-hover:bg-cyan-600/30" />

                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                                    <Mic className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">議事録を作成</h3>
                                    <p className="text-white/60 text-sm">
                                        {projectId
                                            ? `${projectTitle || "最新のプロジェクト"}の議事録を作成`
                                            : "プロジェクトを作成して議事録を開始"}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium text-white ring-1 ring-white/10 transition-all group-hover:bg-white/20 group-hover:ring-white/20">
                                <span>開始</span>
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    )
}
