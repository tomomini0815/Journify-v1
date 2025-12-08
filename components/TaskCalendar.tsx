"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

type Task = {
    id: string
    text: string
    completed: boolean
    createdAt: Date
    scheduledDate?: Date
}

type TaskCalendarProps = {
    tasks: Task[]
    onDateSelect: (date: Date) => void
}

export function TaskCalendar({ tasks, onDateSelect }: TaskCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Generate calendar days
    const calendarDays: (number | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }

    // Get tasks for a specific date
    const getTasksForDate = (day: number) => {
        const date = new Date(year, month, day)
        return tasks.filter(task => {
            if (!task.scheduledDate) return false
            const taskDate = new Date(task.scheduledDate)
            return taskDate.getFullYear() === date.getFullYear() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getDate() === date.getDate()
        })
    }

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const isToday = (day: number) => {
        const today = new Date()
        return today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
    }

    // Calculate moon phase for a given date
    // Returns 'new' for new moon, 'full' for full moon, or null
    const getMoonPhase = (day: number): 'new' | 'full' | null => {
        const date = new Date(year, month, day)
        // Known new moon: January 11, 2024
        const knownNewMoon = new Date(2024, 0, 11)
        const synodicMonth = 29.53058867 // days

        const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
        const phase = daysSinceKnownNewMoon % synodicMonth

        // New moon is around phase 0, full moon is around phase 14.76
        if (Math.abs(phase) < 0.5 || Math.abs(phase - synodicMonth) < 0.5) {
            return 'new'
        } else if (Math.abs(phase - synodicMonth / 2) < 0.5) {
            return 'full'
        }
        return null
    }

    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"]

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                    {year}年 {monthNames[month]}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day, index) => (
                    <div
                        key={day}
                        className={`text-center text-sm font-medium py-2 ${index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-white/60'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />
                    }

                    const dayTasks = getTasksForDate(day)
                    const completedTasks = dayTasks.filter(t => t.completed).length
                    const totalTasks = dayTasks.length

                    return (
                        <motion.button
                            key={day}
                            onClick={() => {
                                const selectedDate = new Date(year, month, day)
                                onDateSelect(selectedDate)
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`aspect-square rounded-xl p-2 transition-all relative ${isToday(day)
                                ? 'bg-emerald-500/20 border-2 border-emerald-500 text-white font-bold'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                                }`}
                        >
                            <div className="text-sm">{day}</div>

                            {/* Moon phase indicator */}
                            {getMoonPhase(day) && (
                                <div className="absolute top-1 right-1 text-xs">
                                    {getMoonPhase(day) === 'new' ? '🌑' : '🌕'}
                                </div>
                            )}

                            {/* Task indicators */}
                            {totalTasks > 0 && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                    {Array.from({ length: Math.min(totalTasks, 3) }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full ${i < completedTasks
                                                ? 'bg-emerald-400'
                                                : 'bg-white/40'
                                                }`}
                                        />
                                    ))}
                                    {totalTasks > 3 && (
                                        <div className="text-[8px] text-white/60 ml-0.5">
                                            +{totalTasks - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span>完了</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                    <span>未完了</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>🌕</span>
                    <span>満月</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>🌑</span>
                    <span>新月</span>
                </div>
            </div>
        </div>
    )
}
