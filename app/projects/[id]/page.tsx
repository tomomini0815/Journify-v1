"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, CheckSquare, Plus, ArrowLeft, MoreVertical, Flag, Pencil, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
}

export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showMilestoneModal, setShowMilestoneModal] = useState(false)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [newMilestone, setNewMilestone] = useState({ title: "", date: "" })
    const [newTask, setNewTask] = useState({
        text: "",
        description: "",
        status: "todo",
        priority: "medium",
        startDate: "",
        endDate: "",
        color: "#6366f1"
    })
    const [activeTab, setActiveTab] = useState<'list' | 'timeline'>('list')
    const [editingItem, setEditingItem] = useState<{ type: 'task' | 'milestone', id: string } | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'task' | 'milestone', id: string, title: string } | null>(null)

    useEffect(() => {
        fetchProject()
    }, [])

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setProject(data)
            } else {
                router.push("/projects")
            }
        } catch (error) {
            console.error("Failed to fetch project", error)
        } finally {
            setIsLoading(false)
        }
    }

    const createMilestone = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingItem
                ? `/api/projects/${params.id}/milestones/${editingItem.id}`
                : `/api/projects/${params.id}/milestones`

            const method = editingItem ? "PATCH" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMilestone)
            })

            if (res.ok) {
                await fetchProject()
                setShowMilestoneModal(false)
                setNewMilestone({ title: "", date: "" })
                setEditingItem(null)
            }
        } catch (error) {
            console.error("Failed to save milestone", error)
        }
    }

    const createTask = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("createTask called", { editingItem, newTask })
        try {
            const url = editingItem
                ? `/api/projects/${params.id}/tasks/${editingItem.id}`
                : `/api/projects/${params.id}/tasks`

            const method = editingItem ? "PATCH" : "POST"
            console.log("Fetching", url, method)

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask)
            })

            console.log("Response status:", res.status)

            if (res.ok) {
                await fetchProject()
                setShowTaskModal(false)
                setNewTask({
                    text: "",
                    description: "",
                    status: "todo",
                    priority: "medium",
                    startDate: "",
                    endDate: "",
                    color: "#6366f1"
                })
                setEditingItem(null)
            } else {
                const errorData = await res.json()
                console.error("Task save failed", errorData)
            }
        } catch (error) {
            console.error("Failed to save task", error)
        }
    }



    const handleDeleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/projects/${params.id}/tasks/${taskId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                await fetchProject()
                setDeleteConfirm(null)
            }
        } catch (error) {
            console.error("Failed to delete task", error)
        }
    }

    const handleDeleteMilestone = async (milestoneId: string) => {
        try {
            const res = await fetch(`/api/projects/${params.id}/milestones/${milestoneId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                await fetchProject()
                setDeleteConfirm(null)
            }
        } catch (error) {
            console.error("Failed to delete milestone", error)
        }
    }

    const openEditTaskModal = (task: Task) => {
        setNewTask({
            text: task.text,
            description: task.description || "",
            status: task.status || "todo",
            priority: task.priority || "medium",
            startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "",
            endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : "",
            color: task.color || "#6366f1"
        })
        setEditingItem({ type: 'task', id: task.id })
        setShowTaskModal(true)
    }

    const openEditMilestoneModal = (milestone: Milestone) => {
        setNewMilestone({
            title: milestone.title,
            date: new Date(milestone.date).toISOString().split('T')[0]
        })
        setEditingItem({ type: 'milestone', id: milestone.id })
        setShowMilestoneModal(true)
    }

    if (isLoading || !project) {
        return (
            <DashboardLayout>
                <div className="text-center py-12 text-white/60">読み込み中...</div>
            </DashboardLayout>
        )
    }

    // Calculate timeline range
    const dates = [
        project.startDate ? new Date(project.startDate).getTime() : Date.now(),
        project.endDate ? new Date(project.endDate).getTime() : Date.now(),
        ...project.tasks.flatMap(t => [
            t.startDate ? new Date(t.startDate).getTime() : null,
            t.endDate ? new Date(t.endDate).getTime() : null
        ]).filter((d): d is number => d !== null),
        ...project.milestones.map(m => new Date(m.date).getTime())
    ]

    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...dates))

    // Add padding to dates
    minDate.setDate(minDate.getDate() - 3)
    maxDate.setDate(maxDate.getDate() + 7)

    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    const dayWidth = 50 // px per day

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 mb-6">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        プロジェクト一覧に戻る
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                            <p className="text-white/60">{project.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/projects/${params.id}/edit`}>
                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden flex flex-col flex-1 min-h-0">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a] flex-shrink-0">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            プロジェクト工程表
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setNewMilestone({ title: "", date: "" })
                                    setEditingItem(null)
                                    setShowMilestoneModal(true)
                                }}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center gap-2"
                            >
                                <Flag className="w-4 h-4 text-amber-400" />
                                マイルストーン追加
                            </button>
                            <button
                                onClick={() => {
                                    setNewTask({
                                        text: "",
                                        description: "",
                                        status: "todo",
                                        priority: "medium",
                                        startDate: "",
                                        endDate: "",
                                        color: "#6366f1"
                                    })
                                    setEditingItem(null)
                                    setShowTaskModal(true)
                                }}
                                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                タスク追加
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 overflow-hidden bg-[#1a1a1a]">
                        {/* View Toggle Tabs */}
                        <div className="flex gap-2 p-4 border-b border-white/10 flex-shrink-0">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'list'
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <CheckSquare className="w-4 h-4" />
                                リスト
                            </button>
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'timeline'
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Calendar className="w-4 h-4" />
                                タイムライン
                            </button>
                        </div>

                        {activeTab === 'list' ? (
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Tasks List */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-white/60 mb-2 pl-1">タスク</h3>
                                    {project.tasks.map((task) => (
                                        <div key={task.id}
                                            className="bg-white/5 border rounded-xl p-4 group transition-all hover:bg-white/10"
                                            style={{ borderColor: task.color || 'rgba(255,255,255,0.1)' }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-white">{task.text}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${task.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'}`}>
                                                        {task.completed ? '完了' : '未完了'}
                                                    </span>
                                                    <div className="flex gap-1 transition-opacity">
                                                        <button
                                                            onClick={() => openEditTaskModal(task)}
                                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5 text-white/60" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ type: 'task', id: task.id, title: task.text })}
                                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-xs text-white/40">
                                                {task.startDate && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>開始: {new Date(task.startDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                {task.endDate && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>終了: {new Date(task.endDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {project.tasks.length === 0 && (
                                        <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                            タスクがありません
                                        </div>
                                    )}
                                </div>

                                {/* Milestones List */}
                                <div className="space-y-2 mt-6">
                                    <h3 className="text-sm font-medium text-white/60 mb-2 pl-1">マイルストーン</h3>
                                    {project.milestones.map((milestone) => (
                                        <div key={milestone.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 group">
                                            <div className="w-2 h-2 rotate-45 bg-amber-400" />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-white">{milestone.title}</h4>
                                                <p className="text-xs text-white/40 mt-1">
                                                    {new Date(milestone.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-1 transition-opacity">
                                                <button
                                                    onClick={() => openEditMilestoneModal(milestone)}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-white/60" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ type: 'milestone', id: milestone.id, title: milestone.title })}
                                                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {project.milestones.length === 0 && (
                                        <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                            マイルストーンがありません
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Timeline View */
                            <div className="flex flex-1 overflow-hidden">
                                {/* Left Sidebar: Task List */}
                                <div className="w-64 flex-shrink-0 border-r border-white/10 bg-[#1a1a1a] flex flex-col">
                                    <div className="h-16 border-b border-white/10 flex items-center px-4 font-medium text-white/60 bg-[#252525]">
                                        タスク名
                                    </div>
                                    <div className="flex-1 overflow-y-hidden">
                                        {project.tasks.map((task) => (
                                            <div key={task.id} className="h-12 border-b border-white/5 flex items-center px-4 hover:bg-white/5 transition-colors truncate">
                                                <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${task.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                                <span className="text-sm truncate">{task.text}</span>
                                            </div>
                                        ))}
                                        {/* Milestones in list */}
                                        {project.milestones.map((milestone) => (
                                            <div key={milestone.id} className="h-12 border-b border-white/5 flex items-center px-4 hover:bg-white/5 transition-colors bg-amber-500/5">
                                                <Flag className="w-3 h-3 text-amber-400 mr-2 flex-shrink-0" />
                                                <span className="text-sm truncate text-amber-200">{milestone.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Content: Timeline */}
                                <div className="flex-1 overflow-auto bg-[#151515] relative">
                                    <div className="min-w-full" style={{ width: `${totalDays * dayWidth}px` }}>
                                        {/* Date Header */}
                                        <div className="h-16 border-b border-white/10 bg-[#252525] sticky top-0 z-20">
                                            <div className="flex h-full">
                                                {Array.from({ length: totalDays }).map((_, i) => {
                                                    const date = new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000)
                                                    const isToday = date.toDateString() === new Date().toDateString()
                                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                                    const holiday = isHoliday(date)
                                                    const isFirstOfMonth = date.getDate() === 1
                                                    const prevDate = i > 0 ? new Date(minDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000) : null
                                                    const isMonthChange = prevDate && date.getMonth() !== prevDate.getMonth()

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`flex-shrink-0 border-r flex flex-col items-center justify-center text-xs relative ${isToday ? 'bg-indigo-500/20 border-indigo-500/50' :
                                                                holiday.isHoliday ? 'bg-red-500/10 border-red-500/30' :
                                                                    isMonthChange ? 'border-white/20' : 'border-white/5'
                                                                }`}
                                                            style={{ width: `${dayWidth}px` }}
                                                        >
                                                            {isFirstOfMonth && (
                                                                <div className="absolute -top-1 left-0 right-0 text-center">
                                                                    <span className="text-[10px] font-bold text-white/80 bg-[#252525] px-1 rounded">
                                                                        {date.getMonth() + 1}月
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <span className={`font-medium ${isToday ? 'text-indigo-300' :
                                                                holiday.isHoliday ? 'text-red-300' :
                                                                    'text-white/60'
                                                                }`}>
                                                                {date.getDate()}
                                                            </span>
                                                            <span className={`text-[10px] ${isToday ? 'text-indigo-400' :
                                                                holiday.isHoliday ? 'text-red-400' :
                                                                    isWeekend ? 'text-red-400/60' : 'text-white/30'
                                                                }`}>
                                                                {holiday.isHoliday ? holiday.name?.substring(0, 2) : ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Grid Body */}
                                        <div className="relative">
                                            {/* Vertical Grid Lines and Weekend Highlighting */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {Array.from({ length: totalDays }).map((_, i) => {
                                                    const date = new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000)
                                                    const isToday = date.toDateString() === new Date().toDateString()
                                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                                    const holiday = isHoliday(date)
                                                    const prevDate = i > 0 ? new Date(minDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000) : null
                                                    const isMonthChange = prevDate && date.getMonth() !== prevDate.getMonth()

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`flex-shrink-0 border-r h-full ${isToday ? 'bg-indigo-500/5 border-indigo-500/30' :
                                                                isMonthChange ? 'border-white/10' :
                                                                    isWeekend ? 'bg-white/[0.02] border-white/5' : 'border-white/5'
                                                                }`}
                                                            style={{ width: `${dayWidth}px` }}
                                                        />
                                                    )
                                                })}
                                            </div>

                                            {/* Today Marker Line */}
                                            {(() => {
                                                const today = new Date()
                                                const todayOffset = ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth
                                                if (todayOffset >= 0 && todayOffset <= totalDays * dayWidth) {
                                                    return (
                                                        <div
                                                            className="absolute top-0 bottom-0 w-0.5 bg-indigo-500/50 pointer-events-none z-10"
                                                            style={{ left: `${todayOffset + dayWidth / 2}px` }}
                                                        />
                                                    )
                                                }
                                                return null
                                            })()}

                                            {/* Task Rows */}
                                            {project.tasks.map((task) => {
                                                if (!task.startDate || !task.endDate) return <div key={task.id} className="h-12 border-b border-white/5" />

                                                const taskStart = new Date(task.startDate)
                                                const taskEnd = new Date(task.endDate)
                                                const left = ((taskStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth
                                                const width = Math.max(((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth, dayWidth)
                                                const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))

                                                return (
                                                    <div key={task.id} className="h-12 border-b border-white/5 relative group">
                                                        <div
                                                            className={`absolute top-2.5 h-7 rounded-lg flex items-center px-3 cursor-pointer transition-all shadow-lg ${task.completed
                                                                ? 'bg-emerald-500/50 border border-emerald-400/60 hover:bg-emerald-500/70'
                                                                : 'bg-indigo-500/50 border border-indigo-400/60 hover:bg-indigo-500/70'
                                                                }`}
                                                            style={{ left: `${left}px`, width: `${width}px` }}
                                                        >
                                                            <span className="text-xs text-white font-medium truncate">{task.text}</span>
                                                            {/* Tooltip on hover */}
                                                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                                <div className="bg-[#1a1a1a] border border-white/20 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-white mb-1">{task.text}</div>
                                                                    <div className="text-xs text-white/60">
                                                                        {taskStart.toLocaleDateString('ja-JP')} - {taskEnd.toLocaleDateString('ja-JP')}
                                                                    </div>
                                                                    <div className="text-xs text-white/40 mt-1">期間: {duration}日</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                            {/* Milestone Rows */}
                                            {project.milestones.map((milestone) => {
                                                const date = new Date(milestone.date)
                                                const left = ((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth

                                                return (
                                                    <div key={milestone.id} className="h-12 border-b border-white/5 relative bg-amber-500/5">
                                                        <div
                                                            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                                                            style={{ left: `${left + (dayWidth / 2)}px` }}
                                                        >
                                                            <div className="w-4 h-4 rotate-45 bg-amber-400 border-2 border-[#1a1a1a] shadow-lg" />
                                                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-amber-400/30 px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl">
                                                                <div className="font-medium text-amber-200">{milestone.title}</div>
                                                                <div className="text-white/60 text-[10px] mt-1">{date.toLocaleDateString('ja-JP')}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Milestone Modal */}
            {showMilestoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold mb-6">
                            {editingItem ? 'マイルストーンを編集' : '新規マイルストーン'}
                        </h2>
                        <form onSubmit={createMilestone} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">タイトル</label>
                                <input
                                    type="text"
                                    required
                                    value={newMilestone.title}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">日付</label>
                                <input
                                    type="date"
                                    required
                                    value={newMilestone.date}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowMilestoneModal(false)}
                                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors"
                                >
                                    {editingItem ? '更新' : '作成'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold mb-6">
                            {editingItem ? 'タスクを編集' : '新規タスク'}
                        </h2>
                        <form onSubmit={createTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">タスク内容</label>
                                <input
                                    type="text"
                                    required
                                    value={newTask.text}
                                    onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">詳細説明</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors min-h-[100px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">ステータス</label>
                                    <select
                                        value={newTask.status}
                                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [&>option]:bg-[#1a1a1a]"
                                    >
                                        <option value="todo">未着手</option>
                                        <option value="in_progress">進行中</option>
                                        <option value="done">完了</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">優先度</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [&>option]:bg-[#1a1a1a]"
                                    >
                                        <option value="high">高</option>
                                        <option value="medium">中</option>
                                        <option value="low">低</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">カラー</label>
                                <div className="flex gap-2">
                                    {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#64748b'].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewTask({ ...newTask, color })}
                                            className={`w-8 h-8 rounded-lg transition-all ${newTask.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">開始日</label>
                                    <input
                                        type="date"
                                        value={newTask.startDate}
                                        onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">終了日</label>
                                    <input
                                        type="date"
                                        value={newTask.endDate}
                                        onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors"
                                >
                                    {editingItem ? '更新' : '作成'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold mb-4">削除の確認</h2>
                        <p className="text-white/60 mb-6">
                            {deleteConfirm.type === 'task' ? 'タスク' : 'マイルストーン'}「{deleteConfirm.title}」を削除してもよろしいですか？
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirm.type === 'task') {
                                        handleDeleteTask(deleteConfirm.id)
                                    } else {
                                        handleDeleteMilestone(deleteConfirm.id)
                                    }
                                }}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
                            >
                                削除
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    )
}
