"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import WorkflowTemplateEditor from '@/components/WorkflowTemplateEditor'
import { WorkflowTemplate, WorkflowTask } from '@/lib/workflowTemplates'

export default function WorkflowTemplatesPage() {
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null)

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/workflow-templates')
            if (res.ok) {
                const data = await res.json()
                setTemplates(data)
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingTemplate(null)
        setIsEditorOpen(true)
    }

    const handleEdit = (template: WorkflowTemplate) => {
        setEditingTemplate(template)
        setIsEditorOpen(true)
    }

    const handleSave = async (data: { name: string; description: string; tasks: WorkflowTask[] }) => {
        if (editingTemplate) {
            // Update existing
            const res = await fetch(`/api/workflow-templates/${editingTemplate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to update template')
        } else {
            // Create new
            const res = await fetch('/api/workflow-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to create template')
        }
        await fetchTemplates()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('このテンプレートを削除してもよろしいですか?')) return

        try {
            const res = await fetch(`/api/workflow-templates/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                await fetchTemplates()
            }
        } catch (error) {
            console.error('Failed to delete template:', error)
            alert('テンプレートの削除に失敗しました')
        }
    }

    const getTotalDuration = (tasks: WorkflowTask[]) => {
        return tasks.reduce((sum, task) => sum + task.duration, 0)
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">ワークフローテンプレート</h1>
                        <p className="text-white/60">カスタムテンプレートを作成・管理</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        新規作成
                    </button>
                </div>

                {/* Templates Grid */}
                {isLoading ? (
                    <div className="text-center py-12 text-white/40">読み込み中...</div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 mb-4">カスタムテンプレートがまだありません</p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            最初のテンプレートを作成
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
                                        <p className="text-sm text-white/60">{template.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <Calendar className="w-4 h-4" />
                                        <span>{template.tasks.length}タスク</span>
                                        <span>•</span>
                                        <span>{getTotalDuration(template.tasks)}日</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(template)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        編集
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Editor Modal */}
                <WorkflowTemplateEditor
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSave}
                    initialData={editingTemplate ? {
                        name: editingTemplate.name,
                        description: editingTemplate.description,
                        tasks: editingTemplate.tasks
                    } : undefined}
                />
            </div>
        </DashboardLayout>
    )
}
