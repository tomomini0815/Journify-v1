import React from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TabItem {
    id: string
    label: string | React.ReactNode
    icon?: LucideIcon
    count?: number
}

interface UnifiedTabsProps {
    tabs: TabItem[]
    activeTab: string
    onChange: (id: string) => void
    variant?: 'emerald' | 'indigo' | 'amber'
    className?: string
    layoutId?: string
}

export function UnifiedTabs({
    tabs,
    activeTab,
    onChange,
    variant = 'emerald',
    className,
    layoutId = 'activeTabIndicator'
}: UnifiedTabsProps) {
    const getVariantStyles = (isActive: boolean) => {
        const base = "font-medium transition-all relative whitespace-nowrap flex items-center gap-2"

        if (!isActive) {
            return cn(base, "text-white/40 hover:text-white/60")
        }

        switch (variant) {
            case 'indigo':
                return cn(base, "text-indigo-400")
            case 'amber':
                return cn(base, "text-amber-400")
            case 'emerald':
            default:
                return cn(base, "text-emerald-400")
        }
    }

    const getIndicatorColor = () => {
        switch (variant) {
            case 'indigo': return "bg-indigo-400"
            case 'amber': return "bg-amber-400"
            case 'emerald':
            default: return "bg-emerald-400"
        }
    }

    return (
        <div className={cn("flex gap-1 overflow-x-auto w-full md:w-auto no-scrollbar", className)}>
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn("px-4 md:px-6 py-3", getVariantStyles(isActive))}
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-white/10", isActive ? "opacity-100" : "opacity-60")}>
                                {tab.count}
                            </span>
                        )}

                        {isActive && (
                            <motion.div
                                layoutId={layoutId}
                                className={cn("absolute bottom-0 left-0 right-0 h-0.5", getIndicatorColor())}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
