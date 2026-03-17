"use client";

import * as React from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { m, AnimatePresence } from "framer-motion";
import { Activity, Users, MousePointer2, Calendar, Smartphone, Monitor, Info, TrendingUp, BarChart3, Check } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Cache bust: 2026-03-10T22:40:00
export function AnalyticsDashboard({ weddingId }: { weddingId: string }) {
    const [mounted, setMounted] = React.useState(false);
    const { data, error, isLoading } = useSWR(mounted ? `/api/wedding/analytics/stats?weddingId=${weddingId}` : null, fetcher);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (isLoading) return (
        <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-28 bg-card rounded-[2rem] border border-border/50" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 h-[400px] bg-card rounded-[2.5rem] border border-border/50" />
                <div className="lg:col-span-2 h-[400px] bg-card rounded-[2.5rem] border border-border/50" />
            </div>
        </div>
    );

    if (error || !data || data.error) return (
        <div className="p-12 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                <Info size={32} />
            </div>
            <h3 className="text-lg font-bold font-kantumruy text-foreground mb-1">គ្មានទិន្នន័យ (No Data Available)</h3>
            <p className="text-sm text-muted-foreground font-medium italic">ទិន្នន័យនឹងបង្ហាញនៅពេលមានអ្នកចូលមើល (Data will appear once views are recorded)</p>
        </div>
    );

    const dailyTrend = data.dailyTrend || [];
    const deviceStats = data.deviceStats || [];
    const totalViews = data.totalViews || 0;

    const stats = [
        {
            title: "អ្នកចូលមើលសរុប",
            value: Number(data.totalViews) || 0,
            sub: "Total Unique Views",
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-500/10",
            border: "group-hover:border-blue-500/30"
        },
        {
            title: "ចុចមើលផែនទី",
            value: Number(data.mapClicks) || 0,
            sub: "Map Interactions",
            icon: MousePointer2,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-500/10",
            border: "group-hover:border-rose-500/30"
        },
        {
            title: "រក្សាទុកកាលបរិច្ឆេទ",
            value: Number(data.saveDateClicks) || 0,
            sub: "Calendar Saves",
            icon: Calendar,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-500/10",
            border: "group-hover:border-amber-500/30"
        },
        {
            title: "បើកមើល RSVP",
            value: Number(data.rsvpOpens) || 0,
            sub: "RSVP Modal Opens",
            icon: MousePointer2,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-500/10",
            border: "group-hover:border-purple-500/30"
        },
        {
            title: "បញ្ជូន RSVP",
            value: Number(data.rsvpSubmits) || 0,
            sub: "Responses Received",
            icon: Check,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            border: "group-hover:border-emerald-500/30"
        },
    ];

    return (
        <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {stats.map((s, i) => (
                    <m.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="group"
                    >
                        <Card className={`border-2 border-transparent bg-card shadow-sm rounded-[2rem] overflow-hidden transition-all duration-500 ${s.border}`}>
                            <CardContent className="p-7">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} transition-transform duration-500 group-hover:scale-110 shadow-sm`}>
                                        <s.icon className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider opacity-60">{s.title}</p>
                                        <h3 className="text-3xl font-black font-kantumruy tabular-nums text-foreground">{s.value}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground/40 italic">{s.sub}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Trend Chart - 3 Columns */}
                <Card className="lg:col-span-3 border-none shadow-sm rounded-[2.5rem] p-8 bg-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors duration-1000" />

                    <CardHeader className="px-0 pt-0 pb-8 border-b border-border/50 mb-8 flex-row items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <CardTitle className="text-md font-black font-kantumruy flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                </div>
                                និន្នាការនៃការចូលមើល
                            </CardTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-10 opacity-40 italic">ស្ថិតិនៃការចូលមើលក្នុងរយៈពេល ២១ ថ្ងៃចុងក្រោយ</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Live Flow</span>
                        </div>
                    </CardHeader>

                    <CardContent className="px-0 relative z-10 pt-4">
                        {dailyTrend.length === 0 ? (
                            <div className="h-56 flex items-center justify-center text-muted-foreground text-[10px] uppercase font-bold tracking-widest bg-muted/10 rounded-3xl border border-dashed border-border/30">
                                មិនទាន់មានទិន្នន័យសម្រាប់ការបង្ហាញ (No flow data yet)
                            </div>
                        ) : (() => {
                            const max = Math.max(...dailyTrend.map((x: any) => x.count), 1);
                            const width = 1000; // Fixed SVG coordinate space
                            const height = 200;
                            const spacing = width / Math.max(dailyTrend.length - 1, 1);

                            // Calculate points
                            const points = dailyTrend.map((t: any, i: number) => ({
                                x: i * spacing,
                                y: height - (t.count / max) * height
                            }));

                            // Create smooth path using cubic bezier
                            const linePath = points.map((p: any, i: number, arr: any[]) => {
                                if (i === 0) return `M ${p.x} ${p.y}`;
                                const prev = arr[i - 1];
                                const cp1x = prev.x + (p.x - prev.x) / 2;
                                const cp2x = prev.x + (p.x - prev.x) / 2;
                                return `C ${cp1x} ${prev.y}, ${cp2x} ${p.y}, ${p.x} ${p.y}`;
                            }).join(' ');

                            const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

                            return (
                                <div className="space-y-6">
                                    <div className="relative h-56 w-full">
                                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>

                                            {/* Area Fill */}
                                            <m.path
                                                d={areaPath}
                                                fill="url(#lineGradient)"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />

                                            {/* Data Line */}
                                            <m.path
                                                d={linePath}
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                            />

                                            {/* Data Points */}
                                            {points.map((p: any, i: number) => {
                                                const t = dailyTrend[i];
                                                const isToday = i === dailyTrend.length - 1;
                                                return (
                                                    <m.g key={i}>
                                                        <m.circle
                                                            cx={p.x}
                                                            cy={p.y}
                                                            r={isToday ? 6 : 4}
                                                            fill={isToday ? "#10b981" : "var(--background)"}
                                                            stroke="#10b981"
                                                            strokeWidth={isToday ? 4 : 2}
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 1 + (i * 0.05) }}
                                                            className="cursor-help"
                                                        />
                                                    </m.g>
                                                );
                                            })}
                                        </svg>

                                        {/* Invisible Hover Zones for Tooltips */}
                                        <div className="absolute inset-0 flex">
                                            {dailyTrend.map((t: any, i: number) => (
                                                <div key={i} className="flex-1 group/item relative">
                                                    <div className="opacity-0 group-hover/item:opacity-100 transition-all duration-300 absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ top: `${(points[i].y / height) * 100}%`, marginTop: '-40px' }}>
                                                        <div className="bg-foreground text-background text-[10px] font-black py-1 px-2.5 rounded-lg shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                                                            <Users size={10} />
                                                            {t.count} នាក់ ({t.date.split('-')[2]})
                                                        </div>
                                                        <div className="w-2 h-2 bg-foreground rotate-45 transform -translate-y-1 mx-auto" />
                                                    </div>
                                                    
                                                    {/* Vertical indicator line on hover */}
                                                    <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* X-Axis Labels */}
                                    <div className="flex justify-between px-1">
                                        {dailyTrend.filter((_: any, i: number) => i % 3 === 0 || i === dailyTrend.length - 1).map((t: any, i: number, arr: any[]) => {
                                            const isToday = t.date === dailyTrend[dailyTrend.length - 1].date;
                                            return (
                                                <div key={i} className="flex flex-col items-center">
                                                    <span className={`text-[9px] font-black transition-colors ${isToday ? 'text-emerald-500' : 'text-muted-foreground/40'}`}>
                                                        {t.date.split('-')[2]}
                                                    </span>
                                                    <span className="text-[7px] text-muted-foreground/20 font-bold uppercase scale-75">
                                                        {mounted ? new Date(t.date).toLocaleString('en-US', { month: 'short' }).toUpperCase() : "..."}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* Device breakdown - 2 Columns */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] p-8 bg-card flex flex-col group">
                    <CardHeader className="px-0 pt-0 pb-8 border-b border-border/50 mb-8 flex-row items-center justify-between">
                        <CardTitle className="text-md font-black font-kantumruy flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors duration-500">
                                <BarChart3 className="w-5 h-5 text-indigo-500" />
                            </div>
                            ឧបករណ៍ដែលប្រើប្រាស់
                        </CardTitle>
                        <Monitor size={16} className="text-muted-foreground/20" />
                    </CardHeader>

                    <CardContent className="px-0 space-y-5 flex-1 flex flex-col justify-center">
                        {deviceStats.length > 0 ? (
                            deviceStats.map((ds: any, i: number) => {
                                const count = Number(ds.count) || 0;
                                const percentage = Math.round((count / (totalViews || 1)) * 100);
                                const isMobile = ds.type === 'MOBILE';

                                return (
                                    <m.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="flex items-center gap-5 p-5 rounded-3xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50 group/item"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-500 group-hover/item:scale-105 ${isMobile ? 'bg-indigo-100/50 dark:bg-indigo-500/10 text-indigo-600' : 'bg-slate-100/50 dark:bg-slate-500/10 text-slate-600'}`}>
                                            {isMobile ? <Smartphone size={24} /> : <Monitor size={24} />}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-black font-kantumruy uppercase tracking-wide">{ds.type}</span>
                                                    <p className="text-[10px] text-muted-foreground font-bold italic opacity-60">{ds.count} sessions detected</p>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-black tabular-nums">{percentage}</span>
                                                    <span className="text-xs font-bold text-muted-foreground/40">%</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2.5 bg-background/50 rounded-full overflow-hidden shadow-inner p-0.5">
                                                <m.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className={`h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)] ${isMobile ? 'bg-gradient-to-r from-indigo-600 to-indigo-400' : 'bg-gradient-to-r from-slate-600 to-slate-400'}`}
                                                />
                                            </div>
                                        </div>
                                    </m.div>
                                );
                            })
                        ) : (
                            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-muted-foreground gap-3 bg-muted/5 rounded-3xl border border-dashed border-border/30">
                                <Monitor size={40} className="text-muted-foreground/10" />
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-30">គ្មានទិន្នន័យនៅឡើយ</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
