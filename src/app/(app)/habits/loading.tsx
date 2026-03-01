export default function HabitsLoading() {
    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex gap-8">
                <div className="flex-1 space-y-4">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="h-8 w-64 bg-[#111118] rounded-lg animate-pulse mb-2" />
                            <div className="h-4 w-32 bg-[#111118] rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-32 bg-[#111118] rounded-lg animate-pulse" />
                    </div>
                    {/* Habit row skeletons */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-[#111118] rounded-xl animate-pulse" />
                    ))}
                    {/* Grid skeleton */}
                    <div className="h-8 w-48 bg-[#111118] rounded animate-pulse mt-8 mb-4" />
                    <div className="h-48 bg-[#111118] rounded-xl animate-pulse" />
                </div>
                {/* Sidebar skeleton */}
                <div className="w-72 hidden lg:flex flex-col gap-4">
                    <div className="h-32 bg-[#111118] rounded-xl animate-pulse" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-[#111118] rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}
