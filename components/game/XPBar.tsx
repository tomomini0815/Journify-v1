'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface XPBarProps {
    currentXP: number
    xpForNextLevel: number
    level: number
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
    animated?: boolean
}

export function XPBar({
    currentXP,
    xpForNextLevel,
    level,
    showLabel = true,
    size = 'md',
    animated = true
}: XPBarProps) {
    const [displayXP, setDisplayXP] = useState(0)
    const progress = Math.min(100, (currentXP / xpForNextLevel) * 100)

    // Animate XP counter
    useEffect(() => {
        if (!animated) {
            setDisplayXP(currentXP)
            return
        }

        const duration = 1000 // 1 second
        const steps = 60
        const increment = currentXP / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= currentXP) {
                setDisplayXP(currentXP)
                clearInterval(timer)
            } else {
                setDisplayXP(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [currentXP, animated])

    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    }

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    }

    return (
        <div className="w-full">
            {showLabel && (
                <div className={`flex justify-between items-center mb-2 ${textSizeClasses[size]}`}>
                    <span className="font-semibold text-white/80">
                        レベル {level}
                    </span>
                    <span className="text-white/60">
                        {displayXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                    </span>
                </div>
            )}

            <div className={`relative ${sizeClasses[size]} bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20`}>
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 blur-sm" />

                {/* Progress bar */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500 bg-[length:200%_100%]"
                    initial={{ width: 0 }}
                    animate={{
                        width: `${progress}%`,
                        backgroundPosition: animated ? ['0% 0%', '100% 0%'] : '0% 0%'
                    }}
                    transition={{
                        width: { duration: 0.8, ease: 'easeOut' },
                        backgroundPosition: {
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear'
                        }
                    }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>

                {/* Glow effect on progress */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 to-emerald-400/50 blur-md"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>

            {/* Progress percentage (optional) */}
            {size === 'lg' && (
                <div className="mt-1 text-center">
                    <span className="text-xs text-white/40">
                        {progress.toFixed(1)}%
                    </span>
                </div>
            )}
        </div>
    )
}

// Shimmer animation
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`

// Inject keyframes
if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = shimmerKeyframes
    document.head.appendChild(style)
}
