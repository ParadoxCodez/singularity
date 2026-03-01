export default function JournalLoading() {
    return (
        <div className="min-h-screen bg-[#0A0A0F] flex">
            {/* Sidebar skeleton */}
            <div className="w-60 hidden lg:flex flex-col gap-3 p-4 border-r border-white/5">
                <div className="h-28 bg-[#111118] rounded-xl animate-pulse" />
                <div className="h-10 bg-[#111118] rounded-lg animate-pulse" />
                <div className="h-4 w-24 bg-[#111118] rounded animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 bg-[#111118] rounded-lg animate-pulse" />
                ))}
            </div>
            {/* Editor skeleton */}
            <div className="flex-1 max-w-2xl mx-auto px-6 lg:px-10 py-8 space-y-4">
                <div className="h-10 w-64 bg-[#111118] rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-[#111118] rounded animate-pulse" />
                <div className="flex gap-2 mt-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 w-20 bg-[#111118] rounded-full animate-pulse" />
                    ))}
                </div>
                <div className="border-t border-white/5 pt-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-[#111118] rounded-xl animate-pulse" />
                    ))}
                    <div className="h-48 bg-[#111118] rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    )
}
