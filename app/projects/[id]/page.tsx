"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, CheckSquare, Plus, ArrowLeft, MoreVertical, Flag } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

type Milestone = {
    id: string
    title: string
    date: string
    completed: boolean
}

type Task = {
    id: string
    text: string
    completed: boolean
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
    const [newTask, setNewTask] = useState({ text: "", startDate: "", endDate: "" })

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
            const res = await fetch(`/api/projects/${params.id}/milestones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMilestone)
            })
            if (res.ok) {
                await fetchProject()
                setShowMilestoneModal(false)
                setNewMilestone({ title: "", date: "" })
            }
        } catch (error) {
            console.error("Failed to create milestone", error)
        }
    }

    const createTask = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`/api/projects/${params.id}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask)
            })
            if (res.ok) {
                await fetchProject()
                setShowTaskModal(false)
                setNewTask({ text: "", startDate: "", endDate: "" })
            }
        } catch (error) {
            console.error("Failed to create task", error)
        }
    }

    if (isLoading || !project) {
        return (
            <DashboardLayout>
                <div className="text-center py-12 text-white/60">読み込み中...</div>
            </DashboardLayout>
        )
    }

    // Calculate timeline duration
    const start = project.startDate ? new Date(project.startDate) : new Date()
    const end = project.endDate ? new Date(project.endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
    const totalDuration = end.getTime() - start.getTime()

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
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
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gantt Chart / Timeline */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 overflow-hidden">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        タイムライン & マイルストーン
                    </h2>

                    <div className="relative h-48 mt-8 mb-4 overflow-x-auto">
                        {/* Timeline Bar */}
                        <div className="absolute top-8 left-0 right-0 h-1 bg-white/10 rounded-full" />

                        {/* Start Date */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                            <span className="text-xs text-white/60 whitespace-nowrap">{start.toLocaleDateString()}</span>
                        </div>

                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tasks */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                                    タスク
                                </h2>
                                <button
                                    onClick={() => setShowTaskModal(true)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {project.tasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                                            }`}>
                                            {task.completed && <CheckSquare className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={task.completed ? 'text-white/40 line-through' : 'text-white'}>
                                            {task.text}
                                        </span>
                                    </div>
                                ))}
                                {project.tasks.length === 0 && (
                                    <p className="text-center text-white/40 py-8">タスクがまだありません</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Milestones List */}
                    <div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Flag className="w-5 h-5 text-amber-400" />
                                    マイルストーン
                                </h2>
                                <button
                                    onClick={() => setShowMilestoneModal(true)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {project.milestones.map((milestone) => (
                                    <div key={milestone.id} className="flex items-center gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-emerald-500' : 'bg-white/20'}`} />
                                            <div className="w-px h-8 bg-white/10 last:hidden" />
                                        </div>
                                        <div className="pb-4">
                                            <p className="font-medium">{milestone.title}</p>
                                            <p className="text-xs text-white/60">{new Date(milestone.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {project.milestones.length === 0 && (
                                    <p className="text-center text-white/40 py-8">マイルストーンがありません</p>
                                )}
                            </div>
                        </div>
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
                        <h2 className="text-xl font-bold mb-6">新規マイルストーン</h2>
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
                                    作成
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
                        <h2 className="text-xl font-bold mb-6">新規タスク</h2>
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
                                    作成
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    )
}
