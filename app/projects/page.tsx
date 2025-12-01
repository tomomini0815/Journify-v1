"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Briefcase, Calendar, Clock, ArrowRight, CheckSquare } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import Link from "next/link"

type Project = {
    id: string
    title: string
    description: string
    status: string
    startDate: string
    endDate: string
    _count: {
        tasks: number
    }
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: ""
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects")
            if (res.ok) {
                const data = await res.json()
                setProjects(data)
            }
        } catch (error) {
            console.error("Failed to fetch projects", error)
        } finally {
            setIsLoading(false)
        }
    }

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
                setProjects([project, ...projects])
                setIsModalOpen(false)
                setNewProject({ title: "", description: "", startDate: "", endDate: "" })
            }
        } catch (error) {
            console.error("Failed to create project", error)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="text-center py-12 text-white/60">読み込み中...</div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">プロジェクト</h1>
                        <p className="text-white/60">大きな目標を管理可能なプロジェクトに分割しましょう。</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-medium transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        新規プロジェクト
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all cursor-pointer h-full flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                                        <Briefcase className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                                        project.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                                            'bg-white/10 text-white/60'
                                        }`}>
                                        {project.status === 'active' ? '進行中' :
                                            project.status === 'completed' ? '完了' : 'アーカイブ'}
                                    </span>
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
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                プロジェクトを作成
                            </button>
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
            </div>
        </DashboardLayout>
    )
}
