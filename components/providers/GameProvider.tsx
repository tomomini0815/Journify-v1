'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Quest, UserQuestProgress } from '@/lib/game/questSystem'

// Define Types for Context
interface GameStats {
    level: number
    totalXP: number
    xp: number
    gold: number
    crystals: number
    currentStreak: number
    strength: number
    vitality: number
    intelligence: number
    charisma: number
    luck: number
    spirit: number
}

interface QuestsData {
    daily: (Quest & { progress?: UserQuestProgress })[]
    weekly: (Quest & { progress?: UserQuestProgress })[]
}

interface Achievement {
    id: string
    title: string
    description: string
    icon: string
    unlockedAt?: string
    isEquipped?: boolean
    // Add other fields as necessary
}

interface GameContextType {
    stats: GameStats | null
    quests: QuestsData | null
    achievements: Achievement[] | null
    isLoading: boolean
    addXP: (xp: number) => Promise<void>
    completeQuest: (questId: string) => Promise<void>
    claimReward: (questId: string) => Promise<void>
    equipAchievement: (achievementId: string) => Promise<void>
    refreshData: () => Promise<void>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function useGame() {
    const context = useContext(GameContext)
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider')
    }
    return context
}

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [stats, setStats] = useState<GameStats | null>(null)
    const [quests, setQuests] = useState<QuestsData | null>(null)
    const [achievements, setAchievements] = useState<Achievement[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [statsRes, questsRes, achievementsRes] = await Promise.all([
                fetch('/api/game/stats'),
                fetch('/api/game/quests'),
                fetch('/api/game/achievements')
            ])

            if (statsRes.ok) setStats(await statsRes.json())
            if (questsRes.ok) setQuests(await questsRes.json())
            if (achievementsRes.ok) setAchievements(await achievementsRes.json())

        } catch (error) {
            console.error("Failed to fetch game data", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const refreshData = async () => {
        // Background refresh without setting full loading state if desired, 
        // but for simplicity reusing fetchData logic or parts of it.
        // Let's just re-fetch stats and quests as they change most often.
        try {
            const [statsRes, questsRes] = await Promise.all([
                fetch('/api/game/stats'),
                fetch('/api/game/quests')
            ])
            if (statsRes.ok) setStats(await statsRes.json())
            if (questsRes.ok) setQuests(await questsRes.json())
            const achievementsRes = await fetch('/api/game/achievements')
            if (achievementsRes.ok) setAchievements(await achievementsRes.json())
        } catch (error) {
            console.error("Failed to refresh game data", error)
        }
    }

    const addXP = async (xp: number) => {
        try {
            const res = await fetch('/api/game/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xp })
            })
            if (!res.ok) throw new Error('Failed to add XP')
            await refreshData()
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const completeQuest = async (questId: string) => {
        try {
            const res = await fetch('/api/game/quests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId, action: 'complete' })
            })
            if (!res.ok) throw new Error('Failed to complete quest')
            await refreshData()
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const claimReward = async (questId: string) => {
        try {
            const res = await fetch('/api/game/quests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId, action: 'claim' })
            })
            if (!res.ok) throw new Error('Failed to claim reward')
            await refreshData()
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const equipAchievement = async (achievementId: string) => {
        try {
            const res = await fetch('/api/game/achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievementId })
            })
            if (!res.ok) throw new Error('Failed to equip achievement')
            // Only need to refresh achievements
            const achievementsRes = await fetch('/api/game/achievements')
            if (achievementsRes.ok) setAchievements(await achievementsRes.json())
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    return (
        <GameContext.Provider value={{
            stats,
            quests,
            achievements,
            isLoading,
            addXP,
            completeQuest,
            claimReward,
            equipAchievement,
            refreshData
        }}>
            {children}
        </GameContext.Provider>
    )
}
