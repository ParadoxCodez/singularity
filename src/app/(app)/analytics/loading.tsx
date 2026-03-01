export default function AnalyticsLoading() {
    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <div className="h-10 w-36 bg-[#111118] rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-48 bg-[#111118] rounded animate-pulse mb-8" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-[#111118] rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-56 bg-[#111118] rounded-xl animate-pulse mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                    <div className="lg:col-span-3 h-72 bg-[#111118] rounded-xl animate-pulse" />
                    <div className="lg:col-span-2 h-72 bg-[#111118] rounded-xl animate-pulse" />
                </div>
                <div className="h-64 bg-[#111118] rounded-xl animate-pulse" />
            </div>
        </div>
    )
}
