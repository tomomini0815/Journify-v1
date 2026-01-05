'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FocusTimerProps {
    onStart?: () => void
    onStop?: () => void
    onComplete?: () => void
}

export function FocusTimer({ onStart, onStop, onComplete }: FocusTimerProps) {
    const WORK_TIME = 25 * 60 // 25 minutes in seconds
    const [isActive, setIsActive] = useState(false)
    const [secondsLeft, setSecondsLeft] = useState(WORK_TIME)

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft((time) => time - 1)
            }, 1000)
        } else if (secondsLeft === 0) {
            if (interval) clearInterval(interval)
            setIsActive(false)
            onComplete?.()
            setSecondsLeft(WORK_TIME) // Reset
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, secondsLeft, onComplete, WORK_TIME])

    const toggleTimer = () => {
        if (!isActive) {
            setIsActive(true)
            onStart?.()
        } else {
            setIsActive(false)
            setSecondsLeft(WORK_TIME) // Reset on stop (or pause? Request implies "emergency stop")
            onStop?.()
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="bg-indigo-950/80 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-indigo-500/20">
            <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Circular Progress (Simple SVG) */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#312e81" strokeWidth="4" fill="none" />
                    <circle
                        cx="32" cy="32" r="28"
                        stroke={isActive ? "#f472b6" : "#4ade80"}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="176"
                        strokeDashoffset={176 - (176 * secondsLeft) / WORK_TIME}
                        className="transition-all duration-1000 linear"
                    />
                </svg>
                <span className="text-xs font-mono font-bold text-white z-10">
                    {Math.floor(secondsLeft / 60)}m
                </span>
            </div>

            <div className="flex-1">
                <div className="text-2xl font-mono font-bold text-white tracking-widest leading-none">
                    {formatTime(secondsLeft)}
                </div>
                <div className="text-[10px] text-indigo-300 uppercase tracking-wider mt-1">
                    {isActive ? 'WARP ENGAGED' : 'SYSTEM READY'}
                </div>
            </div>

            <button
                onClick={toggleTimer}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                    }`}
            >
                {isActive ? '⏹' : '▶'}
            </button>
        </div>
    )
}
