"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    actionUrl: string | null
    isRead: boolean
    createdAt: string
}

export default function DashboardNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?unread=true')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'goal_reminder':
                return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
            case 'goal_overdue':
                return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
            case 'task_reminder':
                return { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' }
            case 'task_overdue':
                return { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
            default:
                return { icon: Bell, color: 'text-white/60', bg: 'bg-white/5', border: 'border-white/10' }
        }
    }

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-white/5 rounded-xl"></div>
                    <div className="h-16 bg-white/5 rounded-xl"></div>
                </div>
            </div>
        )
    }

    if (notifications.length === 0) {
        return (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-bold">通知</h3>
                </div>
                <p className="text-white/60 text-sm text-center py-4">
                    新しい通知はありません
                </p>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold">重要な通知</h3>
                <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                    {notifications.length}
                </span>
            </div>

            <div className="space-y-3">
                {notifications.slice(0, 5).map((notification, index) => {
                    const style = getNotificationStyle(notification.type)
                    const Icon = style.icon

                    return (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={notification.actionUrl || '#'}
                                className={`block p-4 rounded-xl border ${style.border} ${style.bg} hover:bg-white/10 transition-all group`}
                            >
                                <div className="flex gap-3">
                                    <div className={`flex-shrink-0 ${style.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm mb-1 group-hover:text-white transition-colors">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-white/60 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>

            {notifications.length > 5 && (
                <Link
                    href="/dashboard"
                    className="block mt-4 text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    さらに{notifications.length - 5}件の通知を表示 →
                </Link>
            )}
        </div>
    )
}
