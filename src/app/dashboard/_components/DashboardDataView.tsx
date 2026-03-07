import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Cache Heavy Financial Stats for Dashboard Performance
// Defined outside to ensure cache key stability across renders
const getCachedStats = (weddingId: string) => unstable_cache(
    async () => {
        return await Promise.all([
            prisma.guest.count({ where: { weddingId } }),
            prisma.guest.count({ where: { weddingId, views: { gt: 0 } } }),
            prisma.guest.count({ where: { weddingId, rsvpStatus: "CONFIRMED" } }),
            prisma.gift.aggregate({
                _sum: { amount: true },
                where: { currency: "USD", weddingId },
            }),
            prisma.gift.aggregate({
                _sum: { amount: true },
                where: { currency: "KHR", weddingId },
            })
        ]);
    },
    [`dashboard-stats-${weddingId}`],
    { revalidate: 120, tags: [`dashboard-stats-${weddingId}`] } // Cache for 2 minutes
)();

export async function DashboardDataView({ weddingId }: { weddingId: string }) {
    const [guestCount, guestsOpened, confirmedGuests, gsUSD, gsKHR] = await getCachedStats(weddingId);

    const giftSumUSD = gsUSD;
    const giftSumKHR = gsKHR;

    const statsData = [
        { label: "ភ្ញៀវ", value: guestCount, sub: "នាក់", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50/50 dark:bg-blue-950/20" },
        { label: "សាច់ប្រាក់ $", value: `$${(giftSumUSD._sum.amount || 0).toLocaleString()}`, sub: "USD", icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
        { label: "សាច់ប្រាក់ ៛", value: `${(giftSumKHR._sum.amount || 0).toLocaleString()}`, sub: "KHR", icon: () => <span className="font-bold text-base">៛</span>, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50/50 dark:bg-indigo-950/20" }
    ];

    return (
        <div className="space-y-10">
            {/* Stats Overview */}
            <div className="grid gap-2 grid-cols-3">
                {statsData.map((stat, i) => (
                    <Card key={i} className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-shadow rounded-2xl overflow-hidden group bg-card">
                        <CardContent className="p-3 md:p-6 text-center">
                            <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                {(() => {
                                    const Icon = stat.icon as any;
                                    return <Icon size={10} className="opacity-30" />;
                                })()}
                                {stat.label}
                            </p>
                            <div className={cn("text-sm md:text-2xl font-black font-kantumruy mb-1", stat.color)}>
                                {stat.value}
                            </div>
                            <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Engagement Mini Chart */}
            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.07)] rounded-[2rem] p-5 md:p-8 bg-card">
                <CardHeader className="pb-8 p-0 mb-8 border-b border-border">
                    <CardTitle className="text-xl font-bold font-kantumruy text-foreground tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        ការវិភាគលទ្ធផល
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-0">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-1 items-center gap-6 p-6 bg-muted/30 rounded-3xl border border-border">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="stroke-muted" />
                                    <circle
                                        cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 * (1 - (guestCount > 0 ? (guestsOpened / guestCount) : 0))}
                                        strokeLinecap="round"
                                        className="text-indigo-600"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-foreground leading-none">
                                        {guestCount > 0 ? Math.round((guestsOpened / guestCount) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-foreground font-kantumruy text-lg">អត្រាអ្នកបើកមើល</span>
                                <span className="text-sm font-medium text-muted-foreground font-kantumruy">
                                    {guestsOpened} នាក់ បានបើកមើល
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-1 items-center gap-6 p-6 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/50">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                                <CheckCircle2 size={32} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-foreground font-kantumruy text-lg">Confirmed RSVPs</span>
                                <span className="text-sm font-medium text-muted-foreground font-kantumruy">
                                    {confirmedGuests} នាក់ បានឆ្លើយតប
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
