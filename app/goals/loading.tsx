import { DashboardLayout } from "@/components/DashboardLayout"

export default function GoalsLoading() {
    return (
        <DashboardLayout>
            {/* Header Skeleton */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="h-10 w-32 bg-white/10 rounded-lg mb-2 animate-pulse"></div>
                    <div className="h-6 w-64 bg-white/5 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-12 w-32 bg-white/10 rounded-xl animate-pulse"></div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-24 animate-pulse"
                    >
                        <div className="h-4 w-20 bg-white/10 rounded mb-2"></div>
                        <div className="h-8 w-16 bg-white/10 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Goals List Skeleton */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-48 animate-pulse"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-white/10 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-6 w-48 bg-white/10 rounded mb-2"></div>
                                <div className="h-4 w-full bg-white/5 rounded mb-4"></div>
                                <div className="h-2 w-full bg-white/10 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
