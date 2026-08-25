import React, { useEffect, useState } from "react";
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
    Activity,
    RefreshCcw,
    Crown,
    Gift,
    HeartHandshake,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

export default function MasterAnalyticsPage() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/master/analytics");
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const summary = data?.summary || {
        totalPlanRevenue: 0,
        usdGifts: 0,
        khrGifts: 0,
        proCount: 0,
        premiumCount: 0,
        freeCount: 0,
        totalWeddings: 0
    };

    const conversionRate = summary.totalWeddings > 0 
        ? (((summary.proCount + summary.premiumCount) / summary.totalWeddings) * 100).toFixed(1)
        : "0.0";

    const maxMonthlyCount = Math.max(...(data?.weddingsByMonth?.map((m: any) => m.count) || [1]), 1);

    return (
        <div className="w-full min-h-full font-kantumruy pb-16">
            {/* Top Bar Header */}
            <div className="bg-card/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border bg-card shadow-xs hover:bg-muted">
                                <ArrowLeft size={17} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                <TrendingUp size={13} />
                                <span>Platform Analytics</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                {isKm ? "ស្ថិតិកំណើន និងចំណូលសរុប (Revenue & Growth)" : "Revenue & Growth Analytics"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadData}
                            variant="outline"
                            disabled={loading}
                            className="h-10 px-4 rounded-xl font-bold text-xs border border-border bg-card shadow-xs flex items-center gap-2"
                        >
                            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                            <span>{isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
                {/* 4 Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "ចំណូលពីកញ្ចប់សេវា" : "Plan Revenue"}</p>
                                <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${summary.totalPlanRevenue.toFixed(2)}</h3>
                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">USD ({summary.proCount + summary.premiumCount} កម្មវិធី)</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                                <DollarSign size={22} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "ចំណងដៃ KHQR (USD)" : "USD Gifts"}</p>
                                <h3 className="text-2xl font-black text-foreground mt-1">${summary.usdGifts.toLocaleString()}</h3>
                                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Digital Gift Transferred</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                                <Gift size={22} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "ចំណងដៃ KHQR (KHR)" : "KHR Gifts"}</p>
                                <h3 className="text-2xl font-black text-foreground mt-1">{summary.khrGifts.toLocaleString()} ៛</h3>
                                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">ប្រាក់រៀលខ្មែរ</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                <Sparkles size={22} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{isKm ? "អត្រាដំឡើងកញ្ចប់" : "Upgrade Rate"}</p>
                                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{conversionRate}%</h3>
                                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">នៃមង្គលការសរុបទាំង {summary.totalWeddings}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                <Crown size={22} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Monthly Growth Timeline (8 cols) */}
                    <Card className="lg:col-span-8 bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                        <CardHeader className="p-6 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                <BarChart3 size={18} className="text-rose-500" />
                                <span>{isKm ? "ស្ថិតិកំណើនបង្កើតមង្គលការប្រចាំខែ" : "Monthly Wedding Registrations"}</span>
                            </CardTitle>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                {summary.totalWeddings} {isKm ? "កម្មវិធីសរុប" : "Total Weddings"}
                            </span>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                                    <span className="text-xs text-muted-foreground">កំពុងទាញយកទិន្នន័យ...</span>
                                </div>
                            ) : data?.weddingsByMonth?.length > 0 ? (
                                <div className="space-y-4">
                                    {data.weddingsByMonth.map((m: any, i: number) => {
                                        const percent = Math.min(100, Math.round((m.count / maxMonthlyCount) * 100));
                                        return (
                                            <div key={i} className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors">
                                                <div className="flex justify-between items-center text-xs font-bold text-foreground">
                                                    <span className="font-mono">{m.month}</span>
                                                    <span className="text-rose-600 dark:text-rose-400 font-black">{m.count} កម្មវិធី</span>
                                                </div>
                                                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 text-center space-y-2">
                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                        <Calendar size={22} />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">មិនទាន់មានទិន្នន័យកំណើននៅឡើយទេ</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right: Package Distribution & Currency (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Package Breakdown */}
                        <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                            <CardHeader className="p-5 pb-3 border-b border-border/50">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Crown size={16} className="text-amber-500" />
                                    <span>{isKm ? "ចំណែកកញ្ចប់សេវាកម្ម (Plan Tiers)" : "Plan Distribution"}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-3">
                                {[
                                    { name: "FREE PLAN", count: summary.freeCount, price: "$0", color: "bg-slate-500", text: "text-slate-500", bg: "bg-slate-500/10" },
                                    { name: "PRO PLAN", count: summary.proCount, price: `$${data?.pricing?.standard || 9}`, color: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-500/10" },
                                    { name: "PREMIUM PLAN", count: summary.premiumCount, price: `$${data?.pricing?.pro || 19}`, color: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-500/10" },
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn("w-2.5 h-2.5 rounded-full", p.color)} />
                                            <div>
                                                <span className="text-xs font-bold text-foreground block">{p.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{p.price} / កម្មវិធី</span>
                                            </div>
                                        </div>
                                        <span className={cn("text-xs font-black px-2.5 py-1 rounded-md", p.bg, p.text)}>
                                            {p.count} កម្មវិធី
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Currency Remittance */}
                        <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                            <CardHeader className="p-5 pb-3 border-b border-border/50">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <HeartHandshake size={16} className="text-rose-500" />
                                    <span>{isKm ? "ចំណងដៃតាមរូបិយប័ណ្ណ (KHQR Gifts)" : "Gift Remittance"}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                    <div>
                                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block">USD (ដុល្លារអាមេរិក)</span>
                                        <span className="text-[10px] text-muted-foreground">ស្កេនតាម Bakong KHQR</span>
                                    </div>
                                    <span className="text-sm font-black font-mono text-blue-700 dark:text-blue-400">
                                        ${summary.usdGifts.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <div>
                                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">KHR (ប្រាក់រៀល)</span>
                                        <span className="text-[10px] text-muted-foreground">ស្កេនតាម Bakong KHQR</span>
                                    </div>
                                    <span className="text-sm font-black font-mono text-amber-700 dark:text-amber-400">
                                        {summary.khrGifts.toLocaleString()} ៛
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
