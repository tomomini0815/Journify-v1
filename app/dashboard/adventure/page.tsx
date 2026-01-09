'use client'

import { useState } from 'react'
import { GameDashboard } from "@/components/GameDashboard"
import { SolarpunkIsland } from "@/components/game/SolarpunkIsland"
import { CelestialVoyage } from "@/components/game/CelestialVoyage"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

type Theme = 'solarpunk' | 'celestial'

export default function AdventurePage() {
    const [theme, setTheme] = useState<Theme>('celestial')

    const isSolarpunk = theme === 'solarpunk'

    return (
        <div className={`min-h-screen transition-colors duration-1000 overflow-hidden relative ${isSolarpunk ? 'bg-sky-50 text-slate-800 selection:bg-emerald-200' : 'bg-[#050B14] text-white selection:bg-indigo-500/30'
            }`}>
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000">
                <div className={`absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-white transition-opacity duration-1000 ${isSolarpunk ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#050B14] to-black transition-opacity duration-1000 ${isSolarpunk ? 'opacity-0' : 'opacity-100'}`} />

                {/* Celestial Stars */}
                {!isSolarpunk && (
                    <div className="absolute inset-0">
                        <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse" />
                        <div className="absolute top-40 right-40 w-1 h-1 bg-blue-200 rounded-full blur-[1px] animate-pulse delay-75" />
                        <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-indigo-300 rounded-full blur-[1px] animate-pulse delay-150" />
                        <div className="absolute top-1/2 right-10 w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse delay-300" />
                    </div>
                )}
            </div>

            {/* Cloud Decorations (Solarpunk only) */}
            <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-1000 ${isSolarpunk ? 'opacity-50' : 'opacity-0'}`}>
                <div className="absolute top-20 left-[10%] w-64 h-64 bg-white rounded-full blur-3xl opacity-60" />
                <div className="absolute top-40 right-[20%] w-96 h-96 bg-white rounded-full blur-3xl opacity-40" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 lg:p-12">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-2 transition-colors uppercase tracking-widest text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm shadow-sm ${isSolarpunk
                            ? 'text-emerald-700 hover:text-emerald-500 bg-white/50'
                            : 'text-indigo-300 hover:text-indigo-100 bg-indigo-900/40 border border-indigo-500/30'
                            }`}
                    >
                        ← Back to Dashboard
                    </Link>

                    {/* World Switcher */}
                    <div className={`flex p-1 rounded-full border backdrop-blur-md ${isSolarpunk ? 'bg-white/40 border-emerald-100' : 'bg-indigo-950/60 border-indigo-500/30'
                        }`}>
                        <button
                            onClick={() => setTheme('celestial')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!isSolarpunk
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                : 'text-slate-400 hover:text-indigo-600'
                                }`}
                        >
                            🚀 Space
                        </button>
                        <button
                            onClick={() => setTheme('solarpunk')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isSolarpunk
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'text-slate-500 hover:text-emerald-600'
                                }`}
                        >
                            🌿 Garden
                        </button>
                    </div>
                </div>

                {/* Theme Header */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-12 relative text-center md:text-left"
                    >
                        <h1 className={`text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text mb-2 filter drop-shadow-sm ${isSolarpunk
                            ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500'
                            : 'bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300'
                            }`}>
                            {isSolarpunk ? 'SKY SANCTUARY' : 'CELESTIAL VOYAGE'}
                            <span className="ml-4 align-middle text-sm uppercase tracking-wider font-bold border rounded px-2 py-1 align-middle opacity-60">Beta</span>
                        </h1>
                        <p className={`font-medium text-sm md:text-base max-w-2xl tracking-wide md:ml-1 ${isSolarpunk ? 'text-slate-500' : 'text-indigo-200/60'
                            }`}>
                            {isSolarpunk
                                ? 'Cultivate your floating island. Complete tasks to let nature bloom. （現在ベータ版として機能拡張中です）'
                                : 'Navigate the cosmos. Complete tasks to fuel your warp drive. （現在ベータ版として機能拡張中です）'}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Visual Stage Section */}
                <div className="mb-8 md:mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={theme}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isSolarpunk ? <SolarpunkIsland /> : <CelestialVoyage />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Game Interface (Stats & Quests) */}
                <div className="relative">
                    {/* Glass Panel Effect */}
                    <div className={`absolute inset-0 backdrop-blur-xl rounded-3xl border shadow-xl z-0 transition-colors duration-500 ${isSolarpunk
                        ? 'bg-white/40 border-white/60'
                        : 'bg-indigo-950/40 border-indigo-500/20'
                        }`} />

                    <div className="relative z-10 p-6 md:p-8">
                        <GameDashboard variant={theme} />
                    </div>
                </div>
            </div>
        </div>
    )
}
