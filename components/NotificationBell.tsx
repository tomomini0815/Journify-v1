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

import { Switch } from "@/components/ui/switch"

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isPushEnabled, setIsPushEnabled] = useState(false)
    const bellRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        fetchNotifications()
        checkPushSubscription() // Check initial state
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

    // Check if user is already subscribed
    const checkPushSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsPushEnabled(!!subscription && Notification.permission === 'granted')
        } catch (error) {
            console.error('Error checking push subscription:', error)
        }
    }

    // Toggle handler
    const handlePushToggle = async (checked: boolean) => {
        if (checked) {
            // Check permission first
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission()
                if (permission === 'granted') {
                    await subscribeToPush()
                } else {
                    // unexpected denial or close
                    setIsPushEnabled(false)
                }
            } else if (Notification.permission === 'granted') {
                await subscribeToPush()
            } else {
                alert('通知がブロックされています。ブラウザの設定から許可してください。')
                setIsPushEnabled(false)
            }
        } else {
            await unsubscribeFromPush()
        }
    }

    const unsubscribeFromPush = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready
                const subscription = await registration.pushManager.getSubscription()
                if (subscription) {
                    // Unsubscribe from server
                    await fetch('/api/push/unsubscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ endpoint: subscription.endpoint })
                    })

                    // Unsubscribe from browser
                    await subscription.unsubscribe()
                    setIsPushEnabled(false)
                    console.log('Push notification disabled')
                }
            }
        } catch (error) {
            console.error('Failed to unsubscribe:', error)
        }
    }

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                const newNotifications: Notification[] = data.notifications || []

                // Check if we have any *new* task reminders that are unread
                // We compare with the previous state 'notifications'
                // This is a simplified check; for robustness, we could track the last notified ID or timestamp
                if (notifications.length > 0) { // Only check if we have previous data to avoid blast on initial load
                    const existingIds = new Set(notifications.map(n => n.id))

                    newNotifications.forEach(n => {
                        if (!existingIds.has(n.id) && !n.isRead && n.type === 'task_reminder') {
                            // This is a new, unread task reminder
                            if (Notification.permission === "granted") {
                                new Notification(n.title, {
                                    body: n.message,
                                    icon: '/icons/icon-192x192.png' // Adjust icon path if needed
                                })
                            }
                        }
                    })
                }

                setNotifications(newNotifications)
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const subscribeToPush = async () => {
        try {
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidKey) {
                console.warn("VAPID Public Key is missing! Push notifications cannot be enabled.");
                return;
            }

            // Register Service Worker
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;

                // Subscribe to Push
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey)
                });

                // Send subscription to server
                const response = await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(subscription),
                });

                if (!response.ok) throw new Error('Failed to sync subscription')

                setIsPushEnabled(true)
                console.log('Push subscription successful');
            }
        } catch (error) {
            console.error('Failed to subscribe to push:', error);
            setIsPushEnabled(false)
        }
    }

    // Helper to convert VAPID key
    function urlBase64ToUint8Array(base64String: string) {
        try {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        } catch (error) {
            console.error("Failed to decode VAPID public key. Please check if NEXT_PUBLIC_VAPID_PUBLIC_KEY is a valid base64url encoded VAPID public key.", error);
            throw new Error("Invalid VAPID public key encoding");
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
                onClick={() => {
                    setIsOpen(!isOpen)
                }}
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
                                <div className="flex items-center gap-4">
                                    <h3 className="font-bold text-lg text-white">通知</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/50">Push通知</span>
                                        <Switch
                                            checked={isPushEnabled}
                                            onCheckedChange={handlePushToggle}
                                            disabled={!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}
                                            title={!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "環境変数 NEXT_PUBLIC_VAPID_PUBLIC_KEY が設定されていません" : undefined}
                                            className="scale-75"
                                        />
                                        {!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && (
                                            <span className="text-[10px] text-rose-400 font-medium">未構成</span>
                                        )}
                                    </div>
                                </div>
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
