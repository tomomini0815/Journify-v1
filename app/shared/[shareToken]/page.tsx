"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, CheckSquare, List, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { isHoliday } from "@/lib/holidays"

type Milestone = {
    id: string
    title: string
    date: string
    completed: boolean
}

type Task = {
    id: string
    text: string
    description?: string
    status: string
    priority: string
    completed: boolean
    color?: string
    createdAt: string
    startDate?: string
    endDate?: string
}

type Project = {
    id: string
    title: string
    description: string
    status: string
    startDate: string
    endDate: string
    milestones: Milestone[]
    tasks: Task[]
    isShared: boolean
    readOnly: boolean
}

export default function SharedProjectPage() {
    const params = useParams()
    const [project, setProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'list' | 'timeline'>('list')

    useEffect(() => {
        const fetchSharedProject = async () => {
            try {
                const res = await fetch(`/api/shared/${params.shareToken}`)

                if (!res.ok) {
                    if (res.status === 404) {
                        setError("このプロジェクトは共有されていないか、削除されました。")
                    } else {
                        setError("プロジェクトの読み込みに失敗しました。")
                    }
                    setIsLoading(false)
                    return
                }

                const data = await res.json()
                setProject(data)
            } catch (error) {
                console.error("Failed to fetch shared project:", error)
                setError("プロジェクトの読み込みに失敗しました。")
            } finally {
                setIsLoading(false)
            }
        }

        fetchSharedProject()
    }, [params.shareToken])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-white text-xl">読み込み中...</div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">プロジェクトが見つかりません</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors text-white font-medium">
                        ホームに戻る
                    </Link>
                </div>
            </div>
        )
    }

    const todoTasks = project.tasks.filter(t => t.status === 'todo')
    const inProgressTasks = project.tasks.filter(t => t.status === 'in-progress' || t.status === 'in_progress')
    const doneTasks = project.tasks.filter(t => t.status === 'done')

    // Timeline calculations
    const startDate = project.startDate ? new Date(project.startDate) : new Date()
    const endDate = project.endDate ? new Date(project.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const dayWidth = 50

    const getDaysBetween = (start: Date, end: Date) => {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 text-white/60 mb-4 px-3 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl">
                        <CheckSquare className="w-4 h-4" />
                        <span className="text-sm">共有プロジェクト（読み取り専用）</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                    <p className="text-white/60">{project.description}</p>
                </div>

                {/* Main Content */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden">
                    {/* Tabs */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'list'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                        : 'text-white/60 hover:bg-white/5'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                <span>リスト</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'timeline'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                        : 'text-white/60 hover:bg-white/5'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>タイムライン</span>
                            </button>
                        </div>
                    </div>

                    {/* List View */}
                    {activeTab === 'list' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Todo Column */}
                                <div className="bg-[#1a1a1a] border-2 border-blue-500/50 rounded-2xl p-6">
                                    <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                                        <span>未着手</span>
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{todoTasks.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {todoTasks.map(task => (
                                            <div key={task.id} className="bg-white/5 border rounded-xl p-4">
                                                <h4 className="font-medium text-white text-sm mb-2">{task.text}</h4>
                                                {task.description && (
                                                    <div className="text-xs text-white/60 prose prose-invert prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: task.description }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {todoTasks.length === 0 && (
                                            <div className="text-center py-8 text-white/20 text-sm">タスクなし</div>
                                        )}
                                    </div>
                                </div>

                                {/* In Progress Column */}
                                <div className="bg-[#1a1a1a] border-2 border-yellow-500/50 rounded-2xl p-6">
                                    <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                                        <span>進行中</span>
                                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">{inProgressTasks.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {inProgressTasks.map(task => (
                                            <div key={task.id} className="bg-white/5 border rounded-xl p-4">
                                                <h4 className="font-medium text-white text-sm mb-2">{task.text}</h4>
                                                {task.description && (
                                                    <div className="text-xs text-white/60 prose prose-invert prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: task.description }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {inProgressTasks.length === 0 && (
                                            <div className="text-center py-8 text-white/20 text-sm">タスクなし</div>
                                        )}
                                    </div>
                                </div>

                                {/* Done Column */}
                                <div className="bg-[#1a1a1a] border-2 border-emerald-500/50 rounded-2xl p-6">
                                    <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                                        <span>完了</span>
                                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">{doneTasks.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {doneTasks.map(task => (
                                            <div key={task.id} className="bg-white/5 border rounded-xl p-4">
                                                <h4 className="font-medium text-white text-sm mb-2">{task.text}</h4>
                                                {task.description && (
                                                    <div className="text-xs text-white/60 prose prose-invert prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: task.description }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {doneTasks.length === 0 && (
                                            <div className="text-center py-8 text-white/20 text-sm">タスクなし</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Milestones */}
                            {project.milestones.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-400" />
                                        マイルストーン
                                    </h3>
                                    <div className="space-y-2">
                                        {project.milestones.map(milestone => (
                                            <div key={milestone.id} className="bg-white/5 border rounded-xl p-4 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-white">{milestone.title}</h4>
                                                    <p className="text-sm text-white/60">{new Date(milestone.date).toLocaleDateString('ja-JP')}</p>
                                                </div>
                                                {milestone.completed && (
                                                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                                                        完了
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline View */}
                    {activeTab === 'timeline' && (
                        <div className="overflow-x-auto">
                            <div className="min-w-max p-6">
                                {/* Timeline Header */}
                                <div className="flex mb-4">
                                    <div className="w-48 flex-shrink-0"></div>
                                    <div className="flex">
                                        {Array.from({ length: totalDays }, (_, i) => {
                                            const date = new Date(startDate)
                                            date.setDate(date.getDate() + i)
                                            const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                            const isHol = isHoliday(date)

                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex-shrink-0 border-r flex flex-col items-center justify-center text-xs ${isHol ? 'bg-red-500/5 border-red-500/30 text-red-300' :
                                                            isWeekend ? 'bg-blue-500/5 border-blue-500/30 text-blue-300' :
                                                                'border-white/5 text-white/60'
                                                        }`}
                                                    style={{ width: `${dayWidth}px` }}
                                                >
                                                    <div>{date.getMonth() + 1}/{date.getDate()}</div>
                                                    <div className="text-[10px]">
                                                        {['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Milestones Row */}
                                {project.milestones.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center mb-2">
                                            <div className="w-48 flex-shrink-0 pr-4">
                                                <h3 className="font-bold text-white flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-purple-400" />
                                                    マイルストーン
                                                </h3>
                                            </div>
                                            <div className="relative flex" style={{ width: `${totalDays * dayWidth}px`, height: '40px' }}>
                                                {project.milestones.map(milestone => {
                                                    const milestoneDate = new Date(milestone.date)
                                                    const offset = getDaysBetween(startDate, milestoneDate)

                                                    if (offset < 0 || offset > totalDays) return null

                                                    return (
                                                        <div
                                                            key={milestone.id}
                                                            className="absolute top-0 flex flex-col items-center"
                                                            style={{ left: `${offset * dayWidth}px` }}
                                                        >
                                                            <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-emerald-500' : 'bg-purple-500'} border-2 border-white`}></div>
                                                            <div className="text-xs text-white/80 mt-1 whitespace-nowrap">{milestone.title}</div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tasks Rows */}
                                <div className="space-y-2">
                                    {project.tasks.filter(t => t.startDate && t.endDate).map(task => {
                                        const taskStart = new Date(task.startDate!)
                                        const taskEnd = new Date(task.endDate!)
                                        const offset = getDaysBetween(startDate, taskStart)
                                        const duration = getDaysBetween(taskStart, taskEnd)

                                        if (offset + duration < 0 || offset > totalDays) return null

                                        return (
                                            <div key={task.id} className="flex items-center">
                                                <div className="w-48 flex-shrink-0 pr-4">
                                                    <div className="text-sm text-white truncate">{task.text}</div>
                                                </div>
                                                <div className="relative flex" style={{ width: `${totalDays * dayWidth}px`, height: '32px' }}>
                                                    <div
                                                        className="absolute top-1 h-6 rounded-lg flex items-center px-2 text-xs text-white"
                                                        style={{
                                                            left: `${Math.max(0, offset) * dayWidth}px`,
                                                            width: `${duration * dayWidth}px`,
                                                            backgroundColor: task.color || '#6366f1'
                                                        }}
                                                    >
                                                        <span className="truncate">{task.text}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
