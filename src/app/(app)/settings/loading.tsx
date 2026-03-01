export default function SettingsLoading() {
    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
                <div className="h-10 w-32 bg-[#111118] rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-56 bg-[#111118] rounded animate-pulse mb-8" />
                <div className="flex gap-8">
                    <div className="w-52 hidden lg:flex flex-col gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-10 bg-[#111118] rounded-lg animate-pulse" />
                        ))}
                    </div>
                    <div className="flex-1 h-96 bg-[#111118] rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    )
}
