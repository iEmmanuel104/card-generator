export default function ThroughHerLensLoading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero skeleton */}
            <div className="px-4 pt-12 pb-16 md:pt-20 md:pb-24">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="mx-auto w-24 h-10 bg-[#1a1a1a] rounded animate-pulse" />
                    <div className="mx-auto w-16 h-3 bg-[#1a1a1a] rounded animate-pulse" />
                    <div className="space-y-3">
                        <div className="mx-auto w-48 h-8 bg-[#1a1a1a] rounded animate-pulse" />
                        <div className="mx-auto w-32 h-20 bg-[#1a1a1a] rounded animate-pulse" />
                        <div className="mx-auto w-24 h-12 bg-[#1a1a1a] rounded animate-pulse" />
                    </div>
                    <div className="mx-auto w-80 h-4 bg-[#1a1a1a] rounded animate-pulse" />
                    <div className="flex justify-center gap-8">
                        <div className="w-28 h-4 bg-[#1a1a1a] rounded animate-pulse" />
                        <div className="w-28 h-4 bg-[#1a1a1a] rounded animate-pulse" />
                        <div className="w-36 h-4 bg-[#1a1a1a] rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Partners skeleton */}
            <div className="px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="mx-auto w-40 h-6 bg-[#1a1a1a] rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222] animate-pulse">
                                <div className="w-full h-16 bg-[#222] rounded" />
                                <div className="mx-auto mt-3 w-20 h-3 bg-[#222] rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form skeleton */}
            <div className="px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="mx-auto w-48 h-8 bg-[#1a1a1a] rounded animate-pulse mb-8" />
                    <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#222] space-y-6">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="w-24 h-3 bg-[#222] rounded animate-pulse" />
                                <div className="w-full h-12 bg-[#111] rounded animate-pulse" />
                            </div>
                        ))}
                        <div className="w-full h-14 bg-[#222] rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
