"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function EditProjectPage() {
    const router = useRouter()
    const params = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "active",
        startDate: "",
        endDate: ""
    })

    useEffect(() => {
        fetchProject()
    }, [])

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setFormData({
                    title: data.title,
                    description: data.description || "",
                    status: data.status,
                    startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
                    endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : ""
                })
            } else {
                router.push("/projects")
            }
        } catch (error) {
            console.error("Failed to fetch project", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const res = await fetch(`/api/projects/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push(`/projects/${params.id}`)
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to update project", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("本当にこのプロジェクトを削除しますか？\nこの操作は取り消せません。")) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/projects/${params.id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                router.push("/projects")
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete project", error)
        } finally {
            setIsDeleting(false)
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
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link href={`/projects/${params.id}`} className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        プロジェクト詳細に戻る
                    </Link>
                    <h1 className="text-[28px] font-bold text-white">プロジェクト設定</h1>
                    <p className="text-white/60 mt-1">プロジェクトの情報を編集または削除します</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Edit Form */}
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">プロジェクト名</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">説明</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">開始日</label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2">終了日</label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">ステータス</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                >
                                    <option value="active">進行中</option>
                                    <option value="completed">完了</option>
                                    <option value="archived">アーカイブ</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-8"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? "保存中..." : "変更を保存"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5" />
                            危険な操作
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">プロジェクトを削除</p>
                                <p className="text-sm text-white/40 mt-1">
                                    このプロジェクトと関連するすべてのタスク・マイルストーンが削除されます。
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isDeleting ? "削除中..." : "プロジェクトを削除"}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
