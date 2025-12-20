"use client"

import { useState } from "react"
import Link from "next/link"
import { Mic, PenTool } from "lucide-react"
import VoiceJournalRecorder from "./VoiceJournalRecorder"

interface VoiceRecordingSectionProps {
    projects?: Array<{ id: string; title: string }>
}

export default function VoiceRecordingSection({ projects }: VoiceRecordingSectionProps) {
    const [activeTab, setActiveTab] = useState<"journal" | "meeting">("journal")
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
        projects?.[0]?.id
    )

    return (
        <div className="mb-4">
            {/* Section Header with Tab Switcher */}
            <div className="mb-2">

                {/* Tab Switcher */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab("journal")}
                        className={`
                            flex-1 sm:flex-none justify-center
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
                            flex-1 sm:flex-none justify-center
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
                    // Meeting Minutes - New Design
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900/40 via-cyan-900/30 to-teal-800/40 p-8 border border-cyan-500/20">
                        {/* Background glow effect */}
                        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

                        <div className="relative z-10 flex items-center justify-between gap-6">
                            {/* Left side - Text and Dropdown */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-4">議事録を録音して要約</h3>

                                {/* Project Dropdown */}
                                {projects && projects.length > 0 ? (
                                    <div className="max-w-xs">
                                        <label className="block text-white/70 text-xs font-medium mb-2">
                                            プロジェクトを選択
                                        </label>
                                        <select
                                            value={selectedProjectId}
                                            onChange={(e) => setSelectedProjectId(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all hover:bg-white/15"
                                        >
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id} className="bg-gray-900 text-white">
                                                    {project.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <p className="text-white/50 text-sm">
                                        プロジェクトを作成して議事録を開始
                                    </p>
                                )}
                            </div>

                            {/* Right side - Cyan Circular Mic Button */}
                            <Link
                                href={selectedProjectId ? `/projects/${selectedProjectId}?action=new-meeting` : "/projects"}
                                className="group"
                            >
                                <div className="relative">
                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 rounded-full bg-cyan-400 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />

                                    {/* Main button */}
                                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-cyan-500/40 transition-all group-hover:scale-110 group-hover:shadow-cyan-500/60 cursor-pointer">
                                        <Mic className="w-9 h-9 text-white" strokeWidth={2.5} />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
