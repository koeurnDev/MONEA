import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTranslations } from "@/i18n/server";

// Re-compilation trigger: 2026-03-25T13:30:00
export async function DashboardDataView({ weddingId }: { weddingId: string }) {
    const t = getTranslations();
    
    // Explicitly using Raw SQL for all counts/aggregates to bypass Prisma Client sync issues on Windows
    let guestCount = 0;
    let guestsOpened = 0;
    let confirmedGuests = 0;
    let giftSumUSD = 0;
    let giftSumKHR = 0;

    try {
        // Parallel fetching with Raw SQL
        const [gCount, gOpened, gConfirmed, gUSD, gKHR] = await Promise.all([
            (prisma as any).$queryRawUnsafe('SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = $1', weddingId),
            (prisma as any).$queryRawUnsafe('SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = $1 AND "views" > 0', weddingId),
            (prisma as any).$queryRawUnsafe('SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = $1 AND "rsvpStatus" = \'CONFIRMED\'', weddingId),
            (prisma as any).$queryRawUnsafe('SELECT COALESCE(SUM("amount"), 0)::float as sum FROM "Gift" WHERE "weddingId" = $1 AND "currency" = \'USD\'', weddingId),
            (prisma as any).$queryRawUnsafe('SELECT COALESCE(SUM("amount"), 0)::float as sum FROM "Gift" WHERE "weddingId" = $1 AND "currency" = \'KHR\'', weddingId)
        ]);

        guestCount = gCount[0]?.count || 0;
        guestsOpened = gOpened[0]?.count || 0;
        confirmedGuests = gConfirmed[0]?.count || 0;
        giftSumUSD = gUSD[0]?.sum || 0;
        giftSumKHR = gKHR[0]?.sum || 0;

    } catch (e) {
        console.error("[DashboardDataView] Primary SQL Fetch failed, zeroing stats:", e);
    }

    const statsData = [
        { label: t("dashboard.stats.guests"), value: guestCount, sub: t("dashboard.stats.guestUnit"), icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50/50 dark:bg-blue-950/20" },
        { label: t("dashboard.stats.cashUSD"), value: `$${(giftSumUSD).toLocaleString()}`, sub: "USD", icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
        { label: t("dashboard.stats.cashKHR"), value: `${(giftSumKHR).toLocaleString()}`, sub: "KHR", icon: () => <span className="font-bold text-base">៛</span>, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50/50 dark:bg-indigo-950/20" }
    ];

    return (
        <div className="space-y-10">
            {/* Stats Overview */}
            <div className="grid gap-3 grid-cols-3">
                {statsData.map((stat, i) => (
                    <Card key={i} className="border-none shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all rounded-3xl overflow-hidden group bg-card">
                        <CardContent className="p-4 md:p-6 text-center">
                            <p className="text-[9px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-1.5">
                                {(() => {
                                    const Icon = stat.icon as any;
                                    return <Icon size={11} className="opacity-50" />;
                                })()}
                                {stat.label}
                            </p>
                            <div className={cn("text-xl md:text-3xl font-black font-kantumruy mb-1.5 tracking-tight", stat.color)}>
                                {stat.value}
                            </div>
                            <p className="text-[10px] md:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.15em] font-kantumruy">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Engagement Mini Chart */}
            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none rounded-[2.5rem] p-5 md:p-8 bg-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                <CardHeader className="pb-8 p-0 mb-8 border-b border-border/50">
                    <CardTitle className="text-xl md:text-2xl font-black font-kantumruy text-foreground tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 rounded-2xl">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        {t("dashboard.stats.analysis")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-0">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-1 items-center gap-6 p-6 bg-muted/20 dark:bg-muted/10 rounded-[2rem] border border-border/50 transition-all hover:bg-muted/30">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="10" className="stroke-muted/30" />
                                    <circle
                                        cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="10"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 * (1 - (guestCount > 0 ? (guestsOpened / guestCount) : 0))}
                                        strokeLinecap="round"
                                        className="text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-foreground leading-none tracking-tighter">
                                        {guestCount > 0 ? Math.round((guestsOpened / guestCount) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="font-black text-foreground font-kantumruy text-lg leading-tight uppercase tracking-tight">{t("dashboard.stats.openRate")}</span>
                                <span className="text-xs font-bold text-muted-foreground/70 font-kantumruy">
                                    {t("dashboard.stats.openedCount", { count: guestsOpened })}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-1 items-center gap-6 p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 transition-all hover:bg-emerald-500/10">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-[1.25rem] flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
                                <CheckCircle2 size={32} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="font-black text-foreground font-kantumruy text-lg leading-tight uppercase tracking-tight">{t("dashboard.stats.confirmedRSVPs")}</span>
                                <span className="text-xs font-bold text-muted-foreground/70 font-kantumruy">
                                    {t("dashboard.stats.respondedCount", { count: confirmedGuests })}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

