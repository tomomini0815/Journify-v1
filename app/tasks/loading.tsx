import { DashboardLayout } from "@/components/DashboardLayout"

export default function TasksLoading() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-9 w-48 bg-white/10 rounded-lg mb-2 animate-pulse"></div>
                    <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse"></div>
                </div>

                {/* Tab Navigation Skeleton */}
                <div className="flex gap-2 mb-6">
                    <div className="h-12 w-32 bg-white/10 rounded-xl animate-pulse"></div>
                    <div className="h-12 w-32 bg-white/10 rounded-xl animate-pulse"></div>
                </div>

                {/* Progress Card Skeleton */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 h-32 animate-pulse"></div>

                {/* Add Task Form Skeleton */}
                <div className="mb-8 flex gap-4">
                    <div className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
                    <div className="w-48 h-14 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl animate-pulse"></div>
                </div>

                {/* Task List Skeleton */}
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white/10 border border-white/10 rounded-2xl p-4 h-16 animate-pulse"
                        ></div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
