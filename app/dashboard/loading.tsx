import { DashboardLayout } from "@/components/DashboardLayout"

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="dashboard-panel-subtle p-3 h-28 animate-pulse"
                >
                    <div className="h-8 w-8 bg-white/10 rounded-lg mb-3"></div>
                    <div className="h-8 w-16 bg-white/10 rounded mb-1"></div>
                    <div className="h-4 w-24 bg-white/5 rounded"></div>
                </div>
            ))}
        </div>
    )
}

export function ChartsSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-panel p-6 h-[500px] animate-pulse">
                <div className="h-6 w-48 bg-white/10 rounded mb-4"></div>
                <div className="h-full bg-white/5 rounded-2xl"></div>
            </div>
            <div className="dashboard-panel p-6 h-[500px] animate-pulse">
                <div className="h-6 w-48 bg-white/10 rounded mb-4"></div>
                <div className="h-full bg-white/5 rounded-2xl"></div>
            </div>
        </div>
    )
}

export function RecentJournalsSkeleton() {
    return (
        <div className="dashboard-panel p-5 h-full animate-pulse">
            <div className="h-6 w-32 bg-white/10 rounded mb-6"></div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 h-20"></div>
                ))}
            </div>
        </div>
    )
}

export function GoalProgressSkeleton() {
    return (
        <div className="dashboard-panel p-5 h-full animate-pulse">
            <div className="h-6 w-32 bg-white/10 rounded mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-5 w-48 bg-white/10 rounded"></div>
                        <div className="h-2 bg-white/5 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function DashboardLoading() {
    return (
        <DashboardLayout>
            {/* Welcome Section Skeleton */}
            <div className="mb-8">
                <div className="h-10 w-64 bg-white/10 rounded-lg mb-2 animate-pulse"></div>
                <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse"></div>
            </div>

            <StatsSkeleton />
            <ChartsSkeleton />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RecentJournalsSkeleton />
                <GoalProgressSkeleton />
            </div>
        </DashboardLayout>
    )
}
