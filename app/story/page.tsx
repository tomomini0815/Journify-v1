import type { Metadata } from 'next'
import StoryClient from './StoryClient'

export const metadata: Metadata = {
    title: 'Your Epic Story | Journify',
    description: 'AI-generated narrative of your weekly achievements',
}

export default function StoryPage() {
    return <StoryClient />
}
