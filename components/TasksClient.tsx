"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Calendar, List, CalendarDays, ArrowRight, ArrowLeft, Pencil, X, ChevronDown } from "lucide-react"
import { TaskCalendar } from "@/components/TaskCalendar"

type Task = {
    id: string
    text: string
    completed: boolean
    status: 'todo' | 'in-progress' | 'done'
    createdAt: Date
    scheduledDate?: Date
}

interface SerializedTask {
    id: string
    text: string
    completed: boolean
    status?: 'todo' | 'in-progress' | 'done'
    createdAt: string
    scheduledDate?: string | null
}

interface TasksClientProps {
    initialTasks: SerializedTask[]
}

export function TasksClient({ initialTasks }: TasksClientProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks.map(t => ({
        ...t,
        status: t.status || (t.completed ? 'done' : 'todo'),
        createdAt: new Date(t.createdAt),
        scheduledDate: t.scheduledDate ? new Date(t.scheduledDate) : undefined
    })))
    const [newTask, setNewTask] = useState("")
    const [scheduledDate, setScheduledDate] = useState("")
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState<'kanban' | 'calendar'>('kanban')
    const [mobileKanbanTab, setMobileKanbanTab] = useState<'todo' | 'in-progress' | 'done'>('todo')
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) return

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: newTask,
                    scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null,
                    status: 'todo'
                }),
            })

            if (res.ok) {
                const task = await res.json()
                setTasks([{
                    ...task,
                    status: task.status || 'todo',
                    createdAt: new Date(task.createdAt),
                    scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : undefined
                }, ...tasks])
                setNewTask("")
                setScheduledDate("")
                setError("")
            } else {
                throw new Error("タスクの追加に失敗しました")
            }
        } catch (error) {
            console.error("Failed to add task", error)
            setError("タスクの追加に失敗しました。サーバーを再起動してみてください。")
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
        // Optimistic update
        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'done' } : t
        ))

        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, completed: newStatus === 'done' }),
            })
        } catch (error) {
            console.error("Failed to update task status", error)
            // Revert on error
            setTasks(tasks)
        }
    }

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        )
        setTasks(updatedTasks)

        try {
            const body: any = {}
            if (updates.text !== undefined) body.text = updates.text
            if (updates.status !== undefined) {
                body.status = updates.status
                body.completed = updates.status === 'done'
            }
            if (updates.scheduledDate !== undefined) {
                body.scheduledDate = updates.scheduledDate ? updates.scheduledDate.toISOString() : null
            }

            await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
        } catch (error) {
            console.error("Failed to update task", error)
            // Revert on error
            setTasks(tasks)
        }
    }

    const openEditModal = (task: Task) => {
        setEditingTask(task)
        setShowEditModal(true)
    }

    const closeEditModal = () => {
        setEditingTask(null)
        setShowEditModal(false)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTask) return

        await updateTask(editingTask.id, {
            text: editingTask.text,
            scheduledDate: editingTask.scheduledDate,
            status: editingTask.status
        })
        closeEditModal()
    }

    const deleteTask = async (id: string) => {
        if (!confirm("本当にこのタスクを削除しますか?")) return

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== id))
            }
        } catch (error) {
            console.error("Failed to delete task", error)
        }
    }

    const handleDateSelect = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        setScheduledDate(`${year}-${month}-${day}T${hours}:${minutes}`)
        setActiveTab('kanban')

        setTimeout(() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement
            input?.focus()
        }, 100)
    }

    const exportToCalendar = () => {
        // Create .ics file content
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Journify//Daily Tasks//EN',
            'CALSCALE:GREGORIAN',
            ...tasks.map(task => {
                const dtstart = task.scheduledDate
                    ? task.scheduledDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                    : new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                const summary = task.text.replace(/[\n\r]/g, ' ')
                const status = task.status === 'done' ? 'COMPLETED' : task.status === 'in-progress' ? 'IN-PROCESS' : 'NEEDS-ACTION'

                return [
                    'BEGIN:VEVENT',
                    `UID:${task.id}@journify.app`,
                    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                    `DTSTART:${dtstart}`,
                    `SUMMARY:${summary}`,
                    `STATUS:${status}`,
                    `DESCRIPTION:Status: ${task.status}`,
                    'END:VEVENT'
                ].join('\r\n')
            }),
            'END:VCALENDAR'
        ].join('\r\n')

        // Create and download file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `journify-tasks-${new Date().toISOString().split('T')[0]}.ics`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const importFromCalendar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const text = await file.text()
        const lines = text.split(/\r?\n/)

        let currentEvent: any = null
        const importedTasks: any[] = []

        for (const line of lines) {
            if (line === 'BEGIN:VEVENT') {
                currentEvent = {}
            } else if (line === 'END:VEVENT' && currentEvent) {
                if (currentEvent.summary) {
                    importedTasks.push({
                        text: currentEvent.summary,
                        scheduledDate: currentEvent.dtstart ? new Date(currentEvent.dtstart) : null,
                        status: 'todo'
                    })
                }
                currentEvent = null
            } else if (currentEvent && line.includes(':')) {
                const [key, ...valueParts] = line.split(':')
                const value = valueParts.join(':')

                if (key === 'SUMMARY') {
                    currentEvent.summary = value
                } else if (key.startsWith('DTSTART')) {
                    // Parse YYYYMMDDTHHMMSSZ format
                    const dateStr = value.replace(/[TZ]/g, '')
                    const year = parseInt(dateStr.substring(0, 4))
                    const month = parseInt(dateStr.substring(4, 6)) - 1
                    const day = parseInt(dateStr.substring(6, 8))
                    const hour = parseInt(dateStr.substring(8, 10) || '0')
                    const minute = parseInt(dateStr.substring(10, 12) || '0')
                    currentEvent.dtstart = new Date(Date.UTC(year, month, day, hour, minute))
                }
            }
        }

        // Import tasks to backend
        for (const taskData of importedTasks) {
            try {
                const res = await fetch("/api/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(taskData),
                })
                if (res.ok) {
                    const task = await res.json()
                    setTasks(prev => [{
                        ...task,
                        status: task.status || 'todo',
                        createdAt: new Date(task.createdAt),
                        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : undefined
                    }, ...prev])
                }
            } catch (error) {
                console.error("Failed to import task", error)
            }
        }

        // Reset file input
        event.target.value = ''
    }

    const generateCalendarLink = (task: Task, provider: 'google' | 'outlook' | 'yahoo') => {
        const title = encodeURIComponent(task.text)
        const startDate = task.scheduledDate || new Date()
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later

        const formatDateForGoogle = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        }

        const formatDateForOutlook = (date: Date) => {
            return date.toISOString()
        }

        switch (provider) {
            case 'google':
                return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`
            case 'outlook':
                return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${formatDateForOutlook(startDate)}&enddt=${formatDateForOutlook(endDate)}`
            case 'yahoo':
                const yahooStart = formatDateForGoogle(startDate)
                const duration = '0100' // 1 hour in HHMM format
                return `https://calendar.yahoo.com/?v=60&title=${title}&st=${yahooStart}&dur=${duration}`
            default:
                return ''
        }
    }

    const todoTasks = tasks.filter(t => t.status === 'todo')
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
    const doneTasks = tasks.filter(t => t.status === 'done')

    const completedCount = tasks.filter(t => t.completed).length
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-8 flex-shrink-0">
                <h1 className="text-3xl font-bold text-white mb-2">日々のタスク</h1>
                <p className="text-white/60">小さな達成の積み重ねが、大きな成長につながります。</p>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 flex-shrink-0"
                >
                    {error}
                </motion.div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('kanban')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'kanban'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <List className="w-4 h-4" />
                    カンバン
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'calendar'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <CalendarDays className="w-4 h-4" />
                    カレンダー
                </button>
            </div>

            {activeTab === 'kanban' ? (
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden flex-shrink-0"
                    >
                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">今日の進捗</h2>
                                <p className="text-white/60 text-sm">{tasks.length}個中 {completedCount}個のタスクを完了</p>
                            </div>
                            <div className="text-3xl font-bold text-white">{Math.round(progress)}%</div>
                        </div>

                        <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>

                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    </motion.div>

                    {/* Add Task Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={addTask}
                        className="mb-8 relative flex gap-4 flex-shrink-0"
                    >
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="新しいタスクを追加..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                        <div className="relative w-48 hidden md:block">
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full h-full bg-white/5 border border-white/10 rounded-2xl px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newTask.trim()}
                            className="aspect-square bg-white/10 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-white/10 w-[58px]"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </motion.form>

                    {/* Kanban Board - Scrollable Container */}
                    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
                        <div className="h-full min-w-[900px] grid grid-cols-3 gap-4 pb-4">
                            <KanbanColumn
                                title="未着手"
                                status="todo"
                                tasks={todoTasks}
                                onDelete={deleteTask}
                                onStatusChange={updateTaskStatus}
                                onEdit={openEditModal}
                                generateCalendarLink={generateCalendarLink}
                            />
                            <KanbanColumn
                                title="進行中"
                                status="in-progress"
                                tasks={inProgressTasks}
                                onDelete={deleteTask}
                                onStatusChange={updateTaskStatus}
                                onEdit={openEditModal}
                                generateCalendarLink={generateCalendarLink}
                            />
                            <KanbanColumn
                                title="完了"
                                status="done"
                                tasks={doneTasks}
                                onDelete={deleteTask}
                                onStatusChange={updateTaskStatus}
                                onEdit={openEditModal}
                                generateCalendarLink={generateCalendarLink}
                            />
                        </div>
                    </div>

                    {/* Edit Task Modal */}
                    {showEditModal && editingTask && (
                        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md relative"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white">タスクを編集</h2>
                                        <button
                                            onClick={closeEditModal}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-white/60" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleEditSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">
                                                タスク内容
                                            </label>
                                            <input
                                                type="text"
                                                value={editingTask.text}
                                                onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">
                                                予定日時
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={editingTask.scheduledDate ? new Date(editingTask.scheduledDate.getTime() - editingTask.scheduledDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => setEditingTask({
                                                    ...editingTask,
                                                    scheduledDate: e.target.value ? new Date(e.target.value) : undefined
                                                })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors [color-scheme:dark]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">
                                                ステータス
                                            </label>
                                            <select
                                                value={editingTask.status}
                                                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as 'todo' | 'in-progress' | 'done' })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            >
                                                <option value="todo">未着手</option>
                                                <option value="in-progress">進行中</option>
                                                <option value="done">完了</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={closeEditModal}
                                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                                            >
                                                キャンセル
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition-colors"
                                            >
                                                更新
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <TaskCalendar tasks={tasks} onDateSelect={handleDateSelect} />
            )}
        </div>
    )
}

function KanbanColumn({
    title,
    status,
    tasks,
    onDelete,
    onStatusChange,
    onEdit,
    generateCalendarLink,
    isMobile = false
}: {
    title: string
    status: 'todo' | 'in-progress' | 'done'
    tasks: Task[]
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: 'todo' | 'in-progress' | 'done') => void
    onEdit: (task: Task) => void
    generateCalendarLink: (task: Task, provider: 'google' | 'outlook' | 'yahoo') => string
    isMobile?: boolean
}) {
    const statusColors = {
        'todo': 'border-blue-500/50',
        'in-progress': 'border-yellow-500/50',
        'done': 'border-emerald-500/50'
    }

    return (
        <div className="flex flex-col h-full">
            <div className={`bg-[#1a1a1a] ${statusColors[status]} border-2 rounded-2xl p-6 h-full flex flex-col`}>
                <div className="mb-4">
                    <h3 className="font-bold text-white text-lg">{title}</h3>
                    <p className="text-white/60 text-sm">{tasks.length}個のタスク</p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onDelete={onDelete}
                                onStatusChange={onStatusChange}
                                onEdit={onEdit}
                                generateCalendarLink={generateCalendarLink}
                                isMobile={isMobile}
                            />
                        ))}
                    </AnimatePresence>

                    {tasks.length === 0 && (
                        <div className="text-center py-12 text-white/40">
                            <p>タスクがありません</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function TaskCard({
    task,
    onDelete,
    onStatusChange,
    onEdit,
    generateCalendarLink,
    isMobile
}: {
    task: Task
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: 'todo' | 'in-progress' | 'done') => void
    onEdit: (task: Task) => void
    generateCalendarLink: (task: Task, provider: 'google' | 'outlook' | 'yahoo') => string
    isMobile?: boolean
}) {
    const [showCalendarMenu, setShowCalendarMenu] = useState(false)
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group p-4 rounded-2xl border transition-all ${task.completed
                ? "bg-white/5 border-white/5"
                : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20"
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <div className={`text-lg transition-all ${task.completed ? "text-white/40 line-through" : "text-white"}`}>
                        {task.text}
                    </div>
                    {task.scheduledDate && (
                        <div className="flex items-center gap-1 text-xs text-emerald-300/80 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{task.scheduledDate.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}

                    {/* Status Change Buttons */}
                    <div className="flex gap-2 mt-3">
                        {task.status !== 'todo' && (
                            <button
                                onClick={() => onStatusChange(task.id, task.status === 'done' ? 'in-progress' : 'todo')}
                                className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors whitespace-nowrap"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                {task.status === 'done' ? '進行中' : '未着手'}
                            </button>
                        )}
                        {task.status !== 'done' && (
                            <button
                                onClick={() => onStatusChange(task.id, task.status === 'todo' ? 'in-progress' : 'done')}
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-xs text-emerald-300 transition-colors whitespace-nowrap"
                            >
                                {task.status === 'todo' ? '進行中' : '完了'}
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 relative">
                    {/* Calendar Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                            className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="カレンダーに追加"
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                        {showCalendarMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden">
                                <a
                                    href={generateCalendarLink(task, 'google')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                                    onClick={() => setShowCalendarMenu(false)}
                                >
                                    Google Calendar
                                </a>
                                <a
                                    href={generateCalendarLink(task, 'outlook')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                                    onClick={() => setShowCalendarMenu(false)}
                                >
                                    Outlook
                                </a>
                                <a
                                    href={generateCalendarLink(task, 'yahoo')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                                    onClick={() => setShowCalendarMenu(false)}
                                >
                                    Yahoo Calendar
                                </a>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => onEdit(task)}
                        className="p-2 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
