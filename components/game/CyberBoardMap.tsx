'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { AvatarDisplay } from './AvatarDisplay'

// Define the Node type for our board map
interface MapNode {
    id: string
    name: string
    x: number // Percentage 0-100
    y: number // Percentage 0-100
    type: 'start' | 'station' | 'shop' | 'event'
    color: string
}

// Define the map layout (A simple loop for now)
const MAP_NODES: MapNode[] = [
    { id: 'start', name: 'NEO SHIBUYA', x: 20, y: 75, type: 'start', color: '#10b981' },
    { id: 'station1', name: 'CYBER CAFE', x: 15, y: 45, type: 'station', color: '#3b82f6' },
    { id: 'station2', name: 'TECH HUB', x: 35, y: 25, type: 'station', color: '#8b5cf6' },
    { id: 'shop1', name: 'ITEM SHOP', x: 65, y: 25, type: 'shop', color: '#f59e0b' },
    { id: 'station3', name: 'SKY PORT', x: 85, y: 45, type: 'station', color: '#06b6d4' },
    { id: 'event1', name: 'VIRUS ZONE', x: 80, y: 75, type: 'event', color: '#ef4444' },
    { id: 'station4', name: 'DATA CENTER', x: 50, y: 85, type: 'station', color: '#ec4899' },
]

export function CyberBoardMap() {
    const [currentNodeIndex, setCurrentNodeIndex] = useState(0)
    const [isMoving, setIsMoving] = useState(false)
    const [diceValue, setDiceValue] = useState<number | null>(null)
    const [message, setMessage] = useState<string>('サイコロを振って冒険へ出かけよう！')

    const currentNode = MAP_NODES[currentNodeIndex]

    const handleRollDice = async () => {
        if (isMoving) return

        setIsMoving(true)
        setMessage('Rolling...')

        // Simple dice roll 1-3 for demo (so user doesn't jump too far too fast)
        const roll = Math.floor(Math.random() * 3) + 1
        setDiceValue(roll)

        // Wait a bit for dice animation perception
        await new Promise(r => setTimeout(r, 600))

        setMessage(`出目: ${roll}！進むぞ！`)

        // Move step by step
        for (let i = 0; i < roll; i++) {
            await new Promise(r => setTimeout(r, 500)) // Step duration
            setCurrentNodeIndex(prev => (prev + 1) % MAP_NODES.length)
        }

        setIsMoving(false)
        setDiceValue(null)

        // Arrival Event message
        const nextNode = MAP_NODES[(currentNodeIndex + roll) % MAP_NODES.length]
        setMessage(`${nextNode.name} に到着！`)
    }

    return (
        <div className="relative w-full aspect-[16/9] bg-slate-900 rounded-3xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
            {/* Background Image */}
            <Image
                src="/images/cyber-board-map.png"
                alt="Cyber Board Map"
                fill
                className="object-cover opacity-60"
            />

            {/* Grid Overlay Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [transform:perspective(500px)_rotateX(60deg)_translateY(-100px)_scale(2)] opacity-30 pointer-events-none" />

            {/* Map Nodes & Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                    points={MAP_NODES.concat(MAP_NODES[0]).map(n => `${n.x}%,${n.y}%`).join(' ')}
                    fill="none"
                    stroke="url(#gradient-line)"
                    strokeWidth="4"
                    strokeDasharray="10 5"
                    className="opacity-50"
                />
                <defs>
                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Nodes Render */}
            {MAP_NODES.map((node, index) => (
                <div
                    key={node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                    {/* Station Visual */}
                    <div
                        className="w-8 h-8 rounded-full border-2 bg-black/80 shadow-[0_0_15px_currentColor] transition-all hover:scale-125 cursor-pointer z-10"
                        style={{ borderColor: node.color, color: node.color }}
                    >
                        <div className="w-full h-full rounded-full bg-current opacity-20 animate-pulse" />
                    </div>

                    {/* Station Name Label */}
                    <div className="mt-2 px-2 py-1 bg-black/60 backdrop-blur border border-white/10 rounded text-[10px] text-white/80 whitespace-nowrap opacity-0 md:opacity-100 transition-opacity">
                        {node.name}
                    </div>
                </div>
            ))}

            {/* Player Avatar */}
            <motion.div
                className="absolute z-20 w-16 h-16 md:w-24 md:h-24 -translate-x-1/2 -translate-y-full"
                animate={{
                    left: `${currentNode.x}%`,
                    top: `${currentNode.y}%`,
                }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                }}
            >
                <div className="relative w-full h-full">
                    {/* Reuse existing avatar component but smaller */}
                    <div className="w-full h-full scale-75 origin-bottom">
                        {/* We use a simplified image here instead of full component to avoid layout issues in map */}
                        <div className="relative w-full h-full">
                            <Image
                                src="/images/avatar-adventurer.png" // Hardcoded for simplified view, logic can be added later
                                alt="Player"
                                fill
                                className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </div>
                    {/* Cursor/Pointer Effect */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-500 rounded-full blur-[2px]" />
                </div>
            </motion.div>

            {/* HUD / Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
                {/* Message Log */}
                <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/30 max-w-md pointer-events-auto">
                    <p className="text-cyan-300 font-mono text-sm typing-effect">
                        {'>'} {message}
                    </p>
                </div>

                {/* Dice Button */}
                <button
                    onClick={handleRollDice}
                    disabled={isMoving}
                    className="pointer-events-auto group relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center border-t border-white/20 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 hover:shadow-cyan-500/50"
                >
                    <div className="absolute inset-0 bg-white/10 rounded-xl animate-pulse" />
                    <div className="text-4xl font-black text-white drop-shadow-md">
                        {isMoving ? (diceValue || '🎲') : 'GO'}
                    </div>
                    {/* Label */}
                    <div className="absolute -bottom-8 bg-black/80 px-2 py-0.5 rounded text-xs text-cyan-400 font-bold tracking-widest border border-cyan-500/30">
                        ROLL
                    </div>
                </button>
            </div>
        </div>
    )
}
