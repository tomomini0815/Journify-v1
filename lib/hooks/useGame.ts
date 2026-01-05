import { useGame } from '@/components/providers/GameProvider'

// Game Stats Hooks
export function useGameStats() {
    const { stats, isLoading } = useGame()
    return { data: stats, isLoading }
}

export function useAddXP() {
    const { addXP } = useGame()
    return { mutate: addXP }
}

// Quest Hooks
export function useQuests() {
    const { quests, isLoading } = useGame()
    return { data: quests, isLoading }
}

export function useCompleteQuest() {
    const { completeQuest } = useGame()
    return { mutate: completeQuest }
}

export function useClaimQuestReward() {
    const { claimReward } = useGame()
    return { mutate: claimReward }
}

// Achievement Hooks
export function useAchievements() {
    const { achievements, isLoading } = useGame()
    return { data: achievements, isLoading }
}

export function useEquipAchievement() {
    const { equipAchievement } = useGame()
    return { mutate: equipAchievement }
}
