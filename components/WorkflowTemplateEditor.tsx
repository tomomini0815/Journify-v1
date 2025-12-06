"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import { WorkflowTask } from '@/lib/workflowTemplates'

type WorkflowTemplateEditorProps = {
    isOpen: boolean
    onClose: () => void
    onSave: (template: { name: string; description: string; tasks: WorkflowTask[] }) => Promise<void>
    initialData?: {
        name: string
        description: string
        tasks: WorkflowTask[]
    }
}

const colorOptions = [
    { value: '#3b82f6', label: '青' },
    { value: '#8b5cf6', label: '紫' },
    { value: '#ec4899', label: 'ピンク' },
    { value: '#f97316', label: 'オレンジ' },
    { value: '#22c55e', label: '緑' },
    { value: '#eab308', label: '黄' },
    { value: '#6366f1', label: 'インディゴ' },
    { value: '#f43f5e', label: '赤' }
]

export default function WorkflowTemplateEditor({ isOpen, onClose, onSave, initialData }: WorkflowTemplateEditorProps) {
    const [name, setName] = useState(initialData?.name || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [tasks, setTasks] = useState<WorkflowTask[]>(initialData?.tasks || [])
    const [isSaving, setIsSaving] = useState(false)

    const addTask = () => {
        setTasks([...tasks, {
            title: '',
            duration: 1,
            color: '#6366f1',
            description: ''
        }])
    }

    const updateTask = (index: number, field: keyof WorkflowTask, value: any) => {
        const newTasks = [...tasks]
        newTasks[index] = { ...newTasks[index], [field]: value }
        setTasks(newTasks)
    }

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (!name.trim() || !description.trim() || tasks.length === 0) {
            alert('テンプレート名、説明、タスクをすべて入力してください')
            return
        }

        if (tasks.some(t => !t.title.trim())) {
            alert('すべてのタスクにタイトルを入力してください')
            return
        }

        setIsSaving(true)
        try {
            await onSave({ name, description, tasks })
            onClose()
        } catch (error) {
            console.error('Failed to save template:', error)
            alert('テンプレートの保存に失敗しました')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-3xl bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-white">
                                {initialData ? 'テンプレートを編集' : '新しいテンプレートを作成'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Template Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        テンプレート名
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="例: Webサイト制作"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        説明
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
                                        placeholder="このテンプレートの説明を入力してください"
                                    />
                                </div>
                            </div>

                            {/* Tasks */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-white/80">
                                        タスク ({tasks.length})
                                    </label>
                                    <button
                                        onClick={addTask}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm text-white transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        タスクを追加
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {tasks.map((task, index) => (
                                        <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <GripVertical className="w-5 h-5 text-white/40 mt-2 flex-shrink-0" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            value={task.title}
                                                            onChange={(e) => updateTask(index, 'title', e.target.value)}
                                                            className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                                                            placeholder="タスク名"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={task.duration}
                                                            onChange={(e) => updateTask(index, 'duration', parseInt(e.target.value) || 1)}
                                                            className="w-20 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                                                            placeholder="日数"
                                                        />
                                                        <select
                                                            value={task.color}
                                                            onChange={(e) => updateTask(index, 'color', e.target.value)}
                                                            className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                                                        >
                                                            {colorOptions.map(opt => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <textarea
                                                        value={task.description || ''}
                                                        onChange={(e) => updateTask(index, 'description', e.target.value)}
                                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 h-16 resize-none"
                                                        placeholder="タスクの説明（オプション）"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeTask(index)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {tasks.length === 0 && (
                                        <div className="text-center py-8 text-white/40 text-sm">
                                            タスクを追加してください
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white transition-colors disabled:opacity-50"
                            >
                                {isSaving ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
