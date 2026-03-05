import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Sparkles } from "lucide-react";

export async function DashboardDataView({ weddingId, guestCount, guestsOpened }: { weddingId: string; guestCount: number; guestsOpened: number }) {

    // Cache Heavy Financial Stats for Dashboard Performance
    const getCachedStats = unstable_cache(
        async (id: string) => {
            return await Promise.all([
                prisma.gift.aggregate({
                    _sum: { amount: true },
                    where: { currency: "USD", weddingId: id },
                }),
                prisma.gift.aggregate({
                    _sum: { amount: true },
                    where: { currency: "KHR", weddingId: id },
                })
            ]);
        },
        [`dashboard-stats-${weddingId}`],
        { revalidate: 300, tags: [`dashboard-stats-${weddingId}`] } // Cache for 5 minutes
    );

    const [gsUSD, gsKHR] = await getCachedStats(weddingId);

    const giftSumUSD = gsUSD;
    const giftSumKHR = gsKHR;

    return (
        <div className="space-y-10">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3 grid-cols-2">
                {[
                    { label: "ភ្ញៀវសរុប", value: guestCount, sub: "បានចុះឈ្មោះ", icon: Users, color: "text-blue-600", bg: "bg-blue-50/50 dark:bg-blue-950/20", border: "border-blue-100 dark:border-blue-900/50" },
                    { label: "ចំណងដៃ USD", value: `$${(giftSumUSD._sum.amount || 0).toLocaleString()}`, sub: "សាច់ប្រាក់ និង ធនាគារ", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50/50 dark:bg-emerald-950/20", border: "border-emerald-100 dark:border-emerald-900/50" },
                    { label: "ចំណងដៃ Riel", value: `${(giftSumKHR._sum.amount || 0).toLocaleString()} ៛`, sub: "សាច់ប្រាក់ និង ធនាគារ", icon: () => <span className="font-bold text-lg">៛</span>, color: "text-foreground", bg: "bg-muted", border: "border-border" }
                ].map((stat, i) => (
                    <Card key={i} className={`border ${stat.border} shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group relative bg-card`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-bl-[4rem] -mr-6 -mt-6 transition-transform group-hover:scale-110 opacity-50`} />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-bold text-muted-foreground font-kantumruy">{stat.label}</CardTitle>
                            <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-sm`}>
                                {(() => {
                                    const Icon = stat.icon as any;
                                    return <Icon size={20} />;
                                })()}
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4">
                            <div className={`text-4xl font-bold font-kantumruy ${stat.color === 'text-emerald-600' ? 'text-emerald-600' : 'text-foreground'}`}>
                                {stat.value}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mt-2 font-kantumruy">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Engagement Mini Chart */}
            <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-card">
                <CardHeader className="pb-8 p-0 mb-8 border-b border-border">
                    <CardTitle className="text-xl font-bold font-kantumruy text-foreground tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        ការវិភាគលទ្ធផល
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-0">
                    <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-3xl border border-border">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="stroke-muted" />
                                <circle
                                    cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8"
                                    strokeDasharray={251.2}
                                    strokeDashoffset={251.2 * (1 - (guestCount > 0 ? (guestsOpened / guestCount) : 0))}
                                    strokeLinecap="round"
                                    className="text-indigo-600 transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-foreground leading-none">
                                    {guestCount > 0 ? Math.round((guestsOpened / guestCount) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-foreground font-kantumruy text-lg">អត្រាអ្នកបើកមើលសំបុត្រ</span>
                            <span className="text-sm font-medium text-muted-foreground font-kantumruy">
                                {guestsOpened} នាក់ បានបើកមើល ក្នុងចំណោម {guestCount} នាក់
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
