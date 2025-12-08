"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Calendar, List, CalendarDays, ArrowRight, ArrowLeft, Pencil, X, ChevronDown } from "lucide-react"
import { TaskCalendar } from "@/components/TaskCalendar"
import { AddTaskForm } from "@/components/AddTaskForm"

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
    const [description, setDescription] = useState("")
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState<'kanban' | 'calendar'>('kanban')
    const [activeScope, setActiveScope] = useState<'today' | 'week' | 'month' | 'all'>('today')
    const [mobileKanbanTab, setMobileKanbanTab] = useState<'todo' | 'in-progress' | 'done'>('todo')

    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

    // Date helpers
    const isToday = (date: Date) => {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    const isThisWeek = (date: Date) => {
        const today = new Date()
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return date >= startOfWeek && date <= endOfWeek;
    }

    const isThisMonth = (date: Date) => {
        const today = new Date()
        return date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

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
                    status: 'todo',
                    description: description
                }),
            })

            if (res.ok) {
                const task = await res.json()
                const newScheduledDate = task.scheduledDate ? new Date(task.scheduledDate) : undefined

                setTasks([{
                    ...task,
                    status: task.status || 'todo',
                    createdAt: new Date(task.createdAt),
                    scheduledDate: newScheduledDate
                }, ...tasks])

                setNewTask("")
                setScheduledDate("")
                setDescription("")
                setError("")

                // Auto-navigate to appropriate scope
                if (newScheduledDate) {
                    if (isToday(newScheduledDate)) {
                        setActiveScope('today')
                    } else if (isThisWeek(newScheduledDate)) {
                        setActiveScope('week')
                    } else if (isThisMonth(newScheduledDate)) {
                        setActiveScope('month')
                    } else {
                        setActiveScope('all')
                    }
                } else {
                    setActiveScope('all')
                }
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

    const confirmDelete = (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        setDeletingTaskId(id)
        setShowDeleteModal(true)
    }

    const performDelete = async () => {
        if (!deletingTaskId) return

        try {
            const res = await fetch(`/api/tasks/${deletingTaskId}`, {
                method: "DELETE",
            })

            console.log("Delete response status:", res.status)

            if (res.ok) {
                setTasks(prev => prev.filter(t => t.id !== deletingTaskId))
                setShowDeleteModal(false)
                setDeletingTaskId(null)
            } else {
                console.error("Delete failed with status:", res.status)
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

    const filteredTasks = tasks.filter(task => {
        if (!task.scheduledDate) {
            // Unscheduled tasks only show in 'all'
            return activeScope === 'all'
        }

        const date = task.scheduledDate
        switch (activeScope) {
            case 'today':
                return isToday(date) || (date < new Date() && task.status !== 'done') // Show overdue in today
            case 'week':
                return isThisWeek(date) || (date < new Date() && task.status !== 'done') // Show overdue in week
            case 'month':
                return isThisMonth(date) || (date < new Date() && task.status !== 'done') // Show overdue in month
            case 'all':
                return true
            default:
                return true
        }
    })

    const todoTasks = filteredTasks.filter(t => t.status === 'todo')
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress')
    const doneTasks = filteredTasks.filter(t => t.status === 'done')

    const completedCount = filteredTasks.filter(t => t.completed).length
    const progress = filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0

    return (
        <div className="h-full flex flex-col overflow-hidden" >
            {/* Header & Controls Section */}
            < div className="flex-shrink-0 mb-6 space-y-6" >
                {/* ... (Header) */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">日々のタスク</h1>
                        <p className="text-white/60">小さな達成の積み重ねが、大きな成長につながります。</p>
                    </div>
                </div>

                {/* Mobile Actions Row (View Toggles & Add Task) */}
                <div className="md:hidden flex items-center justify-between mb-4">
                    {/* Left: View Toggles */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('kanban')}
                            className={`p-2.5 rounded-xl transition-all ${activeTab === 'kanban'
                                ? 'bg-white/10 text-emerald-400'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            title="カンバン表示"
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`p-2.5 rounded-xl transition-all ${activeTab === 'calendar'
                                ? 'bg-white/10 text-emerald-400'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            title="カレンダー表示"
                        >
                            <CalendarDays className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Right: Add Task Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        タスクを追加
                    </button>
                </div>

                {/* Tabs & View Toggle Row */}
                < div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-0 gap-4 md:gap-0" >
                    <div className="flex gap-1 overflow-x-auto w-full md:w-auto no-scrollbar">
                        {(['today', 'week', 'month', 'all'] as const).map((scope) => (
                            <button
                                key={scope}
                                onClick={() => setActiveScope(scope)}
                                className={`px-4 md:px-6 py-3 font-medium transition-all relative whitespace-nowrap ${activeScope === scope
                                    ? 'text-emerald-400'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {scope === 'today' && '今日のタスク'}
                                {scope === 'week' && '一週間のタスク'}
                                {scope === 'month' && '今月のタスク'}
                                {scope === 'all' && 'すべてのタスク'}

                                {activeScope === scope && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 pb-2 w-full md:w-auto items-center justify-end hidden md:flex">
                        <button
                            onClick={() => setActiveTab('kanban')}
                            className={`p-2 rounded-lg transition-all ${activeTab === 'kanban'
                                ? 'bg-white/10 text-emerald-400'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            title="カンバン表示"
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`p-2 rounded-lg transition-all ${activeTab === 'calendar'
                                ? 'bg-white/10 text-emerald-400'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            title="カレンダー表示"
                        >
                            <CalendarDays className="w-5 h-5" />
                        </button>
                    </div>
                </div >
            </div >

            {/* Error Message */}
            {
                error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 flex-shrink-0"
                    >
                        {error}
                    </motion.div>
                )
            }

            {
                activeTab === 'kanban' ? (
                    <div className="flex-1 flex flex-col min-h-0 bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                        {/* Input & Progress Area */}
                        <div className="p-4 border-b border-white/5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Add Task Form - Takes 2 cols - Only visible on desktop now */}
                            <div className="lg:col-span-2 hidden md:block">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="h-full"
                                >
                                    <AddTaskForm
                                        newTask={newTask}
                                        setNewTask={setNewTask}
                                        scheduledDate={scheduledDate}
                                        setScheduledDate={setScheduledDate}
                                        description={description}
                                        setDescription={setDescription}
                                        onSubmit={addTask}
                                    />
                                </motion.div>
                            </div>

                            {/* Mini Progress - Takes 1 col */}
                            <div className="lg:col-span-1 bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col justify-center relative overflow-hidden group">
                                <div className="flex items-end justify-between mb-1 relative z-10">
                                    <div>
                                        <p className="text-white/40 text-[10px] font-medium mb-0.5">達成率</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-white">{Math.round(progress)}<span className="text-xs text-emerald-500">%</span></span>
                                            <span className="text-white/40 text-[10px]">{completedCount}/{filteredTasks.length} 完了</span>
                                        </div>
                                    </div>
                                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative z-10">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            </div>
                        </div>

                        {/* Mobile Kanban Tabs */}
                        <div className="md:hidden px-6 py-4">
                            <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5 relative">
                                {(['todo', 'in-progress', 'done'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setMobileKanbanTab(tab)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl relative z-10 transition-colors ${mobileKanbanTab === tab ? 'text-white' : 'text-white/40'}`}
                                    >
                                        {tab === 'todo' && '未着手'}
                                        {tab === 'in-progress' && '進行中'}
                                        {tab === 'done' && '完了'}
                                        <span className="ml-1 opacity-60 font-normal">
                                            ({tab === 'todo' ? todoTasks.length : tab === 'in-progress' ? inProgressTasks.length : doneTasks.length})
                                        </span>
                                        {mobileKanbanTab === tab && (
                                            <motion.div
                                                layoutId="mobileTabBg"
                                                className="absolute inset-0 bg-white/10 rounded-xl -z-10 border border-white/10 shadow-sm"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Kanban Board - Scrollable Container */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 md:overflow-x-auto md:overflow-y-hidden">
                            <div className="h-full md:min-w-[900px] grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Mobile View - Single Column */}
                                <div className="md:hidden h-full">
                                    {mobileKanbanTab === 'todo' && (
                                        <KanbanColumn
                                            title="未着手"
                                            status="todo"
                                            tasks={todoTasks}
                                            onDelete={confirmDelete}
                                            onStatusChange={updateTaskStatus}
                                            onEdit={openEditModal}
                                            generateCalendarLink={generateCalendarLink}
                                            accentColor="blue"
                                            isMobile={true}
                                        />
                                    )}
                                    {mobileKanbanTab === 'in-progress' && (
                                        <KanbanColumn
                                            title="進行中"
                                            status="in-progress"
                                            tasks={inProgressTasks}
                                            onDelete={confirmDelete}
                                            onStatusChange={updateTaskStatus}
                                            onEdit={openEditModal}
                                            generateCalendarLink={generateCalendarLink}
                                            accentColor="yellow"
                                            isMobile={true}
                                        />
                                    )}
                                    {mobileKanbanTab === 'done' && (
                                        <KanbanColumn
                                            title="完了"
                                            status="done"
                                            tasks={doneTasks}
                                            onDelete={confirmDelete}
                                            onStatusChange={updateTaskStatus}
                                            onEdit={openEditModal}
                                            generateCalendarLink={generateCalendarLink}
                                            accentColor="emerald"
                                            isMobile={true}
                                        />
                                    )}
                                </div>

                                {/* Desktop View - Grid */}
                                <div className="hidden md:contents">
                                    <KanbanColumn
                                        title="未着手"
                                        status="todo"
                                        tasks={todoTasks}
                                        onDelete={confirmDelete}
                                        onStatusChange={updateTaskStatus}
                                        onEdit={openEditModal}
                                        generateCalendarLink={generateCalendarLink}
                                        accentColor="blue"
                                    />
                                    <KanbanColumn
                                        title="進行中"
                                        status="in-progress"
                                        tasks={inProgressTasks}
                                        onDelete={confirmDelete}
                                        onStatusChange={updateTaskStatus}
                                        onEdit={openEditModal}
                                        generateCalendarLink={generateCalendarLink}
                                        accentColor="yellow"
                                    />
                                    <KanbanColumn
                                        title="完了"
                                        status="done"
                                        tasks={doneTasks}
                                        onDelete={confirmDelete}
                                        onStatusChange={updateTaskStatus}
                                        onEdit={openEditModal}
                                        generateCalendarLink={generateCalendarLink}
                                        accentColor="emerald"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Edit Grid Modal logic remains, but simplified container above */}
                        <AnimatePresence>
                            {showEditModal && editingTask && (
                                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
                                    {/* ... existing modal code ... */}
                                    <div className="flex min-h-full items-center justify-center p-4">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
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
                                                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition-colors text-black"
                                                    >
                                                        更新
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <TaskCalendar tasks={tasks} onDateSelect={handleDateSelect} />
                )
            }
            {/* Add Task Modal (Mobile) */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm md:hidden">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 w-full max-w-sm relative shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">タスクを追加</h2>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="p-1 text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <AddTaskForm
                                    newTask={newTask}
                                    setNewTask={setNewTask}
                                    scheduledDate={scheduledDate}
                                    setScheduledDate={setScheduledDate}
                                    description={description}
                                    setDescription={setDescription}
                                    onSubmit={addTask}
                                    isMobile={true}
                                />
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative shadow-2xl"
                            >
                                <div className="mb-6">
                                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500 mx-auto">
                                        <Trash2 className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white text-center mb-2">タスクを削除</h2>
                                    <p className="text-white/60 text-center">
                                        本当にこのタスクを削除しますか？<br />
                                        この操作は取り消せません。
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium border border-white/10"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={performDelete}
                                        className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-400 transition-colors font-medium shadow-lg shadow-red-500/20"
                                    >
                                        削除する
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div >
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
    isMobile = false,
    accentColor = 'blue'
}: {
    title: string
    status: 'todo' | 'in-progress' | 'done'
    tasks: Task[]
    onDelete: (id: string, e?: React.MouseEvent) => void
    onStatusChange: (id: string, status: 'todo' | 'in-progress' | 'done') => void
    onEdit: (task: Task) => void
    generateCalendarLink: (task: Task, provider: 'google' | 'outlook' | 'yahoo') => string
    isMobile?: boolean
    accentColor?: 'blue' | 'yellow' | 'emerald'
}) {
    const accentColors = {
        'blue': {
            bg: 'bg-blue-500/5',
            border: 'border-blue-500/20',
            text: 'text-blue-200',
            dot: 'bg-blue-400'
        },
        'yellow': {
            bg: 'bg-yellow-500/5',
            border: 'border-yellow-500/20',
            text: 'text-yellow-200',
            dot: 'bg-yellow-400'
        },
        'emerald': {
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-500/20',
            text: 'text-emerald-200',
            dot: 'bg-emerald-400'
        }
    }

    const colors = accentColors[accentColor]

    return (
        <div className="flex flex-col h-full group">
            <div className={`rounded-3xl p-4 h-full flex flex-col transition-colors ${colors.bg} border-t-2 ${colors.border}`}>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <h3 className={`font-bold ${colors.text} text-base`}>{title}</h3>
                    </div>
                    <span className="bg-black/20 px-3 py-1 rounded-full text-xs text-white/40 font-mono">
                        {tasks.length}
                    </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-1 -mx-1 custom-scrollbar">
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
                        <div className="text-center py-12 text-white/20 text-sm border-2 border-dashed border-white/5 rounded-2xl">
                            <p>タスクなし</p>
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
    onDelete: (id: string, e?: React.MouseEvent) => void
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
                    {/* Calendar Dropdown - Only for todo tasks */}
                    {task.status === 'todo' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                                className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="カレンダーに追加"
                            >
                                <Calendar className="w-4 h-4" />
                            </button>
                            {showCalendarMenu && (
                                <div className="absolute left-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden">
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
                    )}
                    {/* Edit button - Only for todo tasks */}
                    {task.status === 'todo' && (
                        <button
                            onClick={() => onEdit(task)}
                            className="p-2 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                    {/* Delete button - Always visible */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(task.id, e)
                        }}
                        className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
