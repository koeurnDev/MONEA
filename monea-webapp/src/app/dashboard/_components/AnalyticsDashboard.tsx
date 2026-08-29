import * as React from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { m } from "framer-motion";
import { Activity, Users, MousePointer2, Calendar, Smartphone, Monitor, Info, TrendingUp, BarChart3, Check } from "lucide-react";
import { useTranslation } from '@/i18n/LanguageProvider';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AnalyticsDashboard({ weddingId }: { weddingId: string }) {
    const { t } = useTranslation();
    const [mounted, setMounted] = React.useState(false);
    const [activeTooltip, setActiveTooltip] = React.useState<number | null>(null);

    const { data, error, isLoading } = useSWR(mounted ? `/api/wedding/analytics/stats?weddingId=${weddingId}` : null, fetcher);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (isLoading) return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-24 bg-card rounded-2xl border border-border/50" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 h-[350px] bg-card rounded-3xl border border-border/50" />
                <div className="lg:col-span-2 h-[350px] bg-card rounded-3xl border border-border/50" />
            </div>
        </div>
    );

    if (error || !data || data.error) return (
        <div className="p-8 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
            <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-muted-foreground/30">
                <Info size={28} />
            </div>
            <h3 className="text-base font-bold font-kantumruy text-foreground mb-1">{t("dashboard.analytics.noData")}</h3>
            <p className="text-xs text-muted-foreground font-medium italic">{t("dashboard.analytics.noDataSub")}</p>
        </div>
    );

    const dailyTrend = data.dailyTrend || [];
    const deviceStats = data.deviceStats || [];
    const totalViews = data.totalViews || 0;

    const stats = [
        {
            title: t("dashboard.analytics.totalViews"),
            value: Number(data.totalViews) || 0,
            sub: t("dashboard.analytics.totalViewsSub"),
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-500/10",
        },
        {
            title: t("dashboard.analytics.mapClicks"),
            value: Number(data.mapClicks) || 0,
            sub: t("dashboard.analytics.mapClicksSub"),
            icon: MousePointer2,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-500/10",
        },
        {
            title: t("dashboard.analytics.saveDate"),
            value: Number(data.saveDateClicks) || 0,
            sub: t("dashboard.analytics.saveDateSub"),
            icon: Calendar,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-500/10",
        },
        {
            title: t("dashboard.analytics.rsvpOpens"),
            value: Number(data.rsvpOpens) || 0,
            sub: t("dashboard.analytics.rsvpOpensSub"),
            icon: MousePointer2,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-500/10",
        },
        {
            title: t("dashboard.analytics.rsvpSubmits"),
            value: Number(data.rsvpSubmits) || 0,
            sub: t("dashboard.analytics.rsvpSubmitsSub"),
            icon: Check,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Top Stat Cards - Optimized grid for mobile (2 columns on mobile, 5 on desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {stats.map((s, i) => (
                    <m.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group"
                    >
                        <Card className="border border-border/60 bg-card shadow-xs rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                                        <s.icon className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase truncate opacity-70">{s.title}</p>
                                        <h3 className="text-xl md:text-2xl font-black font-kantumruy tabular-nums text-foreground">{s.value}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Trend Chart */}
                <Card className="lg:col-span-3 border border-border/60 shadow-xs rounded-3xl p-5 md:p-7 bg-card relative overflow-hidden">
                    <CardHeader className="px-0 pt-0 pb-4 border-b border-border/40 mb-4 flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm md:text-md font-black font-kantumruy flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>
                                {t("dashboard.analytics.viewTrend")}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full border border-border/50">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{t("dashboard.analytics.liveFlow")}</span>
                        </div>
                    </CardHeader>

                    <CardContent className="px-0 pt-2">
                        {dailyTrend.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-muted-foreground text-[10px] uppercase font-bold tracking-widest bg-muted/10 rounded-2xl border border-dashed border-border/30">
                                {t("dashboard.analytics.noFlowData")}
                            </div>
                        ) : (() => {
                            const max = Math.max(...dailyTrend.map((x: any) => x.count), 1);
                            const width = 1000;
                            const height = 180;
                            const spacing = width / Math.max(dailyTrend.length - 1, 1);

                            const points = dailyTrend.map((item: any, i: number) => ({
                                x: i * spacing,
                                y: height - (item.count / max) * height
                            }));

                            const linePath = points.map((p: any, i: number, arr: any[]) => {
                                if (i === 0) return `M ${p.x} ${p.y}`;
                                const prev = arr[i - 1];
                                const cp1x = prev.x + (p.x - prev.x) / 2;
                                const cp2x = prev.x + (p.x - prev.x) / 2;
                                return `C ${cp1x} ${prev.y}, ${cp2x} ${p.y}, ${p.x} ${p.y}`;
                            }).join(' ');

                            const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

                            return (
                                <div className="space-y-4">
                                    {/* Active Tooltip Info Display on Tap/Hover */}
                                    <div className="h-7 flex items-center justify-center">
                                        {activeTooltip !== null ? (
                                            <div className="bg-foreground text-background text-[10px] font-bold py-1 px-3 rounded-full shadow-md flex items-center gap-2 animate-fade-in">
                                                <Users size={12} />
                                                <span>{t("dashboard.analytics.tooltip", { count: dailyTrend[activeTooltip].count, date: dailyTrend[activeTooltip].date })}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground/50 italic">{t("dashboard.analytics.tapPointPrompt", { defaultValue: "ចុចលើដ្យាក្រាមដើម្បីមើលលម្អិតតាមថ្ងៃ" })}</span>
                                        )}
                                    </div>

                                    <div className="relative h-44 w-full">
                                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>

                                            <path d={areaPath} fill="url(#lineGradient)" />
                                            <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                                            {/* Interactive Tap/Click Points */}
                                            {points.map((p: any, i: number) => {
                                                const isSelected = activeTooltip === i;
                                                return (
                                                    <g key={i} onClick={() => setActiveTooltip(i)} className="cursor-pointer">
                                                        <circle
                                                            cx={p.x}
                                                            cy={p.y}
                                                            r={isSelected ? 8 : 5}
                                                            fill={isSelected ? "#10b981" : "var(--background)"}
                                                            stroke="#10b981"
                                                            strokeWidth="3"
                                                            className="transition-all"
                                                        />
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>

                                    {/* X-Axis Dates */}
                                    <div className="flex justify-between px-1">
                                        {dailyTrend.filter((_: any, i: number) => i % Math.max(Math.floor(dailyTrend.length / 5), 1) === 0 || i === dailyTrend.length - 1).map((item: any, i: number) => (
                                            <span key={i} className="text-[9px] font-bold text-muted-foreground/60">
                                                {item.date.split('-').slice(1).join('/')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* Device Breakdown */}
                <Card className="lg:col-span-2 border border-border/60 shadow-xs rounded-3xl p-5 md:p-7 bg-card flex flex-col">
                    <CardHeader className="px-0 pt-0 pb-4 border-b border-border/40 mb-4 flex-row items-center justify-between">
                        <CardTitle className="text-sm md:text-md font-black font-kantumruy flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                                <BarChart3 className="w-4 h-4 text-indigo-500" />
                            </div>
                            {t("dashboard.analytics.devices")}
                        </CardTitle>
                        <Monitor size={16} className="text-muted-foreground/30" />
                    </CardHeader>

                    <CardContent className="px-0 space-y-3 flex-1 flex flex-col justify-center">
                        {deviceStats.length > 0 ? (
                            deviceStats.map((ds: any, i: number) => {
                                const count = Number(ds.count) || 0;
                                const percentage = Math.round((count / (totalViews || 1)) * 100);
                                const isMobile = ds.type === 'MOBILE';

                                return (
                                    <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/20 border border-transparent">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isMobile ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600' : 'bg-slate-100 dark:bg-slate-500/10 text-slate-600'}`}>
                                            {isMobile ? <Smartphone size={20} /> : <Monitor size={20} />}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs font-bold font-kantumruy truncate">
                                                    {ds.type === 'MOBILE' ? t("dashboard.analytics.mobile") : t("dashboard.analytics.desktop")}
                                                </span>
                                                <span className="text-sm font-black tabular-nums">{percentage}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${percentage}%` }}
                                                    className={`h-full rounded-full transition-all duration-1000 ${isMobile ? 'bg-indigo-500' : 'bg-slate-500'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/5 rounded-2xl border border-dashed border-border/30">
                                <Monitor size={32} className="text-muted-foreground/20" />
                                <span className="text-[10px] uppercase font-bold tracking-widest">{t("dashboard.analytics.noDataYet")}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}