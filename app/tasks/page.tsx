"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Check, Calendar, Clock, CalendarPlus, MoreVertical, X, List, CalendarDays } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { TaskCalendar } from "@/components/TaskCalendar"

type Task = {
    id: string
    text: string
    completed: boolean
    createdAt: Date
    scheduledDate?: Date
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState("")
    const [scheduledDate, setScheduledDate] = useState("")
    const [activeCalendarMenu, setActiveCalendarMenu] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list')

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks")
            if (res.ok) {
                const data = await res.json()
                const mappedTasks = data.map((t: any) => ({
                    ...t,
                    createdAt: new Date(t.createdAt),
                    scheduledDate: t.scheduledDate ? new Date(t.scheduledDate) : undefined
                }))
                setTasks(mappedTasks)
            } else {
                throw new Error("タスクの取得に失敗しました")
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error)
            setError("タスクの読み込み中にエラーが発生しました")
        } finally {
            setIsLoading(false)
        }
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
                    scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null
                }),
            })

            if (res.ok) {
                const task = await res.json()
                setTasks([{
                    ...task,
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

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return

        const newCompleted = !task.completed

        // Optimistic update
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, completed: newCompleted } : t
        ))

        try {
            await fetch(`/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: newCompleted }),
            })
        } catch (error) {
            console.error("Failed to toggle task", error)
            // Revert on error
            setTasks(tasks.map(t =>
                t.id === id ? { ...t, completed: !newCompleted } : t
            ))
        }
    }

    const deleteTask = async (id: string) => {
        if (!confirm("本当にこのタスクを削除しますか？")) return

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

    // カレンダー連携用URL生成
    const generateCalendarUrl = (service: 'google' | 'outlook' | 'yahoo' | 'ical', task: Task) => {
        const title = encodeURIComponent(task.text)
        const details = encodeURIComponent("Journifyからのタスク")

        // 日時が設定されていない場合は現在時刻+1時間とする
        const startDate = task.scheduledDate || new Date()
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1時間後

        const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "")

        const start = formatTime(startDate)
        const end = formatTime(endDate)

        switch (service) {
            case 'google':
                return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`
            case 'outlook':
                return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`
            case 'yahoo':
                return `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${start}&et=${end}&desc=${details}`
            case 'ical':
                const icsContent = [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'BEGIN:VEVENT',
                    `DTSTART:${start}`,
                    `DTEND:${end}`,
                    `SUMMARY:${task.text}`,
                    `DESCRIPTION:Journifyからのタスク`,
                    'END:VEVENT',
                    'END:VCALENDAR'
                ].join('\n')
                return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`
            default:
                return '#'
        }
    }

    const handleCalendarClick = (service: 'google' | 'outlook' | 'yahoo' | 'ical', task: Task) => {
        const url = generateCalendarUrl(service, task)
        if (service === 'ical') {
            const link = document.createElement('a')
            link.href = url
            link.download = `${task.text}.ics`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else {
            window.open(url, '_blank')
        }
        setActiveCalendarMenu(null)
    }

    const handleDateSelect = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        setScheduledDate(`${year}-${month}-${day}T${hours}:${minutes}`)
        setActiveTab('list')

        setTimeout(() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement
            input?.focus()
        }, 100)
    }

    const completedCount = tasks.filter(t => t.completed).length
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="text-center py-12 text-white/60">読み込み中...</div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto" onClick={() => setActiveCalendarMenu(null)}>
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
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'list'
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        リスト
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

                {activeTab === 'list' ? (
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

                            {/* Progress Bar */}
                            <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>

                            {/* Background decoration */}
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
                            <div className="relative w-48">
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

                        {/* Task List */}
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {tasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${task.completed
                                            ? "bg-white/5 border-white/5"
                                            : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-white/40 hover:border-emerald-500 text-transparent"
                                                    }`}
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <div className="flex flex-col">
                                                <span className={`text-lg transition-all ${task.completed ? "text-white/40 line-through" : "text-white"
                                                    }`}>
                                                    {task.text}
                                                </span>
                                                {task.scheduledDate && (
                                                    <div className="flex items-center gap-1 text-xs text-emerald-300/80 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{task.scheduledDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 relative">
                                            {/* Calendar Button */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setActiveCalendarMenu(activeCalendarMenu === task.id ? null : task.id)
                                                    }}
                                                    className="p-2 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                    title="カレンダーに追加"
                                                >
                                                    <CalendarPlus className="w-4 h-4" />
                                                </button>

                                                {/* Calendar Dropdown */}
                                                <AnimatePresence>
                                                    {activeCalendarMenu === task.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                                                        >
                                                            <div className="p-1">
                                                                <button onClick={() => handleCalendarClick('google', task)} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                                                                    Google Calendar
                                                                </button>
                                                                <button onClick={() => handleCalendarClick('outlook', task)} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                                                                    Outlook
                                                                </button>
                                                                <button onClick={() => handleCalendarClick('yahoo', task)} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                                                                    Yahoo Calendar
                                                                </button>
                                                                <button onClick={() => handleCalendarClick('ical', task)} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                                                                    iCal (Apple)
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {tasks.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 text-white/40"
                                >
                                    <p>タスクがありません。新しいタスクを追加しましょう！</p>
                                </motion.div>
                            )}
                        </div>
                    </>
                ) : (
                    <TaskCalendar tasks={tasks} onDateSelect={handleDateSelect} />
                )}
            </div>
        </DashboardLayout>
    )
}
