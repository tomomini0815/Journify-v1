'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export type AvatarSet = 'cyberpunk' | 'solarpunk' | 'celestial'

interface AvatarDisplayProps {
    level: number
    name?: string
    initialGender?: 'male' | 'female'
    avatarSet?: AvatarSet
}

export function AvatarDisplay({ level, name = 'Player', initialGender = 'male', avatarSet = 'solarpunk' }: AvatarDisplayProps) {
    const [gender, setGender] = useState<'male' | 'female'>(initialGender)

    const toggleGender = () => {
        setGender(prev => prev === 'male' ? 'female' : 'male')
    }

    const currentSrc = avatarSet === 'celestial'
        ? (gender === 'male' ? "/images/avatar-celestial-male.png" : "/images/avatar-celestial-female.png")
        : (avatarSet === 'solarpunk'
            ? (gender === 'male' ? "/images/avatar-solarpunk.png" : "/images/avatar-solarpunk-female.png")
            : (gender === 'male' ? "/images/avatar-adventurer.png" : "/images/avatar-adventurer-female.png")
        )

    // Theme specific styles
    const styles = {
        solarpunk: {
            aura: "from-emerald-500/20 to-sky-400/20",
            levelBg: "bg-gradient-to-br from-emerald-400 to-green-600 border-green-200",
            levelText: "text-green-100",
            nameBg: "bg-white/10 border-white/30",
            nameText: "text-white",
            accent: "text-emerald-300",
            subText: "text-emerald-100",
            role: "Sky Gardener",
            symbol: "🌿",
            decoration: "✦"
        },
        celestial: {
            aura: "from-indigo-500/20 to-purple-500/20",
            levelBg: "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-300/50",
            levelText: "text-indigo-100",
            nameBg: "bg-indigo-950/40 border-indigo-400/30",
            nameText: "text-white",
            accent: "text-indigo-300",
            subText: "text-indigo-200",
            role: "Star Captain",
            symbol: "⭐",
            decoration: "🚀"
        },
        cyberpunk: {
            aura: "from-cyan-500/20 to-purple-500/20",
            levelBg: "bg-black/80 border-cyan-400",
            levelText: "text-cyan-400",
            nameBg: "bg-black/80 border-cyan-500/30",
            nameText: "text-white",
            accent: "text-cyan-500",
            subText: "text-cyan-500/60",
            role: "Netrunner",
            symbol: "⚡",
            decoration: "< />"
        }
    }[avatarSet]

    return (
        <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Background Aura */}
            <div className={`absolute inset-0 bg-gradient-to-t ${styles.aura} rounded-full blur-3xl animate-pulse`} />

            {/* Avatar Image Container */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
                transition={{
                    scale: { duration: 0.5 },
                    opacity: { duration: 0.5 },
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }}
                className="relative w-full h-full z-10 pb-8 md:pb-0" // Added pb-8 to lift image on mobile
            >
                <Image
                    src={currentSrc}
                    alt={`${avatarSet} Avatar`}
                    fill
                    className="object-contain object-bottom md:object-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    priority
                />

                {/* Gender Toggle Button */}
                <button
                    onClick={toggleGender}
                    className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/20 backdrop-blur-md p-1.5 md:p-2 rounded-full border border-white/40 text-white hover:bg-white/30 transition-all z-50 shadow-lg text-xs md:text-base"
                    title="Switch Gender"
                >
                    {gender === 'male' ? '👨' : '👩'}
                </button>
            </motion.div>

            {/* Level Badge */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-0 left-0 z-20 transform scale-75 md:scale-100 origin-top-left"
            >
                <div className="relative">
                    <div className={`absolute inset-0 blur-md rounded-full opacity-60 ${avatarSet === 'solarpunk' ? 'bg-emerald-500' : avatarSet === 'celestial' ? 'bg-indigo-500' : 'bg-cyan-500'}`}></div>
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-xl ${styles.levelBg}`}>
                        <div className="flex flex-col items-center leading-none text-white">
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${styles.levelText}`}>Level</span>
                            <span className="text-2xl font-black drop-shadow-sm">{level}</span>
                        </div>
                    </div>
                    {/* Decoration */}
                    <div className="absolute -top-1 -right-1 text-xl drop-shadow-md">{styles.symbol}</div>
                </div>
            </motion.div>

            {/* Name Plate */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-[90%]"
            >
                <div className={`relative backdrop-blur-lg border px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-center shadow-xl overflow-hidden group hover:bg-white/20 transition-all ${styles.nameBg}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    <h3 className={`text-sm md:text-xl font-bold tracking-wide flex items-center justify-center gap-2 drop-shadow-md ${styles.nameText}`}>
                        <span className={styles.accent}>{avatarSet === 'cyberpunk' ? '<' : styles.decoration}</span>
                        {name}
                        <span className={styles.accent}>{avatarSet === 'cyberpunk' ? '/>' : styles.decoration}</span>
                    </h3>
                    <p className={`text-[9px] md:text-xs mt-0.5 font-medium tracking-widest uppercase ${styles.subText}`}>
                        {styles.role}
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
