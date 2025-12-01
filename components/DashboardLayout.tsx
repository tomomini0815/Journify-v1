"use client"

import { ReactNode, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, BookOpen, Target, User, LogOut, Menu, CheckSquare, Sparkles, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface DashboardLayoutProps {
    children: ReactNode
}

const navigation = [
    { name: "ダッシュボード", href: "/dashboard", icon: Home },
    { name: "ジャーナル", href: "/journal", icon: BookOpen },
    { name: "目標", href: "/goals", icon: Target },
    { name: "タスク", href: "/tasks", icon: CheckSquare },
    { name: "カレンダー", href: "/tasks/calendar", icon: Calendar },
    { name: "ビジョンボード", href: "/vision-board", icon: Sparkles },
    { name: "プロフィール", href: "/profile", icon: User },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { createClient } = await import("@/lib/supabase/client")
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Noise texture */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

            {/* Sidebar - Desktop */}
            <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-20">
                <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white/5 backdrop-blur-xl border-r border-white/10">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <Link href="/">
                            <h1 className="text-2xl font-bold tracking-tighter">Journify</h1>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all relative",
                                        isActive
                                            ? "text-white bg-white/10"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl border border-white/10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
                                        />
                                    )}
                                    <Icon className="mr-3 flex-shrink-0 h-5 w-5 relative z-10" />
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="flex-shrink-0 px-3 pb-4">
                        <button
                            onClick={handleLogout}
                            className="group flex items-center w-full px-3 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            <span>ログアウト</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/">
                        <h1 className="text-xl font-bold tracking-tighter">Journify</h1>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="md:hidden fixed inset-0 z-40 bg-[#0a0a0a]"
                >
                    <div className="flex flex-col h-full pt-16 pb-4 px-4">
                        <nav className="flex-1 space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all",
                                            isActive
                                                ? "text-white bg-white/10"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Icon className="mr-3 h-6 w-6" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-3 text-base font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <LogOut className="mr-3 h-6 w-6" />
                            <span>ログアウト</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Main content */}
            <main className="md:pl-64 pt-16 md:pt-0">
                <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
