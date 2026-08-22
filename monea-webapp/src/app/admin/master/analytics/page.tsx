"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    ArrowLeft,
    BarChart3,
    PieChart,
    DollarSign,
    Calendar,
    ArrowUpRight,
    Loader2,
    Activity
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MasterAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/master/analytics")
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Revenue & Growth Analytics</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Platform Performance</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Growth Chart (Simplified visualization) */}
                    <Card className="lg:col-span-8 border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-8">
                            <CardTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <BarChart3 className="text-red-500" size={20} /> New Wedding Registrations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="space-y-4">
                                {data?.weddingsByMonth?.map((m: any, i: number) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                            <span>{m.month}</span>
                                            <span className="text-slate-900">{m.count} Weddings</span>
                                        </div>
                                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (m.count / 10) * 100)}%` }} // Arbitrary scale
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!data?.weddingsByMonth || data.weddingsByMonth.length === 0) && (
                                    <p className="text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No growth data available yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-slate-900 text-white p-8">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Global Transaction Volume</p>
                                    <h3 className="text-4xl font-black italic">$9,420.00</h3>
                                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1">+12.5% from last month</p>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="space-y-4">
                                    {data?.packageDist?.map((p: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">{p.packageType}</span>
                                            <span className="text-xs font-black">{p._count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white p-8">
                            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Currency Split</CardTitle>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 text-blue-700">
                                    <span className="font-black text-xs">USD</span>
                                    <span className="font-bold text-sm">$4,250</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 text-red-700">
                                    <span className="font-black text-xs">KHR</span>
                                    <span className="font-bold text-sm">21,000,000៛</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
