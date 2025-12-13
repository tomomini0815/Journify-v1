import { notFound } from "next/navigation"
import { getDimension } from "@/lib/wellnessContent"
import { WellnessDimensionContent } from "@/components/WellnessDimensionContent"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        dimension: string
    }>
}

export default async function WellnessDimensionPage({ params }: PageProps) {
    const { dimension: dimensionId } = await params
    const dimension = getDimension(dimensionId)

    if (!dimension) {
        notFound()
    }

    return <WellnessDimensionContent dimension={dimension} />
}
