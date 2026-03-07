"use client";

import React from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MousePointer2, Calendar, Smartphone, Monitor, Info, TrendingUp } from "lucide-react";
import { m } from "framer-motion";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AnalyticsDashboard({ weddingId }: { weddingId: string }) {
    const { data, error, isLoading } = useSWR(`/api/wedding/analytics/stats?weddingId=${weddingId}`, fetcher);

    if (isLoading) return <div className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-bold font-kantumruy text-muted-foreground uppercase tracking-widest">Loading Insights...</p>
        </div>
    </div>;

    if (error || !data || data.error) return <div className="p-10 text-center text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed">
        គ្មានទិន្នន័យ (No Data Available)
    </div>;

    const dailyTrend = data.dailyTrend || [];
    const deviceStats = data.deviceStats || [];
    const totalViews = data.totalViews || 0;

    const stats = [
        { title: "អ្នកចូលមើលសរុប", value: data.totalViews, sub: "Total Reach", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
        { title: "ចុចមើលផែនទី", value: data.mapClicks, sub: "Map Interaction", icon: MousePointer2, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" },
        { title: "ចុចរក្សាទុកកាលបរិច្ឆេទ", value: data.saveDateClicks, sub: "Save The Date", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                    <m.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-none bg-card shadow-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.title}</p>
                                        <h3 className="text-3xl font-black font-kantumruy">{s.value}</h3>
                                        <p className="text-[9px] font-medium text-muted-foreground italic">{s.sub}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart (Simple Manual Visualization if Chart.js is not available) */}
                <Card className="border-none shadow-sm rounded-3xl p-6">
                    <CardHeader className="px-0 pt-0 pb-6 border-b border-border/50 mb-6 flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold font-kantumruy flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            និន្នាការនៃការចូលមើល (View Trends)
                        </CardTitle>
                        <Info className="w-4 h-4 text-muted-foreground/30" />
                    </CardHeader>
                    <CardContent className="px-0">
                        {dailyTrend.length === 0 ? (
                            <div className="h-40 flex items-center justify-center text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                                មិនទាន់មានទិន្នន័យសម្រាប់ថ្ងៃនេះ
                            </div>
                        ) : (
                            <div className="flex items-end justify-between h-40 gap-1 px-2">
                                {dailyTrend.map((t: any, idx: number) => {
                                    const max = Math.max(...dailyTrend.map((x: any) => x.count));
                                    const height = max > 0 ? (t.count / max) * 100 : 0;
                                    return (
                                        <div key={idx} className="flex-1 group relative flex flex-col items-center gap-2">
                                            <div
                                                className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-colors"
                                                style={{ height: `${height}%` }}
                                            />
                                            <span className="text-[8px] text-muted-foreground font-bold hidden group-hover:block absolute -top-4 bg-popover px-1 rounded shadow-sm">
                                                {t.count}
                                            </span>
                                            <span className="text-[7px] text-muted-foreground/50 rotate-45 origin-left truncate max-w-[20px]">
                                                {t.date.split('-').slice(1).join('/')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Device breakdown */}
                <Card className="border-none shadow-sm rounded-3xl p-6">
                    <CardHeader className="px-0 pt-0 pb-6 border-b border-border/50 mb-6">
                        <CardTitle className="text-sm font-bold font-kantumruy">ឧបករណ៍ដែលប្រើប្រាស់ (Device Breakdown)</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                        {deviceStats.map((ds: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                                    {ds.type === 'MOBILE' ? <Smartphone size={18} /> : <Monitor size={18} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold font-kantumruy">{ds.type}</span>
                                        <span className="text-xs font-black">{Math.round((ds.count / (totalViews || 1)) * 100)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(ds.count / (totalViews || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {deviceStats.length === 0 && (
                            <div className="h-40 flex items-center justify-center text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                                គ្មានទិន្នន័យ
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
