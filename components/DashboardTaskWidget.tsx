"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

type Task = {
    id: string;
    text: string;
    priority: string;
    scheduledDate: Date | string | null;
    completed: boolean;
};

export default function DashboardTaskWidget({ tasks }: { tasks: Task[] }) {
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');

    // Helper to filter tasks
    const filteredTasks = tasks.filter(task => {
        if (!task.scheduledDate) return false;
        const date = new Date(task.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === 'today') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return date < tomorrow; // Includes overdue
        }
        if (activeTab === 'week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return date < nextWeek;
        }
        if (activeTab === 'month') {
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return date < nextMonth;
        }
        return false;
    });

    // Sort by date then priority
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const dateA = new Date(a.scheduledDate || 0).getTime();
        const dateB = new Date(b.scheduledDate || 0).getTime();
        if (dateA !== dateB) return dateA - dateB;
        // Priority order: high > medium > low
        const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    });

    const displayTasks = sortedTasks.slice(0, 5); // Show max 5

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold mb-1">タスク一覧</h3>
                    <p className="text-white/60 text-sm">予定を確認</p>
                </div>
                <Link
                    href="/tasks"
                    prefetch={true}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                    すべて表示 <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-4">
                {(['today', 'week', 'month'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === tab
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        {tab === 'today' ? '今日' : tab === 'week' ? '今週' : '今月'}
                    </button>
                ))}
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {displayTasks.map((task) => {
                    const date = new Date(task.scheduledDate || "");
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isOverdue = date < today;

                    return (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${task.priority === 'urgent' ? 'bg-red-500 shadow-red-500/50 animate-pulse' :
                                task.priority === 'high' ? 'bg-orange-500 shadow-orange-500/50' :
                                    task.priority === 'medium' ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                                } shadow-sm`} />

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate text-sm group-hover:text-emerald-300 transition-colors">{task.text}</h4>
                                {task.scheduledDate && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className={`text-[10px] flex items-center gap-1 ${isOverdue ? "text-red-400 font-bold" : "text-white/40"}`}>
                                            {isOverdue && <AlertCircle className="w-3 h-3" />}
                                            {date.toLocaleDateString()}
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
