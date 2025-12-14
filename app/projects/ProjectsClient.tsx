"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Briefcase, Calendar, Clock, ArrowRight, CheckSquare, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AIStrategyModal } from "@/components/AIStrategyModal"

type Project = {
    id: string
    title: string
    description: string | null
    status: string
    startDate: string | null
    endDate: string | null
    _count: {
        tasks: number
    }
}

interface ProjectsClientProps {
    initialProjects: Project[]
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>(initialProjects)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAIModalOpen, setIsAIModalOpen] = useState(false)
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: ""
    })

    // Update state when initialProjects changes (e.g. after router.refresh())
    useEffect(() => {
        setProjects(initialProjects)
    }, [initialProjects])

    const createProject = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProject)
            })
            if (res.ok) {
                const project = await res.json()
                // Optimistic update
                setProjects([project, ...projects])
                setIsModalOpen(false)
                setNewProject({ title: "", description: "", startDate: "", endDate: "" })
                // Refresh server data
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to create project", error)
        }
    }

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.preventDefault() // Prevent navigation
        e.stopPropagation()

        if (!confirm("本当にこのプロジェクトを削除しますか？\n含まれるすべてのタスクとマイルストーンも削除されます。")) {
            return
        }

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setProjects(projects.filter(p => p.id !== projectId))
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete project", error)
            alert("削除に失敗しました")
        }
    }

    const handleAICreate = async (plan: any) => {
        try {
            const today = new Date()
            const endDate = new Date()
            endDate.setMonth(endDate.getMonth() + 3) // Default 3 months

            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: plan.title,
                    description: plan.description,
                    startDate: today.toISOString(),
                    endDate: endDate.toISOString(),
                    milestones: plan.milestones
                })
            })

            if (res.ok) {
                const project = await res.json()
                setProjects([project, ...projects])
                setIsAIModalOpen(false)
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to create AI project", error)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-[28px] font-bold text-white mb-2">プロジェクト</h1>
                        <p className="text-white/60">大きな目標を管理可能なプロジェクトに分割しましょう。</p>
                    </div>
                    <div className="flex gap-3 self-end md:self-auto">
                        <button
                            onClick={() => setIsAIModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-medium transition-all text-indigo-300 whitespace-nowrap"
                        >
                            <span className="text-lg">✨</span>
                            AIで作成
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl font-medium transition-all whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            新規作成
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all cursor-pointer h-full flex flex-col relative"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                                        <Briefcase className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                                            project.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-white/10 text-white/60'
                                            }`}>
                                            {project.status === 'active' ? '進行中' :
                                                project.status === 'completed' ? '完了' : 'アーカイブ'}
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteProject(e, project.id)}
                                            className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="削除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-300 transition-colors">{project.title}</h3>
                                <p className="text-white/60 text-sm mb-6 line-clamp-2 flex-grow">{project.description}</p>

                                <div className="flex items-center justify-between text-sm text-white/40 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <CheckSquare className="w-4 h-4" />
                                            <span>{project._count?.tasks || 0} タスク</span>
                                        </div>
                                        {project.endDate && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{new Date(project.endDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                            <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">プロジェクトがありません</h3>
                            <p className="text-white/60 mb-6">新しいプロジェクトを作成して始めましょう</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setIsAIModalOpen(true)}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 text-indigo-300 flex items-center gap-2"
                                >
                                    <span>✨</span> AIで作成
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    手動で作成
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Project Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <h2 className="text-xl font-bold mb-6">新規プロジェクト作成</h2>
                            <form onSubmit={createProject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">タイトル</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">説明</label>
                                    <textarea
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-2">開始日</label>
                                        <input
                                            type="date"
                                            value={newProject.startDate}
                                            onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-2">終了日</label>
                                        <input
                                            type="date"
                                            value={newProject.endDate}
                                            onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
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

                <AIStrategyModal
                    isOpen={isAIModalOpen}
                    onClose={() => setIsAIModalOpen(false)}
                    onCreateProject={handleAICreate}
                />
            </div>
        </DashboardLayout>
    )
}
