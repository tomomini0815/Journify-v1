import { notFound } from "next/navigation"
import { getDimension } from "@/lib/wellnessContent"
import { WellnessDimensionContent } from "@/components/WellnessDimensionContent"

interface PageProps {
    params: Promise<{
        dimension: string
    }>
}

export async function generateStaticParams() {
    return [
        { dimension: 'physical-health' },
        { dimension: 'mental-health' },
        { dimension: 'relationships' },
        { dimension: 'career' },
        { dimension: 'financial' },
        { dimension: 'learning' },
        { dimension: 'leisure' },
        { dimension: 'contribution' },
        { dimension: 'self-actualization' },
    ]
}

export default async function WellnessDimensionPage({ params }: PageProps) {
    const { dimension: dimensionId } = await params
    const dimension = getDimension(dimensionId)

    if (!dimension) {
        notFound()
    }

    return <WellnessDimensionContent dimension={dimension} />
}
