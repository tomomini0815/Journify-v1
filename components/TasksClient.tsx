"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Check, Calendar, CalendarPlus, List, CalendarDays, GripVertical } from "lucide-react"
import { TaskCalendar } from "@/components/TaskCalendar"
import { DndContext, DragEndEvent, useDraggable, useDroppable, closestCenter } from "@dnd-kit/core"

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
    const [activeCalendarMenu, setActiveCalendarMenu] = useState<string | null>(null)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState<'kanban' | 'calendar'>('kanban')
    const [mobileKanbanTab, setMobileKanbanTab] = useState<'todo' | 'in-progress' | 'done'>('todo')

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) return

        const taskId = active.id as string
        const newStatus = over.id as 'todo' | 'in-progress' | 'done'

        updateTaskStatus(taskId, newStatus)
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

    const todoTasks = tasks.filter(t => t.status === 'todo')
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
    const doneTasks = tasks.filter(t => t.status === 'done')

    const completedCount = tasks.filter(t => t.completed).length
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

    return (
        <div className="h-full flex flex-col" onClick={() => setActiveCalendarMenu(null)}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">日々のタスク</h1>
                <p className="text-white/60">小さな達成の積み重ねが、大きな成長につながります。</p>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200"
                >
                    {error}
                </motion.div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
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
                <>
                    {/* Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden"
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
                        className="mb-8 relative flex gap-4"
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

                    {/* Mobile Kanban Tabs */}
                    <div className="md:hidden flex gap-2 mb-4">
                        <button
                            onClick={() => setMobileKanbanTab('todo')}
                            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mobileKanbanTab === 'todo'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                                : 'bg-white/5 text-white/60'
                                }`}
                        >
                            未着手 ({todoTasks.length})
                        </button>
                        <button
                            onClick={() => setMobileKanbanTab('in-progress')}
                            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mobileKanbanTab === 'in-progress'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                                : 'bg-white/5 text-white/60'
                                }`}
                        >
                            進行中 ({inProgressTasks.length})
                        </button>
                        <button
                            onClick={() => setMobileKanbanTab('done')}
                            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mobileKanbanTab === 'done'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                : 'bg-white/5 text-white/60'
                                }`}
                        >
                            完了 ({doneTasks.length})
                        </button>
                    </div>

                    {/* Kanban Board */}
                    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                        {/* Desktop: 3 Columns */}
                        <div className="hidden md:grid md:grid-cols-3 gap-4 flex-1">
                            <KanbanColumn
                                title="未着手"
                                status="todo"
                                tasks={todoTasks}
                                onDelete={deleteTask}
                                onStatusChange={updateTaskStatus}
                                activeCalendarMenu={activeCalendarMenu}
                                setActiveCalendarMenu={setActiveCalendarMenu}
                            />
                            <KanbanColumn
                                title="進行中"
                                status="in-progress"
                                tasks={inProgressTasks}
                                onDelete={deleteTask}
                                onStatusChange={updateTaskStatus}
                                activeCalendarMenu={activeCalendarMenu}
                                setActiveCalendarMenu={setActiveCalendarMenu}
                            />
                            <KanbanColumn
                                title="完了"
                                status="done"
                                tasks={doneTasks}
                                onDelete={deleteTask}
                                onStatusChange={updateTaskStatus}
                                activeCalendarMenu={activeCalendarMenu}
                                setActiveCalendarMenu={setActiveCalendarMenu}
                            />
                        </div>

                        {/* Mobile: Single Column with Tabs */}
                        <div className="md:hidden flex-1">
                            <KanbanColumn
                                title={mobileKanbanTab === 'todo' ? '未着手' : mobileKanbanTab === 'in-progress' ? '進行中' : '完了'}
                                status={mobileKanbanTab}
                                tasks={mobileKanbanTab === 'todo' ? todoTasks : mobileKanbanTab === 'in-progress' ? inProgressTasks : doneTasks}
                                onDelete={deleteTask}
                                onStatusChange={updateTaskStatus}
                                activeCalendarMenu={activeCalendarMenu}
                                setActiveCalendarMenu={setActiveCalendarMenu}
                                isMobile
                            />
                        </div>
                    </DndContext>
                </>
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
    activeCalendarMenu,
    setActiveCalendarMenu,
    isMobile = false
}: {
    title: string
    status: 'todo' | 'in-progress' | 'done'
    tasks: Task[]
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: 'todo' | 'in-progress' | 'done') => void
    activeCalendarMenu: string | null
    setActiveCalendarMenu: (id: string | null) => void
    isMobile?: boolean
}) {
    const { setNodeRef } = useDroppable({ id: status })

    const statusColors = {
        'todo': 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
        'in-progress': 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50',
        'done': 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/50'
    }

    return (
        <div className="flex flex-col h-full">
            <div className={`hidden md:block bg-gradient-to-br ${statusColors[status]} border rounded-2xl p-4 mb-4`}>
                <h3 className="font-bold text-white text-lg">{title}</h3>
                <p className="text-white/60 text-sm">{tasks.length}個のタスク</p>
            </div>

            <div ref={setNodeRef} className="flex-1 space-y-3 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                        <DraggableTask
                            key={task.id}
                            task={task}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                            activeCalendarMenu={activeCalendarMenu}
                            setActiveCalendarMenu={setActiveCalendarMenu}
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
    )
}

function DraggableTask({
    task,
    onDelete,
    onStatusChange,
    activeCalendarMenu,
    setActiveCalendarMenu,
    isMobile
}: {
    task: Task
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: 'todo' | 'in-progress' | 'done') => void
    activeCalendarMenu: string | null
    setActiveCalendarMenu: (id: string | null) => void
    isMobile?: boolean
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        data: { task }
    })

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            ref={setNodeRef}
            className={`group p-4 rounded-2xl border transition-all ${isDragging ? 'opacity-50 ring-2 ring-emerald-500' : ''
                } ${task.completed
                    ? "bg-white/5 border-white/5"
                    : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20"
                }`}
        >
            <div className="flex items-start gap-3">
                {!isMobile && (
                    <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing mt-1">
                        <GripVertical className="w-4 h-4 text-white/40" />
                    </div>
                )}
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
                    {isMobile && (
                        <div className="flex gap-2 mt-3">
                            {task.status !== 'todo' && (
                                <button
                                    onClick={() => onStatusChange(task.id, task.status === 'done' ? 'in-progress' : 'todo')}
                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
                                >
                                    ← {task.status === 'done' ? '進行中へ' : '未着手へ'}
                                </button>
                            )}
                            {task.status !== 'done' && (
                                <button
                                    onClick={() => onStatusChange(task.id, task.status === 'todo' ? 'in-progress' : 'done')}
                                    className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-xs text-emerald-300 transition-colors"
                                >
                                    {task.status === 'todo' ? '進行中へ' : '完了へ'} →
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    )
}
