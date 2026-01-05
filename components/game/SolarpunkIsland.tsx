'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { AvatarDisplay } from './AvatarDisplay'
import { getSoulState, getSoulStateEffects } from '@/lib/game/soulSync'

// Mock data (replace with real data fetching later)
const mockLatestJournal = { mood: 6 } // Example: 'mystical' range

export function SolarpunkIsland() {
    const [growthStage, setGrowthStage] = useState(1)
    // In a real app, this would be derived from user stats/tasks

    return (
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-sky-300 rounded-3xl overflow-hidden border-4 border-white/50 shadow-2xl">
            {/* Background Sky & Clouds */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-100 z-0" />

            {/* Floating Clouds Animation (Simple CSS/Framer) */}
            <motion.div
                className="absolute top-10 left-0 w-32 h-12 bg-white/40 blur-xl rounded-full"
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute top-20 right-0 w-48 h-16 bg-white/30 blur-xl rounded-full"
                animate={{ x: [0, -50, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />

            {/* Island Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/solarpunk-island.png"
                    alt="Solarpunk Sanctuary"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Interactive Elements / Plants Layer */}
            {/* This layer would contain plants that appear as the user progresses */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Example: A growing tree or flower patch could go here based on growthStage */}
            </div>

            {/* Avatar Placement */}
            <div className="absolute bottom-[15%] left-[10%] w-[25%] md:w-[20%] aspect-square z-20">
                <div className="relative w-full h-full transform scale-125 origin-bottom">
                    <AvatarDisplay level={5} name="Gardener" initialGender="male" />
                </div>
            </div>

            {/* UI Overlay (Sanctuary Stats) */}
            <div className="absolute top-4 left-4 z-30 transform scale-75 md:scale-100 origin-top-left">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/50 shadow-lg text-emerald-900">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span>🏝️</span> My Sanctuary
                    </h3>
                    <div className="mt-2 space-y-1">
                        <div className="text-xs font-semibold text-emerald-700/60 uppercase tracking-wider">Island Growth</div>
                        <div className="w-48 h-3 bg-emerald-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500"
                                initial={{ width: 0 }}
                                animate={{ width: "35%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </div>
                        <div className="text-right text-xs text-emerald-600 font-bold">35% Bloom</div>
                    </div>
                </div>
            </div>

            {/* Ambient Particles (Sparkles/Leaves) */}
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                {/* We can add particle effects later */}
            </div>
        </div>
    )
}
