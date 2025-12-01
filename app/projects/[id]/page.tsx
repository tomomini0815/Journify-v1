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
    const [activeTab, setActiveTab] = useState<'list' | 'timeline'>('list')

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
            <div className="max-w-[1600px] mx-auto">
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

                {/* Gantt Chart Container */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px]">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            プロジェクト工程表
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowMilestoneModal(true)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center gap-2"
                            >
                                <Flag className="w-4 h-4 text-amber-400" />
                                マイルストーン追加
                            </button>
                            <button
                                onClick={() => setShowTaskModal(true)}
                                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm transition-colors flex items-center gap-2"
                            >
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
