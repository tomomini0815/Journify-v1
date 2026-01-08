"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    actionUrl: string | null
    isRead: boolean
    createdAt: string
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
        // 30秒ごとに新しい通知をチェック
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            })
            fetchNotifications()
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true })
            })
            fetchNotifications()
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'goal_reminder':
                return '🎯'
            case 'goal_overdue':
                return '⚠️'
            case 'task_reminder':
                return '📋'
            case 'task_overdue':
                return '🔴'
            default:
                return '🔔'
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}日前`
        if (hours > 0) return `${hours}時間前`
        if (minutes > 0) return `${minutes}分前`
        return 'たった今'
    }

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-bold text-lg">通知</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        すべて既読
                                    </button>
                                )}
                            </div>

                            {/* Notification List */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center text-white/40">
                                        読み込み中...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center text-white/40">
                                        通知はありません
                                    </div>
                                ) : (
                                    notifications.slice(0, 10).map((notification) => (
                                        <Link
                                            key={notification.id}
                                            href={notification.actionUrl || '#'}
                                            onClick={() => {
                                                if (!notification.isRead) {
                                                    markAsRead(notification.id)
                                                }
                                                setIsOpen(false)
                                            }}
                                            className={`block p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-white/5' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <span className="text-2xl flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-medium text-sm">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-white/60 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-white/40 mt-2">
                                                        {formatTime(notification.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-white/10 text-center">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        ダッシュボードで確認 →
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
