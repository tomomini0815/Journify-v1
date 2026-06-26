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
                <div className="flex justify-end gap-4 mb-8">
                    <div className="flex gap-3 self-end md:self-auto">
                        <button
                            onClick={() => setIsAIModalOpen(true)}
                            className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 font-medium text-emerald-300 transition-all hover:bg-white/20 whitespace-nowrap"
                        >
                            <span className="text-lg">✨</span>
                            AIで作成
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 font-medium transition-all hover:from-emerald-600 hover:to-cyan-600 whitespace-nowrap"
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
                                    <div className="p-3 bg-emerald-400/10 border border-emerald-400/15 rounded-xl group-hover:bg-emerald-400/15 transition-colors">
                                        <Briefcase className="w-6 h-6 text-emerald-300" />
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

                                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-300 transition-colors">{project.title}</h3>
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400/45 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">説明</label>
                                    <textarea
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400/45 transition-colors resize-none"
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
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400/45 transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-2">終了日</label>
                                        <input
                                            type="date"
                                            value={newProject.endDate}
                                            onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400/45 transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="h-10 px-4 text-white/60 transition-colors hover:text-white"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        className="h-10 rounded-xl bg-emerald-500 px-4 font-medium transition-colors hover:bg-emerald-400"
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
