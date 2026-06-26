"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Task = {
    id: string;
    text: string;
    priority: string;
    scheduledDate: Date | string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    completed: boolean;
    description?: string;
    status?: string;
};

export default function DashboardTaskWidget({ tasks }: { tasks: Task[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Helper: compute date range for each tab
    const getDateRange = (tab: 'today' | 'week' | 'month') => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (tab === 'today') {
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);
            return { start: todayStart, end: todayEnd };
        }
        if (tab === 'week') {
            // Monday-based week
            const dayOfWeek = now.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const weekStart = new Date(todayStart);
            weekStart.setDate(weekStart.getDate() + mondayOffset);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return { start: weekStart, end: weekEnd };
        }
        // month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
    };

    const { start: rangeStart, end: rangeEnd } = getDateRange(activeTab);

    // Filter tasks: a task is shown if its effective date range overlaps the selected tab range
    const filteredTasks = tasks.filter(task => {
        if (task.completed) return false;

        const taskStart = task.startDate ? new Date(task.startDate)
            : task.scheduledDate ? new Date(task.scheduledDate)
                : task.endDate ? new Date(task.endDate)
                    : null;
        const taskEnd = task.endDate ? new Date(task.endDate)
            : task.scheduledDate ? new Date(task.scheduledDate)
                : task.startDate ? new Date(task.startDate)
                    : null;

        if (!taskStart && !taskEnd) return false;

        const effectiveStart = taskStart || taskEnd!;
        const effectiveEnd = taskEnd || taskStart!;

        // For "今日" tab, also include overdue tasks (effectiveEnd < today)
        if (activeTab === 'today') {
            const isOverdue = effectiveEnd < rangeStart;
            const overlapsToday = effectiveStart < rangeEnd && effectiveEnd >= rangeStart;
            return isOverdue || overlapsToday;
        }

        // For week/month: task range overlaps the selected range
        return effectiveStart < rangeEnd && effectiveEnd >= rangeStart;
    });

    // Sort: overdue first, then by date, then by priority
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const dateA = new Date(a.scheduledDate || a.endDate || a.startDate || 0);
        const dateB = new Date(b.scheduledDate || b.endDate || b.startDate || 0);
        const now = new Date();
        const aOverdue = dateA < now;
        const bOverdue = dateB < now;

        // Overdue tasks first
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Then by date
        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();

        // Then by priority
        const pMap: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    });

    const displayTasks = sortedTasks.slice(0, 5);

    const handleTaskClick = (task: Task) => {
        const dateToCheck = task.scheduledDate || task.endDate || task.startDate;
        if (!dateToCheck) {
            router.push('/tasks?scope=all');
            return;
        }

        const date = new Date(dateToCheck);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        if (date < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
            router.push('/tasks?scope=today');
        } else if (date < nextWeek) {
            router.push('/tasks?scope=week');
        } else if (date < nextMonth) {
            router.push('/tasks?scope=month');
        } else {
            router.push('/tasks?scope=all');
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || isAdding) return;

        setIsAdding(true);
        try {
            const today = new Date().toISOString();
            // Always set scheduledDate to today for quick add, so it appears in "Today", "Week", and "Month"
            const scheduledDate = today;

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newTaskTitle.trim(),
                    scheduledDate,
                    status: 'todo',
                    priority: 'medium'
                }),
            });

            if (!res.ok) throw new Error('Failed to add task');

            setNewTaskTitle('');
            router.refresh(); // Refresh server component data
        } catch (error) {
            console.error('Add task error:', error);
            alert('タスクの追加に失敗しました');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="dashboard-panel p-4 flex flex-col h-full min-h-[380px]">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="dashboard-section-label mb-1">Tasks</p>
                    <h3 className="text-lg font-semibold leading-tight">タスク一覧</h3>
                </div>
                <Link
                    href="/tasks"
                    prefetch={true}
                    aria-label="タスクをすべて表示"
                    title="すべて表示"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-emerald-300 transition-colors hover:border-emerald-300/25 hover:bg-emerald-400/10 hover:text-emerald-200"
                >
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex p-1 dashboard-panel-subtle mb-4">
                {(['today', 'week', 'month'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/15"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        {tab === 'today' ? '今日' : tab === 'week' ? '今週' : '今月'}
                    </button>
                ))}
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddTask} className="relative mb-4 z-10">
                <Input
                    type="text"
                    placeholder="新しいタスクを入力..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    disabled={isAdding}
                    className="pr-12 rounded-lg bg-white/[0.055] border-white/10 focus:border-emerald-500/50"
                />
                <button
                    type="submit"
                    disabled={!newTaskTitle.trim() || isAdding}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-400 hover:text-emerald-300 disabled:opacity-30 transition-all z-20"
                >
                    {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                </button>
            </form>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {displayTasks.map((task) => {
                    const scheduledDate = task.scheduledDate ? new Date(task.scheduledDate) : null;
                    const startDate = task.startDate ? new Date(task.startDate) : null;
                    const endDate = task.endDate ? new Date(task.endDate) : null;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Determine which date to display and check for overdue
                    let dateDisplay = "";
                    let isOverdue = false;

                    if (startDate && endDate) {
                        dateDisplay = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
                        isOverdue = endDate < today;
                    } else if (scheduledDate) {
                        dateDisplay = scheduledDate.toLocaleDateString();
                        isOverdue = scheduledDate < today;
                    }

                    return (
                        <div
                            key={task.id}
                            onClick={() => handleTaskClick(task)}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.045] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.075] transition-colors cursor-pointer group"
                        >
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${task.priority === 'urgent' ? 'bg-red-500 shadow-red-500/50 animate-pulse' :
                                task.priority === 'high' ? 'bg-orange-500 shadow-orange-500/50' :
                                    task.priority === 'medium' ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                                } shadow-sm`} />

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate text-sm group-hover:text-emerald-300 transition-colors">{task.text}</h4>
                                {(dateDisplay) && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className={`text-[10px] flex items-center gap-1 ${isOverdue ? "text-red-400 font-bold" : "text-white/40"}`}>
                                            {isOverdue && <AlertCircle className="w-3 h-3" />}
                                            {dateDisplay}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                {displayTasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-white/30 py-4">
                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">タスクはありません</p>
                    </div>
                )}
            </div>
        </div>
    );
}
