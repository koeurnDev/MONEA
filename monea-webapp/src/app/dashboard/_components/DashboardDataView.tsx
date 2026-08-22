import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Users, DollarSign, Sparkles, CheckCircle2, Wand2, Share2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTranslations } from "@/i18n/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Re-compilation trigger: 2026-03-25T13:30:00

// Cache dashboard stats for 30s — reduces DB hits on every reload
const getCachedStats = unstable_cache(
    async (weddingId: string) => {
        const [gCount, gOpened, gConfirmed, gUSD, gKHR] = await Promise.all([
            (prisma as any).$queryRawUnsafe('SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = $1', weddingId),
            (prisma as any).$queryRawUnsafe('SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = $1 AND "views" > 0', weddingId),
            (prisma as any).$queryRawUnsafe('SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = $1 AND "rsvpStatus" = \'CONFIRMED\'', weddingId),
            (prisma as any).$queryRawUnsafe('SELECT COALESCE(SUM("amount"), 0)::float as sum FROM "Gift" WHERE "weddingId" = $1 AND "currency" = \'USD\'', weddingId),
            (prisma as any).$queryRawUnsafe('SELECT COALESCE(SUM("amount"), 0)::float as sum FROM "Gift" WHERE "weddingId" = $1 AND "currency" = \'KHR\'', weddingId)
        ]);
        return {
            guestCount: gCount[0]?.count || 0,
            guestsOpened: gOpened[0]?.count || 0,
            confirmedGuests: gConfirmed[0]?.count || 0,
            giftSumUSD: gUSD[0]?.sum || 0,
            giftSumKHR: gKHR[0]?.sum || 0,
        };
    },
    ['dashboard-stats'],
    { revalidate: 30, tags: ['dashboard-stats'] }
);

export async function DashboardDataView({ weddingId }: { weddingId: string }) {
    const t = getTranslations();

    let guestCount = 0;
    let guestsOpened = 0;
    let confirmedGuests = 0;
    let giftSumUSD = 0;
    let giftSumKHR = 0;

    try {
        const stats = await getCachedStats(weddingId);
        guestCount = stats.guestCount;
        guestsOpened = stats.guestsOpened;
        confirmedGuests = stats.confirmedGuests;
        giftSumUSD = stats.giftSumUSD;
        giftSumKHR = stats.giftSumKHR;
    } catch (e) {
        console.error("[DashboardDataView] Primary SQL Fetch failed, zeroing stats:", e);
    }

    const statsData = [
        { label: t("dashboard.stats.guests"), value: guestCount.toLocaleString(), sub: t("dashboard.stats.guestUnit"), icon: Users, color: "text-foreground", accent: "text-blue-500", bg: "bg-blue-500/10" },
        { label: t("dashboard.stats.cashUSD"), value: `$${(giftSumUSD).toLocaleString()}`, sub: "USD", icon: DollarSign, color: "text-foreground", accent: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: t("dashboard.stats.cashKHR"), value: (giftSumKHR).toLocaleString(), sub: "KHR", icon: () => <span className="font-bold text-sm">៛</span>, color: "text-foreground", accent: "text-rose-500", bg: "bg-rose-500/10" }
    ];

    if (guestCount === 0) {
        return (
            <Card className="border-2 border-dashed border-rose-200 dark:border-rose-900/50 shadow-none rounded-[2.5rem] bg-rose-50/30 dark:bg-rose-950/10 overflow-hidden relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
                
                <CardContent className="p-8 md:p-12 relative z-10">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-rose-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 mb-6">
                                <Sparkles className="w-8 h-8 text-rose-500" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black font-kantumruy tracking-tight">
                                {t("dashboard.quickstart.title", { defaultValue: "សូមស្វាគមន៍មកកាន់ MONEA!" })}
                            </h2>
                            <p className="text-muted-foreground font-medium font-kantumruy max-w-md mx-auto">
                                {t("dashboard.quickstart.description", { defaultValue: "នេះជាជំហានងាយៗ ៣ យ៉ាងដើម្បីចាប់ផ្តើមរៀបចំ និងគ្រប់គ្រងកម្មវិធីរបស់អ្នក។" })}
                            </p>
                        </div>

                        <div className="grid gap-4 mt-8">
                            <Link href="/dashboard/design" className="group">
                                <div className="flex items-center gap-5 p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Wand2 size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black font-kantumruy text-lg text-foreground tracking-tight">1. រចនាធៀប (Design)</h4>
                                        <p className="text-xs font-medium text-muted-foreground font-kantumruy">ជ្រើសរើសពុម្ព (Template) និងកែសម្រួលរូបភាពរបស់អ្នក។</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-indigo-600 rounded-xl"><ArrowRight size={20} /></Button>
                                </div>
                            </Link>

                            <Link href="/dashboard/guests" className="group">
                                <div className="flex items-center gap-5 p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                                        <Plus size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black font-kantumruy text-lg text-foreground tracking-tight">2. បន្ថែមភ្ញៀវ (Add Guests)</h4>
                                        <p className="text-xs font-medium text-muted-foreground font-kantumruy">បញ្ចូលឈ្មោះភ្ញៀវ និងបង្កើតតំណលីង (Link) ផ្ទាល់ខ្លួនសម្រាប់ភ្ញៀវម្នាក់ៗ។</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-rose-600 rounded-xl"><ArrowRight size={20} /></Button>
                                </div>
                            </Link>
                            
                            <div className="flex items-center gap-5 p-5 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 opacity-80">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <Share2 size={24} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black font-kantumruy text-lg text-foreground tracking-tight">3. ផ្ញើចេញ (Share)</h4>
                                    <p className="text-xs font-medium text-muted-foreground font-kantumruy">ថតចម្លង (Copy) តំណលីង ហើយផ្ញើទៅភ្ញៀវរបស់អ្នកតាមរយៈ Telegram។</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview — Horizontal row on mobile */}
            <div className="grid gap-3 grid-cols-3">
                {statsData.map((stat: any, i: number) => (
                    <div key={i} className="relative rounded-2xl md:rounded-3xl bg-card border border-border/60 dark:border-border/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden shadow-sm">
                        {/* Accent top bar */}
                        <div className={cn("h-1 w-full", i === 0 ? "bg-blue-500" : i === 1 ? "bg-emerald-500" : "bg-rose-500")} />
                        <div className="p-3 md:p-5 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                {(() => {
                                    const Icon = stat.icon as any;
                                    return <Icon size={10} className={cn("opacity-70 flex-shrink-0", stat.accent)} />;
                                })()}
                                <p className="text-[8px] md:text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.12em] truncate">{stat.label}</p>
                            </div>
                            <div className="text-base md:text-2xl font-black font-kantumruy tracking-tight text-foreground leading-none mt-0.5">
                                {stat.value}
                            </div>
                            <p className={cn("text-[9px] md:text-[10px] font-bold uppercase tracking-[0.12em]", stat.accent)}>{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Engagement Analysis */}
            <div className="rounded-2xl md:rounded-[2rem] bg-card border border-border/60 dark:border-border/40 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h3 className="text-sm md:text-base font-black font-kantumruy text-foreground tracking-tight">{t("dashboard.stats.analysis")}</h3>
                </div>
                <div className="p-4 md:p-6 flex flex-col sm:flex-row gap-3">
                    {/* Open Rate */}
                    <div className="flex flex-1 items-center gap-4 p-4 bg-muted/30 dark:bg-muted/10 rounded-xl border border-border/40">
                        <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" strokeWidth="3.5" className="stroke-muted/40" />
                                <circle
                                    cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" strokeWidth="3.5"
                                    strokeDasharray={87.96}
                                    strokeDashoffset={87.96 * (1 - (guestCount > 0 ? (guestsOpened / guestCount) : 0))}
                                    strokeLinecap="round"
                                    className="text-indigo-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-black text-foreground">
                                    {guestCount > 0 ? Math.round((guestsOpened / guestCount) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black font-kantumruy text-foreground leading-tight">{t("dashboard.stats.openRate")}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-bold font-kantumruy mt-0.5">{t("dashboard.stats.openedCount", { count: guestsOpened })}</p>
                        </div>
                    </div>

                    {/* Confirmed RSVPs */}
                    <div className="flex flex-1 items-center gap-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 flex-shrink-0">
                            <CheckCircle2 size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-black font-kantumruy text-foreground leading-tight">{t("dashboard.stats.confirmedRSVPs")}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-bold font-kantumruy mt-0.5">{t("dashboard.stats.respondedCount", { count: confirmedGuests })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

