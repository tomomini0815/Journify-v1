"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowDownUp, ArrowUpRight, CheckCircle2, ChevronDown, Loader2, Plus } from 'lucide-react';
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
    projectId?: string | null;
    projectTitle?: string | null;
};

type ProjectOption = {
    id: string;
    title: string;
};

type SortOrder = 'asc' | 'desc';
type PriorityFilter = 'all' | 'urgent' | 'high' | 'medium' | 'low';

export default function DashboardTaskWidget({ tasks, projects = [] }: { tasks: Task[]; projects?: ProjectOption[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
    const [projectFilter, setProjectFilter] = useState('all');
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

    const isTaskInTab = (task: Task, tab: 'today' | 'week' | 'month') => {
        if (task.completed) return false;

        const { start: rangeStart, end: rangeEnd } = getDateRange(tab);
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
        if (tab === 'today') {
            const isOverdue = effectiveEnd < rangeStart;
            const overlapsToday = effectiveStart < rangeEnd && effectiveEnd >= rangeStart;
            return isOverdue || overlapsToday;
        }

        // For week/month: task range overlaps the selected range
        return effectiveStart < rangeEnd && effectiveEnd >= rangeStart;
    };

    const matchesFilters = (task: Task) => {
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesProject = projectFilter === 'all'
            || (projectFilter === 'daily' ? !task.projectId : task.projectId === projectFilter);

        return matchesPriority && matchesProject;
    };

    const selectableTasks = tasks.filter(matchesFilters);

    // Filter tasks: a task is shown if its effective date range overlaps the selected tab range
    const filteredTasks = selectableTasks.filter(task => {
        return isTaskInTab(task, activeTab);
    });

    const taskTabs = ['today', 'week', 'month'] as const;
    const taskCounts = {
        today: selectableTasks.filter(task => isTaskInTab(task, 'today')).length,
        week: selectableTasks.filter(task => isTaskInTab(task, 'week')).length,
        month: selectableTasks.filter(task => isTaskInTab(task, 'month')).length,
    };

    // Sort: overdue first, then by date, then by priority
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const dateA = new Date(a.scheduledDate || a.endDate || a.startDate || 0);
        const dateB = new Date(b.scheduledDate || b.endDate || b.startDate || 0);
        const now = new Date();
        const aOverdue = dateA < now;
        const bOverdue = dateB < now;

        // Keep overdue tasks visible first when sorting ascending.
        if (sortOrder === 'asc') {
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
        }

        // Then by date
        if (dateA.getTime() !== dateB.getTime()) {
            return sortOrder === 'asc'
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
        }

        // Then by priority
        const pMap: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    });

    const displayTasks = sortedTasks.slice(0, 8);

    const handleTaskClick = (task: Task) => {
        router.push(`/tasks?taskId=${encodeURIComponent(task.id)}`);
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
        <div className="dashboard-panel p-4 flex flex-col h-full">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="dashboard-section-label mb-1">Tasks</p>
                    <h3 className="text-lg font-semibold leading-tight">タスク一覧</h3>
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                    <button
                        type="button"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        aria-label={sortOrder === 'asc' ? '降順に並び替え' : '昇順に並び替え'}
                        title={sortOrder === 'asc' ? '昇順' : '降順'}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/35 text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white focus:border-emerald-400/40 focus:outline-none"
                    >
                        <ArrowDownUp className="h-3.5 w-3.5" />
                    </button>
                    <div className="relative shrink-0">
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                            aria-label="重要度で絞り込み"
                            className="h-8 w-[68px] appearance-none rounded-lg border border-white/[0.08] bg-[#101816] py-0 pl-2 pr-6 text-[11px] font-medium text-white/75 outline-none transition-colors hover:border-white/[0.14] hover:bg-[#14201d] focus:border-emerald-400/40 focus:bg-[#14201d] sm:w-[84px] sm:pl-2.5 sm:pr-7"
                        >
                            <option className="bg-[#101816] text-white" value="all">重要度</option>
                            <option className="bg-[#101816] text-white" value="urgent">最高</option>
                            <option className="bg-[#101816] text-white" value="high">高</option>
                            <option className="bg-[#101816] text-white" value="medium">中</option>
                            <option className="bg-[#101816] text-white" value="low">低</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45 sm:right-2" />
                    </div>
                    <div className="relative min-w-0 shrink-0">
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            aria-label="プロジェクトで絞り込み"
                            className="h-8 w-[88px] appearance-none rounded-lg border border-white/[0.08] bg-[#101816] py-0 pl-2 pr-6 text-[11px] font-medium text-white/75 outline-none transition-colors hover:border-white/[0.14] hover:bg-[#14201d] focus:border-emerald-400/40 focus:bg-[#14201d] sm:w-[112px] sm:pl-2.5 sm:pr-7"
                        >
                            <option className="bg-[#101816] text-white" value="all">{"\u3059\u3079\u3066"}</option>
                            <option className="bg-[#101816] text-white" value="daily">日常タスク</option>
                            {projects.map((project) => (
                                <option className="bg-[#101816] text-white" key={project.id} value={project.id}>
                                    {project.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45 sm:right-2" />
                    </div>
                <Link
                    href="/tasks"
                    prefetch={true}
                    aria-label="タスクをすべて表示"
                    title="すべて表示"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-emerald-300 transition-colors hover:border-emerald-300/25 hover:bg-emerald-400/10 hover:text-emerald-200"
                >
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-black/40 p-1 rounded-xl gap-0.5 overflow-x-auto no-scrollbar mb-4">
                {taskTabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex min-w-fit items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                            }`}
                    >
                        {tab === 'today' ? '今日' : tab === 'week' ? '今週' : '今月'}
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${activeTab === tab ? "bg-white/15 text-white" : "bg-white/10 text-white/50"}`}>
                            {taskCounts[tab]}
                        </span>
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
                    className="absolute right-1.5 top-1/2 z-20 flex h-[calc(100%-12px)] min-h-8 w-12 -translate-y-1/2 items-center justify-center rounded-md bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-200/40 transition-all hover:shadow-emerald-400/40 disabled:opacity-40 disabled:shadow-none"
                >
                    {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                </button>
            </form>

            <div className="space-y-3">
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
                    <div className="flex flex-col items-center justify-center text-white/30 py-6">
                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">タスクはありません</p>
                    </div>
                )}
            </div>
        </div>
    );
}
