
export type SoulState = 'sunny' | 'rainy' | 'stormy' | 'mystical' | 'neutral'

interface JournalEntry {
    mood?: number | null
    content?: string
    sentiment?: string // 'positive' | 'neutral' | 'negative'
}

export function getSoulState(journal?: JournalEntry | null): SoulState {
    if (!journal) return 'neutral'

    // 1. Priority: Mood Score (1-10)
    if (journal.mood !== undefined && journal.mood !== null) {
        if (journal.mood >= 8) return 'sunny'      // High energy/happiness
        if (journal.mood >= 5) return 'mystical'   // Calm/balanced
        if (journal.mood >= 3) return 'rainy'      // Melancholic/Low energy
        return 'stormy'                            // Stressed/Upset
    }

    // 2. Fallback: Sentiment Analysis string (if available from Voice Journal AI)
    if (journal.sentiment) {
        if (journal.sentiment === 'positive') return 'sunny'
        if (journal.sentiment === 'negative') return 'stormy'
        return 'mystical'
    }

    return 'neutral'
}

export function getSoulStateEffects(state: SoulState) {
    switch (state) {
        case 'sunny':
            return {
                weather: 'clear',
                islandOverlay: 'bg-yellow-500/10',
                shieldColor: 'bg-cyan-400',
                message: 'Your soul is radiant today.'
            }
        case 'rainy':
            return {
                weather: 'rain',
                islandOverlay: 'bg-blue-900/20',
                shieldColor: 'bg-blue-500',
                message: 'Gentle rain nurtures growth.'
            }
        case 'stormy':
            return {
                weather: 'storm',
                islandOverlay: 'bg-slate-900/40',
                shieldColor: 'bg-red-500', // Strong shield needed
                message: 'Storms make roots stronger.'
            }
        case 'mystical':
            return {
                weather: 'mist',
                islandOverlay: 'bg-purple-500/10',
                shieldColor: 'bg-purple-400',
                message: 'A mysterious calm surrounds you.'
            }
        case 'neutral':
        default:
            return {
                weather: 'clear',
                islandOverlay: 'bg-transparent',
                shieldColor: 'bg-indigo-400',
                message: 'The skies are calm.'
            }
    }
}
