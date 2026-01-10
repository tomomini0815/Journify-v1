'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Zap, Star } from 'lucide-react'
import Link from 'next/link'

interface ActiveCompanion {
    id: string
    level: number
    happiness: number
    energy: number
    loyalty: number
    companion: {
        name: string
        species: string
        rarity: string
    }
}

export function ActiveCompanionDisplay() {
    const [companion, setCompanion] = useState<ActiveCompanion | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActiveCompanion()
    }, [])

    const fetchActiveCompanion = async () => {
        try {
            const res = await fetch('/api/user/companions')
            if (res.ok) {
                const data = await res.json()
                setCompanion(data.activeCompanion)
            }
        } catch (error) {
            console.error('Failed to fetch active companion:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !companion) return null

    return (
        <Link href={`/companions/${companion.id}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    {/* Companion Icon */}
                    <div className="text-5xl">
                        {companion.companion.species === 'cat' && '🐱'}
                        {companion.companion.species === 'fox' && '🦊'}
                        {companion.companion.species === 'dragon' && '🐉'}
                        {companion.companion.species === 'bird' && '🐦'}
                        {companion.companion.species === 'wolf' && '🐺'}
                        {companion.companion.species === 'sprite' && '✨'}
                        {!['cat', 'fox', 'dragon', 'bird', 'wolf', 'sprite'].includes(companion.companion.species) && '🌟'}
                    </div>

                    {/* Companion Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{companion.companion.name}</h3>
                            <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                                Lv.{companion.level}
                            </span>
                        </div>

                        {/* Mini Stats */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-pink-400" />
                                <span className="text-white/60">{companion.happiness}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-white/60">{companion.energy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-blue-400" />
                                <span className="text-white/60">{companion.loyalty}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-3 text-xs text-center text-white/40">
                    Click to interact →
                </div>
            </motion.div>
        </Link>
    )
}
