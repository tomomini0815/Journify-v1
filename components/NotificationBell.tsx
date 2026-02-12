"use client"

import { useEffect, useState, useRef } from "react"
import { Bell, Check } from "lucide-react"
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
    const bellRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    // Lock body scroll when modal is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

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
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))

        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            })
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
            fetchNotifications()
        }
    }

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)

        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true })
            })
        } catch (error) {
            console.error('Failed to mark all as read:', error)
            fetchNotifications()
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'goal_reminder': return '🎯'
            case 'goal_overdue': return '⚠️'
            case 'task_reminder': return '📋'
            case 'task_overdue': return '🔴'
            default: return '🔔'
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
                ref={bellRef}
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

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Full-screen backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Notification Panel - full-screen on mobile, dropdown on desktop */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-x-3 top-16 bottom-auto z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100dvh-5rem)] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                                <h3 className="font-bold text-lg text-white">通知</h3>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            すべて既読
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="sm:hidden text-white/40 hover:text-white text-xl leading-none p-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="overflow-y-auto flex-1 overscroll-contain">
                                {loading ? (
                                    <div className="p-8 text-center text-white/40">
                                        読み込み中...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center text-white/40">
                                        通知はありません
                                    </div>
                                ) : (
                                    notifications.slice(0, 20).map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`relative border-b border-white/5 transition-all ${notification.isRead
                                                    ? 'opacity-50'
                                                    : 'bg-white/[0.03]'
                                                }`}
                                        >
                                            <Link
                                                href={notification.actionUrl || '#'}
                                                onClick={() => {
                                                    if (!notification.isRead) {
                                                        markAsRead(notification.id)
                                                    }
                                                    setIsOpen(false)
                                                }}
                                                className="block p-4 hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex gap-3">
                                                    <span className="text-xl flex-shrink-0 mt-0.5">
                                                        {notification.isRead ? (
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10">
                                                                <Check className="w-3.5 h-3.5 text-white/40" />
                                                            </span>
                                                        ) : (
                                                            getNotificationIcon(notification.type)
                                                        )}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm ${notification.isRead
                                                                    ? 'font-normal text-white/50 line-through decoration-white/20'
                                                                    : 'font-medium text-white'
                                                                }`}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.isRead && (
                                                                <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className={`text-sm mt-1 ${notification.isRead
                                                                ? 'text-white/30'
                                                                : 'text-white/60'
                                                            }`}>
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-white/30 mt-1.5">
                                                            {formatTime(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                            {/* Mark as read button (for unread items) */}
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        markAsRead(notification.id)
                                                    }}
                                                    className="absolute top-3 right-3 p-1.5 rounded-lg text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                                    title="既読にする"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-white/10 text-center shrink-0">
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
