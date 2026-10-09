import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Sparkles, MessageSquare, Wand2, Share2, Plus } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { moneaClient } from "@/lib/api-client";
import { AlertCircle, RefreshCw } from "lucide-react";

export function DashboardDataView({ weddingId, canShareInvitation }: { weddingId: string; canShareInvitation: boolean }) {
    const { t } = useTranslation();
    const [loadError, setLoadError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);
    const [stats, setStats] = useState({
        guestCount: 0,
        checkedInGuests: 0,
        guestbookEntries: 0,
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let active = true;
        setLoaded(false);
        setLoadError(false);

        const loadStats = async () => {
            try {
                const response = await moneaClient.get<{
                    data: {
                        totalGuests: number;
                        checkInCount: number;
                        wishesCount: number;
                    };
                }>(`/api/dashboard/stats?weddingId=${encodeURIComponent(weddingId)}`);
                const data = response.data?.data;
                if (
                    response.error ||
                    !data ||
                    ![data.totalGuests, data.checkInCount, data.wishesCount]
                        .every((value) => typeof value === "number" && Number.isFinite(value))
                ) {
                    throw new Error(response.error || "Dashboard stats response was incomplete");
                }
                if (!active) return;

                setStats({
                    guestCount: data.totalGuests,
                    checkedInGuests: data.checkInCount,
                    guestbookEntries: data.wishesCount,
                });
            } catch (error) {
                console.error("[Dashboard] Failed to load stats:", error);
                if (active) setLoadError(true);
            } finally {
                if (active) setLoaded(true);
            }
        };

        void loadStats();
        return () => {
            active = false;
        };
    }, [weddingId, retryKey]);

    const { guestCount, checkedInGuests, guestbookEntries } = stats;
    const checkInRate = guestCount > 0 ? Math.min(checkedInGuests / guestCount, 1) : 0;

    if (!loaded) {
        return (
            <div className="h-36 w-full animate-pulse rounded-2xl border border-border/60 bg-muted md:rounded-[2rem]">
                <div className="h-14 border-b border-border/50" />
                <div className="flex gap-3 p-4">
                    <div className="h-16 flex-1 rounded-xl bg-background/60" />
                    <div className="h-16 flex-1 rounded-xl bg-background/60" />
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <Card className="rounded-2xl border border-rose-200 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/5">
                <CardContent className="flex flex-col items-center gap-3 px-5 py-8 text-center" role="alert">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="font-kantumruy text-base font-bold text-foreground">
                            {t("dashboard.stats.loadError", { defaultValue: "មិនអាចទាញយកស្ថិតិ Dashboard បានទេ" })}
                        </h2>
                        <p className="font-kantumruy text-sm text-muted-foreground">
                            {t("dashboard.stats.loadErrorSub", { defaultValue: "សូមពិនិត្យការតភ្ជាប់ រួចសាកល្បងម្ដងទៀត។" })}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRetryKey((key) => key + 1)}
                        className="mt-1 h-11 min-w-36 rounded-xl font-kantumruy text-sm font-bold"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("dashboard.stats.retry", { defaultValue: "សាកល្បងម្ដងទៀត" })}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (guestCount === 0) {
        return (
            <Card className="border-2 border-dashed border-teal-200 dark:border-teal-900/50 shadow-none rounded-[2.5rem] bg-teal-50/30 dark:bg-teal-950/10 overflow-hidden relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
                <CardContent className="p-5 sm:p-8 md:p-12 relative z-10">
                    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
                        <div className="text-center space-y-3">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-teal-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 mb-4 sm:mb-6">
                                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500" />
                            </div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-kantumruy tracking-tight">
                                {t("dashboard.quickstart.title")}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground font-medium font-kantumruy max-w-md mx-auto">
                                {t("dashboard.quickstart.description")}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:gap-4 mt-6 sm:mt-8">
                            <Link to="/dashboard/design" className="group rounded-[1.5rem] outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:rounded-[2rem]">
                                <div className="flex items-center gap-3 sm:gap-5 p-3.5 sm:p-5 bg-white dark:bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Wand2 aria-hidden="true" size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black font-kantumruy text-base sm:text-lg text-foreground tracking-tight">
                                            {t("dashboard.quickstart.designTitle")}
                                        </h4>
                                        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground font-kantumruy leading-relaxed">
                                            {t("dashboard.quickstart.designDescription")}
                                        </p>
                                    </div>
                                    <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-indigo-600" />
                                </div>
                            </Link>

                            <Link to="/dashboard/guests" className="group rounded-[1.5rem] outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:rounded-[2rem]">
                                <div className="flex items-center gap-3 sm:gap-5 p-3.5 sm:p-5 bg-white dark:bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-teal-50 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                                        <Plus aria-hidden="true" size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black font-kantumruy text-base sm:text-lg text-foreground tracking-tight">
                                            {t("dashboard.quickstart.addGuestsTitle")}
                                        </h4>
                                        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground font-kantumruy leading-relaxed">
                                            {t("dashboard.quickstart.addGuestsDescription")}
                                        </p>
                                    </div>
                                    <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-teal-600" />
                                </div>
                            </Link>

                            <a
                                href={canShareInvitation ? "#invitation-center" : "/dashboard/design"}
                                className="group rounded-[1.5rem] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:rounded-[2rem]"
                            >
                                <div className="flex min-h-[76px] items-center gap-3 sm:gap-5 p-3.5 sm:p-5 bg-white/70 dark:bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm transition-all group-hover:shadow-md">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Share2 aria-hidden="true" size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black font-kantumruy text-base sm:text-lg text-foreground tracking-tight">
                                            {t(canShareInvitation ? "dashboard.quickstart.shareTitle" : "dashboard.quickstart.finishDesignTitle")}
                                        </h4>
                                        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground font-kantumruy leading-relaxed">
                                            {t(canShareInvitation ? "dashboard.quickstart.shareDescription" : "dashboard.quickstart.finishDesignDescription")}
                                        </p>
                                    </div>
                                    <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600" />
                                </div>
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl md:rounded-[2rem] bg-card border border-border/60 dark:border-border/40 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h3 className="text-sm md:text-base font-black font-kantumruy text-foreground tracking-tight">{t("dashboard.stats.analysis")}</h3>
                </div>
                <div className="p-4 md:p-6 flex flex-col sm:flex-row gap-3">
                    <div className="flex flex-1 items-center gap-4 p-4 bg-muted/30 dark:bg-muted/10 rounded-xl border border-border/40">
                        <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" strokeWidth="3.5" className="stroke-muted/40" />
                                <circle
                                    cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" strokeWidth="3.5"
                                    strokeDasharray={87.96}
                                    strokeDashoffset={87.96 * (1 - checkInRate)}
                                    strokeLinecap="round"
                                    className="text-indigo-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-black text-foreground">
                                    {Math.round(checkInRate * 100)}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black font-kantumruy text-foreground leading-tight">{t("dashboard.stats.checkInRate")}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-bold font-kantumruy mt-0.5">
                                {t("dashboard.stats.checkedInCount", { count: checkedInGuests, total: guestCount })}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-1 items-center gap-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 flex-shrink-0">
                            <MessageSquare size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-black font-kantumruy text-foreground leading-tight">{t("dashboard.stats.guestMessages")}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-bold font-kantumruy mt-0.5">
                                {t("dashboard.stats.guestMessagesCount", { count: guestbookEntries })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
