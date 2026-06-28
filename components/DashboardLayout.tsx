"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, BookOpen, Target, User, LogOut, Menu, CheckSquare, Sparkles, Briefcase, ChevronDown, Heart, BarChart2, MessageSquarePlus, PawPrint, Store, Armchair, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import NotificationBell from "@/components/NotificationBell"
import { WeatherWidget } from "@/components/WeatherWidget"
import { DashboardGreeting } from "@/components/DashboardGreeting"

interface DashboardLayoutProps {
    children: ReactNode
}

const pageMeta: Record<string, { title: string; description?: string }> = {
    "/journal": {
        title: "ジャーナル",
        description: "あなたの思考を記録し、成長の軌跡を追う",
    },
    "/tasks": {
        title: "日々のタスク",
        description: "小さな達成の積み重ねが、大きな成長につながります。",
    },
    "/goals": {
        title: "目標",
        description: "進みたい方向と達成までの道のりを整える",
    },
    "/projects": {
        title: "プロジェクト",
        description: "仕事や制作の流れをまとめて管理する",
    },
    "/vision-board": {
        title: "ビジョンボード",
        description: "叶えたい未来を視覚化する",
    },
    "/adventure": {
        title: "ペットハウス",
        description: "日々の行動を小さな冒険につなげる",
    },
    "/year-in-review": {
        title: "統計詳細",
        description: "記録から見える変化を振り返る",
    },
    "/profile": {
        title: "アカウント設定",
        description: "プロフィールと利用設定を管理する",
    },
    "/feedback": {
        title: "お問い合わせ",
        description: "改善要望や不具合を送る",
    },
}

const defaultNavigation = [
    { name: "ダッシュボード", href: "/dashboard", icon: Home },
    { name: "ジャーナル", href: "/journal", icon: BookOpen },
    { name: "目標", href: "/goals", icon: Target },
    { name: "タスク", href: "/tasks", icon: CheckSquare },
    { name: "プロジェクト", href: "/projects", icon: Briefcase },
    { name: "ビジョンボード", href: "/vision-board", icon: Sparkles },
    { name: "ペットハウス", href: "/adventure", icon: PawPrint },
    { name: "統計詳細", href: "/year-in-review", icon: BarChart2 },
]

const bottomNavigation = [
    { name: "アカウント設定", href: "/profile", icon: User },
    { name: "お問い合わせ", href: "/feedback", icon: MessageSquarePlus },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [navigation, setNavigation] = useState(defaultNavigation)
    const [wellnessMenuOpen, setWellnessMenuOpen] = useState(false)

    const wellnessItems = [
        { name: "身体的健康", href: "/wellness/physical-health", icon: "💪", color: "#10b981" },
        { name: "精神的健康", href: "/wellness/mental-health", icon: "🧠", color: "#8b5cf6" },
        { name: "人間関係", href: "/wellness/relationships", icon: "❤️", color: "#ec4899" },
        { name: "仕事・キャリア", href: "/wellness/career", icon: "💼", color: "#f59e0b" },
        { name: "経済的安定", href: "/wellness/financial", icon: "💰", color: "#06b6d4" },
        { name: "学習・成長", href: "/wellness/learning", icon: "📚", color: "#3b82f6" },
        { name: "趣味・余暇", href: "/wellness/leisure", icon: "🎨", color: "#f97316" },
        { name: "社会貢献", href: "/wellness/contribution", icon: "🤝", color: "#14b8a6" },
        { name: "自己実現", href: "/wellness/self-actualization", icon: "🌟", color: "#a855f7" },
    ]

    useEffect(() => {
        const updateNavigationFromStorage = () => {
            if (typeof window !== 'undefined') {
                const enableAdventure = localStorage.getItem('enableAdventure') === 'false' ? false : true // Default to true if not set

                console.log('[DashboardLayout] Updating navigation...')
                console.log('[DashboardLayout] enableAdventure from localStorage:', enableAdventure)
                console.log('[DashboardLayout] localStorage value (projects):', localStorage.getItem('enableProjects'))
                console.log('[DashboardLayout] localStorage value (adventure):', localStorage.getItem('enableAdventure'))

                // Filter navigation based on settings
                const filteredNavigation = defaultNavigation.filter(item => {
                    if (item.href === '/adventure') {
                        return enableAdventure
                    }
                    return true
                })

                console.log('[DashboardLayout] Filtered navigation items:', filteredNavigation.map(n => n.name))
                setNavigation(filteredNavigation)
            }
        }

        // Initial update from localStorage
        updateNavigationFromStorage()

        // Fetch from API
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/user/settings", {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (res.ok) {
                    const settings = await res.json()
                    console.log('[DashboardLayout] Fetched settings from API:', settings)
                    if (typeof window !== 'undefined') {
                        // Only update localStorage if API returns explicit values
                        // Use explicit boolean check to handle false values correctly
                        if (settings.enableProjects !== undefined) {
                            localStorage.setItem('enableProjects', String(settings.enableProjects))
                        }
                        if (settings.enableAdventure !== undefined) {
                            localStorage.setItem('enableAdventure', String(settings.enableAdventure))
                        }
                        updateNavigationFromStorage()
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings", error)
            }
        }
        fetchSettings()

        // Listen for storage changes from other tabs/windows
        const handleStorageChange = (e: StorageEvent) => {
            console.log('[DashboardLayout] Storage event received:', e.key, e.newValue)
            if (e.key === 'enableProjects' || e.key === 'enableAdventure') {
                updateNavigationFromStorage()
            }
        }

        // Listen for custom events
        const handleCustomEvent = () => {
            updateNavigationFromStorage()
        }

        const handleAdventureEvent = () => {
            updateNavigationFromStorage()
        }

        console.log('[DashboardLayout] Registering event listeners')
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('projectSettingsChanged', handleCustomEvent)
        window.addEventListener('adventureSettingsChanged', handleAdventureEvent)

        return () => {
            console.log('[DashboardLayout] Removing event listeners')
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('projectSettingsChanged', handleCustomEvent)
            window.removeEventListener('adventureSettingsChanged', handleAdventureEvent)
        }
    }, [])

    const handleLogout = async () => {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const currentMeta = pathname
        ? pageMeta[pathname] ?? pageMeta[`/${pathname.split("/")[1]}`]
        : undefined

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
            {/* Noise texture */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02] mix-blend-soft-light"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

            {/* Sidebar - Desktop */}
            <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-20">
                <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white/5 backdrop-blur-xl border-r border-white/10">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <Link href="/">
                            <img src="/journify-logo.png" alt="Journify" className="h-12 w-auto" />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    prefetch={true}
                                    className={cn(
                                        "group relative flex items-center overflow-hidden px-3 py-3 text-sm font-medium rounded-xl transition-all",
                                        isActive
                                            ? "text-white bg-emerald-400/12 border border-emerald-300/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon className="mr-3 flex-shrink-0 h-5 w-5 relative z-10" />
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            )
                        })}

                        {/* Wellness Submenu */}
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <button
                                onClick={() => setWellnessMenuOpen(!wellnessMenuOpen)}
                                className="group flex items-center w-full px-3 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                <Heart className="mr-3 flex-shrink-0 h-5 w-5" />
                                <span className="flex-1 text-left">幸福指標</span>
                                <ChevronDown className={cn(
                                    "h-4 w-4 transition-transform",
                                    wellnessMenuOpen && "rotate-180"
                                )} />
                            </button>
                            {wellnessMenuOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-1 space-y-1 pl-4 max-h-[400px] overflow-y-auto"
                                >
                                    {wellnessItems.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all",
                                                    isActive
                                                        ? "text-white bg-white/10"
                                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <span className="mr-2 text-base">{item.icon}</span>
                                                <span>{item.name}</span>
                                            </Link>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </div>
                    </nav>

                    {/* Bottom Navigation & Logout */}
                    <div className="flex-shrink-0 px-3 pb-4">
                        <div className="space-y-1 mb-2">
                            {bottomNavigation.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        prefetch={true}
                                        className={cn(
                                            "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all relative",
                                            isActive
                                                ? "text-white bg-white/10"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </div>

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
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link href="/" className="shrink-0">
                            <img src="/journify-logo.png" alt="Journify" className="h-9 w-auto" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <WeatherWidget />
                        <NotificationBell />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
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
                        <nav className="flex-1 space-y-2 overflow-y-auto">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        prefetch={true}
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

                            {/* Wellness Submenu - Mobile */}
                            <div className="pt-4 mt-4 border-t border-white/10" id="wellness-mobile-section">
                                <button
                                    onClick={() => {
                                        setWellnessMenuOpen(!wellnessMenuOpen)
                                        // Auto-scroll to show wellness menu after opening
                                        if (!wellnessMenuOpen) {
                                            setTimeout(() => {
                                                const element = document.getElementById('wellness-mobile-section')
                                                element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                            }, 100)
                                        }
                                    }}
                                    className="flex items-center w-full px-4 py-3 text-base font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                >
                                    <Heart className="mr-3 h-6 w-6" />
                                    <span className="flex-1 text-left">幸福指標</span>
                                    <ChevronDown className={cn(
                                        "h-5 w-5 transition-transform",
                                        wellnessMenuOpen && "rotate-180"
                                    )} />
                                </button>
                                {wellnessMenuOpen && (
                                    <div className="mt-1 space-y-1 pl-4">
                                        {wellnessItems.map((item) => {
                                            const isActive = pathname === item.href
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={cn(
                                                        "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                                        isActive
                                                            ? "text-white bg-white/10"
                                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <span className="mr-2 text-lg">{item.icon}</span>
                                                    <span>{item.name}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </nav>

                        <div className="mt-auto pt-4 space-y-2">
                            {bottomNavigation.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        prefetch={true}
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
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-3 text-base font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                <LogOut className="mr-3 h-6 w-6" />
                                <span>ログアウト</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main content */}
            <main className="md:pl-64 pt-[52px] md:pt-0 flex-1">
                {/* Main Content Header with Notification - Desktop Only */}
                <div className="hidden md:block sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
                    <div className="px-4 sm:px-5 lg:px-6 py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            {pathname === "/dashboard" ? (
                                <DashboardGreeting variant="header" />
                            ) : currentMeta ? (
                                <div className="min-w-0">
                                    <h1 className="truncate text-xl font-semibold leading-tight text-white">{currentMeta.title}</h1>
                                    {currentMeta.description && (
                                        <p className="mt-0.5 truncate text-sm text-white/50">{currentMeta.description}</p>
                                    )}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            {pathname === "/dashboard" && <div id="dashboard-layout-actions" className="flex items-center" />}
                            <WeatherWidget />
                            <NotificationBell />
                        </div>
                    </div>
                </div>
                <div className="relative z-10 px-3 py-3 sm:px-5 sm:py-5 lg:px-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
