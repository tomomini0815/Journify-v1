"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { TaskCalendar } from "@/components/TaskCalendar"
import { useRouter } from "next/navigation"

type Task = {
    id: string
    text: string
    completed: boolean
    createdAt: Date
    scheduledDate?: Date
}

export default function TaskCalendarPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

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
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDateSelect = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        // Navigate to tasks page with date parameter
        router.push(`/tasks?date=${year}-${month}-${day}T${hours}:${minutes}`)
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">タスクカレンダー</h1>
                    <p className="text-white/60">カレンダーでタスクを確認・管理できます。</p>
                </div>

                <TaskCalendar tasks={tasks} onDateSelect={handleDateSelect} />
            </div>
        </DashboardLayout>
    )
}
