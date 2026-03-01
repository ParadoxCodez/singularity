export default function SpendingLoading() {
    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <div className="h-10 w-40 bg-[#111118] rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-28 bg-[#111118] rounded animate-pulse mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-28 bg-[#111118] rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="h-64 bg-[#111118] rounded-xl animate-pulse" />
                        <div className="h-4 w-36 bg-[#111118] rounded animate-pulse" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 bg-[#111118] rounded-xl animate-pulse" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div className="h-64 bg-[#111118] rounded-xl animate-pulse" />
                        <div className="h-48 bg-[#111118] rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )
}
