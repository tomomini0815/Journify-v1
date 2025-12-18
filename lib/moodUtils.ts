export const MOOD_OPTIONS = [
    { value: 1, emoji: '😭', label: 'とても悲しい' },
    { value: 2, emoji: '😢', label: '悲しい' },
    { value: 3, emoji: '😕', label: 'がっかり' },
    { value: 4, emoji: '😐', label: '普通' },
    { value: 5, emoji: '🙂', label: 'まあまあ' },
    { value: 6, emoji: '😊', label: '幸せ' },
    { value: 7, emoji: '😄', label: 'とても幸せ' },
    { value: 8, emoji: '🤩', label: 'ワクワク' },
    { value: 9, emoji: '😌', label: '穏やか' },
    { value: 10, emoji: '🥰', label: '感謝' },
];

export function getMoodEmoji(mood: number | null | undefined): string {
    if (!mood) return '❓';
    const moodOption = MOOD_OPTIONS.find(m => m.value === mood);
    return moodOption?.emoji || '❓';
}

export function getMoodLabel(mood: number | null | undefined): string {
    if (!mood) return '未設定';
    const moodOption = MOOD_OPTIONS.find(m => m.value === mood);
    return moodOption?.label || '未設定';
}

export function normalizeMoodToHappiness(mood: number): number {
    // Convert 1-10 scale to 0-100 scale
    return Math.round((mood / 10) * 100);
}

export function normalizeTextJournalMood(mood: number): number {
    // Convert 1-5 scale to 0-100 scale
    return Math.round((mood / 5) * 100);
}
