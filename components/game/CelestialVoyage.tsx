'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarDisplay } from './AvatarDisplay'
import { FocusTimer } from './FocusTimer'
import { SpaceGacha } from './SpaceGacha'
import { getSoulState, getSoulStateEffects } from '@/lib/game/soulSync'

// Mock data: In a real app, this would come from the database/API via a hook
const mockLatestJournal = { mood: 8 }

type Location = 'ship' | 'planet'

interface PlanetData {
    id: string
    name: string
    image: string
    description: string
    lore: string
    rewards: { xp: number, item: string, icon: string }
}

const PLANETS: PlanetData[] = [
    {
        id: 'mars',
        name: 'Mars (Terraformed)',
        image: '/images/planet-mars-surface.png',
        description: 'The Red Planet, now blooming with life under the Great Domes.',
        lore: 'Once a desolate wasteland, Mars is now the frontier of humanity\'s resilience. The terraforming projects have created lush biomes within the crater cities. Look closely, and you might see the dual moons, Phobos and Deimos, dancing in the pale sky.',
        rewards: { xp: 450, item: 'Red Dust Sample', icon: '🔴' }
    },
    {
        id: 'jupiter',
        name: 'Jupiter Cloud City',
        image: '/images/planet-jupiter-clouds.png',
        description: 'A floating metropolis amidst the eternal storms of the Gas Giant.',
        lore: 'High above the crushing pressure of the deep atmosphere, the Cloud Cities harness the immense electrical storms for energy. The Great Red Spot looms in the distance—a storm that has raged for centuries, reminding us of nature\'s raw power.',
        rewards: { xp: 600, item: 'Storm Essence', icon: '⚡' }
    },
    {
        id: 'mercury',
        name: 'Mercury Solar Forge',
        image: '/images/planet-mercury-surface.png',
        description: 'The Sun-scorched ruins of the ancient Solar Architects.',
        lore: 'Closest to the Sun, this planet endures extreme heat. Yet, it holds the secrets of the ancients who built the Solar Forges to capture pure stellar energy. Proceed with caution; the sunlight here is blindingly bright.',
        rewards: { xp: 800, item: 'Sun Shard', icon: '🔥' }
    },
    {
        id: 'mystic',
        name: 'Mystic Prime',
        image: '/images/planet-surface-mystic.png',
        description: 'A hidden rogue planet thriving with bioluminescent flora.',
        lore: 'A planet not mapped on any star chart. Its ecosystem is powered not by a sun, but by the planet\'s own geothermal and magical core. The plants here glow with a soft, healing light.',
        rewards: { xp: 500, item: 'Lumiflower', icon: '🌸' }
    }
]

export function CelestialVoyage() {
    const [messages, setMessages] = useState<{ id: number, text: string, x: number, y: number }[]>([])
    const [isWarping, setIsWarping] = useState(false)
    const [location, setLocation] = useState<Location>('ship')
    const [currentPlanet, setCurrentPlanet] = useState<PlanetData>(PLANETS[0])

    // Gacha System State
    const [starFragments, setStarFragments] = useState(250) // Initial bonus
    const [isGachaOpen, setIsGachaOpen] = useState(false)

    // Soul Sync: Determine state based on journal
    const soulState = getSoulState(mockLatestJournal)
    const effects = getSoulStateEffects(soulState)

    // Interactive "Knowledge Particles"
    const handleStarClick = (e: React.MouseEvent, type: 'wisdom' | 'energy') => {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const amount = 5
        const text = `+${amount} Star Fragment`
        const newMessage = { id: Date.now(), text, x, y }

        setStarFragments(prev => prev + amount)

        setMessages(prev => [...prev, newMessage])
        setTimeout(() => {
            setMessages(prev => prev.filter(m => m.id !== newMessage.id))
        }, 1000)
    }

    const handleWarpComplete = () => {
        setIsWarping(false)

        // Randomly select a planet
        const randomPlanet = PLANETS[Math.floor(Math.random() * PLANETS.length)]
        setCurrentPlanet(randomPlanet)

        setMessages(prev => [...prev, { id: Date.now(), text: `APPROACHING ${randomPlanet.name.toUpperCase()}... 🪐`, x: 300, y: 100 }])
        // Transition to planet after a brief delay
        setTimeout(() => {
            setLocation('planet')
        }, 2000)
    }

    const returnToShip = () => {
        setLocation('ship')
    }

    const handleSummon = (cost: number) => {
        setStarFragments(prev => Math.max(0, prev - cost))
    }

    return (
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-indigo-950 rounded-3xl overflow-hidden border-4 border-indigo-400/30 shadow-2xl">
            {/* =================================================================================
                SCENE 1: SHIP BRIDGE (Default)
               ================================================================================= */}
            <AnimatePresence mode="wait">
                {location === 'ship' && (
                    <motion.div
                        key="ship"
                        className="absolute inset-0"
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 1 }}
                    >
                        {/* Background Space View */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/celestial-voyage-bg.png"
                                alt="Celestial Voyage Bridge"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Ambient Star Drift & Soul Color Overlay */}
                        <div className={`absolute inset-0 transition-opacity duration-1000 ${isWarping ? 'opacity-80' : 'opacity-20'} bg-black/50`} />

                        {/* Warp Lines Effect */}
                        <AnimatePresence>
                            {isWarping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-10 pointer-events-none"
                                >
                                    <div className="absolute top-1/2 left-1/2 w-[200vw] h-[200vh] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,transparent_0%,transparent_10%,rgba(100,200,255,0.1)_50%,transparent_100%)] animate-pulse" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Interactive Stars */}
                        <motion.div
                            className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full blur-[2px] cursor-pointer hover:scale-150 transition-transform z-20"
                            animate={isWarping
                                ? { x: [-100, 100], opacity: [0, 1, 0], scale: [0.5, 3, 0.5] }
                                : { opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }
                            }
                            transition={{ duration: isWarping ? 0.2 : 3, repeat: Infinity, ease: "linear" }}
                            onClick={(e) => handleStarClick(e, 'wisdom')}
                        >
                            <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping" />
                        </motion.div>

                        {/* Avatar Placement (Ship) */}
                        <div className="absolute bottom-[10%] right-[10%] w-[25%] md:w-[20%] aspect-square z-20">
                            <motion.div
                                className="relative w-full h-full transform scale-125 origin-bottom-right"
                                animate={{ y: [-10, 0, -10], rotate: [0.5, -0.5, 0.5] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <AvatarDisplay level={8} name="Captain" initialGender="male" avatarSet="celestial" />
                            </motion.div>
                        </div>

                        {/* UI Overlay (Ship Stats) */}
                        <div className="absolute top-4 left-4 z-30 transform scale-75 md:scale-100 origin-top-left">
                            <div className="bg-indigo-950/60 backdrop-blur-md rounded-xl p-3 md:p-4 border border-indigo-400/50 shadow-lg text-indigo-100 max-w-[180px] md:max-w-[200px]">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-200 mb-3">
                                    <span>🛸</span> Starship Status
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-mono text-indigo-300/80 mb-1">
                                            <span>MENTAL SHIELD</span>
                                            <span>100%</span>
                                        </div>
                                        <div className="h-1 bg-indigo-900 rounded-full overflow-hidden border border-indigo-500/30">
                                            <div className={`h-full w-full shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-colors duration-1000 ${effects.shieldColor}`} />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-[10px] font-mono text-indigo-300/80 mb-1">
                                            <span>KNOWLEDGE DRIVE</span>
                                            <span className={isWarping ? "text-fuchsia-400 animate-pulse font-bold" : "text-indigo-400"}>
                                                {isWarping ? "WARP SPEED" : "Standby"}
                                            </span>
                                        </div>
                                        <div className="h-1 bg-indigo-900 rounded-full overflow-hidden border border-indigo-500/30">
                                            <motion.div
                                                className="h-full bg-fuchsia-500"
                                                animate={{ width: isWarping ? ["10%", "100%"] : "10%" }}
                                                transition={{ duration: isWarping ? 0.2 : 0, repeat: isWarping ? Infinity : 0 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summon Button */}
                                <button
                                    onClick={() => setIsGachaOpen(true)}
                                    className="w-full mt-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-bold py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <span>🌟</span> Summon Crew
                                </button>
                                <div className="text-center mt-1 text-[10px] text-indigo-300">
                                    Fragments: <span className="text-white font-mono">{starFragments}</span>
                                </div>
                            </div>
                        </div>

                        {/* Focus Timer Overlay */}
                        <div className="absolute top-4 right-4 z-40 transform scale-75 md:scale-100 origin-top-right">
                            <FocusTimer
                                onStart={() => setIsWarping(true)}
                                onStop={() => setIsWarping(false)}
                                onComplete={handleWarpComplete}
                            />
                        </div>
                        {/* Holographic Grid Floor Effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900/40 to-transparent pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* =================================================================================
                SCENE 2: PLANET EXPLORATION
               ================================================================================= */}
            <AnimatePresence mode="wait">
                {location === 'planet' && (
                    <motion.div
                        key="planet"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        {/* Planet Background */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={currentPlanet.image}
                                alt={currentPlanet.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Atmosphere Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10 pointer-events-none" />

                        {/* Avatar Placement (Exploration Mode) */}
                        <div className="absolute bottom-[20%] left-[15%] w-[18%] md:w-[15%] aspect-square z-20">
                            <motion.div
                                className="relative w-full h-full"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 1 }}
                            >
                                <AvatarDisplay level={8} name="Explorer" initialGender="male" avatarSet="celestial" />
                            </motion.div>
                        </div>

                        {/* Discovery UI Dialog */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[95%] max-w-2xl">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="bg-black/60 backdrop-blur-xl border border-fuchsia-500/50 rounded-2xl p-6 md:p-8 text-center shadow-2xl shadow-fuchsia-900/50 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-indigo-500/10" />

                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-md uppercase">
                                        {currentPlanet.name}
                                    </h2>
                                    <div className="w-16 h-1 bg-fuchsia-500 mx-auto mb-4 rounded-full" />

                                    <p className="text-lg text-fuchsia-200 font-bold mb-2">
                                        "{currentPlanet.description}"
                                    </p>

                                    <p className="text-sm text-slate-300 font-medium mb-8 leading-relaxed max-w-lg mx-auto bg-black/30 p-4 rounded-lg border border-white/5">
                                        {currentPlanet.lore}
                                    </p>

                                    <div className="flex justify-center gap-4 mb-8">
                                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 min-w-[100px]">
                                            <div className="text-2xl">✨</div>
                                            <div className="text-sm text-slate-300 font-mono mt-2">+{currentPlanet.rewards.xp} XP</div>
                                        </div>
                                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 min-w-[100px]">
                                            <div className="text-2xl">{currentPlanet.rewards.icon}</div>
                                            <div className="text-sm text-slate-300 font-mono mt-2">{currentPlanet.rewards.item}</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={returnToShip}
                                        className="w-full md:w-auto px-12 py-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-[1.02]"
                                    >
                                        Return to Ship
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Toast Messages */}
            <AnimatePresence>
                {messages.map(msg => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: 1, y: -20, scale: 1 }}
                        exit={{ opacity: 0, y: -40 }}
                        className="absolute text-xs font-bold text-white pointer-events-none z-50 drop-shadow-md"
                        style={{ left: msg.x, top: msg.y }}
                    >
                        {msg.text}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Gacha Modal */}
            <SpaceGacha
                isOpen={isGachaOpen}
                onClose={() => setIsGachaOpen(false)}
                starFragments={starFragments}
                onSummon={handleSummon}
            />
        </div >
    )
}
