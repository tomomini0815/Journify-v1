'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CompanionCard } from '@/components/CompanionCard'
import { Loader2 } from 'lucide-react'

interface UserCompanion {
    id: string
    nickname: string | null
    level: number
    experience: number
    happiness: number
    energy: number
    loyalty: number
    isActive: boolean
    companion: {
        id: string
        name: string
        species: string
        rarity: string
        description: string
        imageUrl: string
    }
}

interface CompanionsListProps {
    onSelectCompanion: (id: string | null) => void // Pass ID instead of object to refetch fresh data in detail view if needed, or pass object if we have full data. Using ID for consistency with detailed view fetching logic.
}

export function CompanionsList({ onSelectCompanion }: CompanionsListProps) {
    const [companions, setCompanions] = useState<UserCompanion[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCompanions()
    }, [])

    const fetchCompanions = async () => {
        try {
            const res = await fetch('/api/user/companions')
            if (res.ok) {
                const data = await res.json()
                setCompanions(data.companions)
            }
        } catch (error) {
            console.error('Failed to fetch companions:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    マイ・コンパニオン
                </h1>
                <p className="text-white/60">
                    {companions.length} 体の仲間と出会いました
                </p>
            </motion.div>

            {/* Companions Grid */}
            {companions.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <p className="text-2xl text-white/40 mb-4">まだ仲間がいません</p>
                    <p className="text-white/60 mb-6">ガチャで最初の仲間を召喚しましょう！</p>
                    {/* Note: 'Go to dashboard' or 'Go to Shop' or similar action might be better here */}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {companions.map((uc, index) => (
                        <motion.div
                            key={uc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <CompanionCard
                                companion={{
                                    id: uc.id,
                                    name: uc.nickname || uc.companion.name,
                                    species: uc.companion.species,
                                    rarity: uc.companion.rarity,
                                    imageUrl: uc.companion.imageUrl,
                                    level: uc.level,
                                    happiness: uc.happiness,
                                    energy: uc.energy,
                                    loyalty: uc.loyalty,
                                    isActive: uc.isActive
                                }}
                                onClick={() => onSelectCompanion(uc.id)}
                                showStats={true}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
