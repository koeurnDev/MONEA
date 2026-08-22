"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    PartyPopper,
    ShieldCheck,
    Search,
    Settings,
    Lock,
    Globe,
    ArrowRight,
    TrendingUp,
    LayoutDashboard,
    Megaphone,
    LifeBuoy,
    Database,
    DollarSign,
    Activity,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "@/i18n/LanguageProvider";
import { m } from "framer-motion";

interface MasterStats {
    stats: {
        totalWeddings: number;
        activeWeddings: number;
        totalGuests: number;
        totalGifts: number;
        totalUsers: number;
        blacklistedIPs: number;
        dbHealth?: string;
    };
    recentWeddings: any[];
}

export default function MasterAdminPage() {
    const { t } = useTranslation();
    const [data, setData] = useState<MasterStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/master/stats")
            .then(res => res.json())
            .then(setData)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-t-red-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950">
            {/* Top Bar */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {t("admin.overview.title")}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {t("admin.overview.subtitle")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/master/audit">
                            <Button variant="outline" className="h-10 rounded-xl font-bold text-xs uppercase tracking-widest border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                {t("admin.overview.systemLogs")}
                            </Button>
                        </Link>
                        <Link href="/admin/master/settings">
                            <Button className="h-10 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-opacity">
                                {t("admin.overview.globalSettings")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: t("admin.overview.stats.totalWeddings"), value: data?.stats?.totalWeddings || 0, icon: PartyPopper, color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10" },
                        { label: t("admin.overview.stats.activeHirers"), value: data?.stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
                        { label: t("admin.overview.stats.globalGuests"), value: data?.stats?.totalGuests || 0, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                        { label: t("admin.overview.stats.ipBlacklist"), value: data?.stats?.blacklistedIPs || 0, icon: Lock, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" },
                    ].map((s, i) => (
                        <m.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <Card className="bg-white dark:bg-slate-900 border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[2rem] overflow-hidden group">
                                <CardContent className="p-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{s.value}</h3>
                                    </div>
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", s.bg, s.color)}>
                                        <s.icon size={24} />
                                    </div>
                                </CardContent>
                            </Card>
                        </m.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Recent Hirers / Weddings */}
                    <Card className="lg:col-span-8 bg-white dark:bg-slate-900 border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {t("admin.overview.recentWeddings.title")}
                                </CardTitle>
                                <p className="text-xs text-slate-400 font-bold mt-1">
                                    {t("admin.overview.recentWeddings.subtitle")}
                                </p>
                            </div>
                            <Link href="/admin/master/weddings">
                                <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 rounded-xl">
                                    {t("admin.overview.recentWeddings.viewAll")} <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-white/5">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {t("admin.overview.recentWeddings.table.name")}
                                            </th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {t("admin.overview.recentWeddings.table.plan")}
                                            </th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {t("admin.overview.recentWeddings.table.status")}
                                            </th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                                {t("admin.overview.recentWeddings.table.created")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {data?.recentWeddings?.map((w) => (
                                            <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white">{w.groomName} & {w.brideName}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">ID: {w.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase px-2.5 py-1 rounded-lg",
                                                        w.packageType === 'PREMIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500' :
                                                            w.packageType === 'PRO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-500' :
                                                                'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                                                    )}>
                                                        {w.packageType}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", w.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700')} />
                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{w.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                                                        {new Date(w.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Master Controls */}
                    <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
                        <Card className="bg-slate-950 text-white border-none shadow-2xl shadow-slate-900/50 rounded-[2.5rem] overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[60px]" />
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-xl font-black tracking-tight uppercase flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    {t("admin.overview.systemHealth.title")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {[
                                    { label: t("admin.overview.systemHealth.ipFirewalls"), status: t("admin.overview.systemHealth.active"), icon: ShieldCheck, health: "HEALTHY" },
                                    { label: t("admin.overview.systemHealth.cdn"), status: t("admin.overview.systemHealth.connected"), icon: Globe, health: "HEALTHY" },
                                    { label: t("admin.overview.systemHealth.database"), status: data?.stats?.dbHealth === "HEALTHY" ? t("admin.overview.systemHealth.connected") : (data?.stats?.dbHealth || "Checking..."), icon: Database, health: data?.stats?.dbHealth },
                                    { label: t("admin.overview.systemHealth.security"), status: t("admin.overview.systemHealth.protected"), icon: ShieldAlert, health: "HEALTHY" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <item.icon size={18} className={cn(item.health === 'HEALTHY' ? "text-red-500" : "text-orange-500")} />
                                                {item.health === 'HEALTHY' && (
                                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                                )}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.label}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest", item.health === 'HEALTHY' ? "text-green-400" : "text-orange-400")}>
                                                {item.status}
                                            </span>
                                            <span className="text-[7px] font-bold uppercase tracking-tighter opacity-30">Real-time</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <Link href="/admin/master/settings">
                                        <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            {t("admin.overview.globalSettings")}
                                        </Button>
                                    </Link>
                                    <Link href="/api/admin/master/export">
                                        <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            {t("admin.overview.systemHealth.export")}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-900 border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                    {t("admin.overview.actions.title")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-3">
                                <Link href="/admin/master/payments" className="block">
                                    <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2">
                                        <DollarSign size={16} /> 
                                        {t("admin.overview.actions.paymentCenter")}
                                    </Button>
                                </Link>
                                <Link href="/admin/master/users" className="block">
                                    <Button variant="outline" className="w-full h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                        <Users size={16} /> 
                                        {t("admin.overview.actions.userDirectory")}
                                    </Button>
                                </Link>
                                <div className="h-px bg-slate-100 dark:bg-slate-800/50 my-4" />
                                <Link href="/admin/master/support" className="block">
                                    <Button variant="outline" className="w-full h-14 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-500/5 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 group transition-all hover:shadow-lg hover:shadow-red-500/5">
                                        <div className="relative">
                                            <LifeBuoy size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                        </div>
                                        {t("admin.overview.actions.supportDesk")}
                                        <span className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black ml-1 tracking-tighter">LIVE</span>
                                    </Button>
                                </Link>
                                <div className="flex items-center justify-between mt-6 px-1">
                                    <Link href="/admin/master/broadcast">
                                        <span className="text-[9px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest">
                                            {t("admin.overview.actions.broadcast")}
                                        </span>
                                    </Link>
                                    <Link href="/admin/master/audit">
                                        <span className="text-[9px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest">
                                            {t("admin.overview.actions.audit")}
                                        </span>
                                    </Link>
                                    <Link href="/admin/master/analytics">
                                        <span className="text-[9px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest">
                                            {t("admin.overview.actions.revenue")}
                                        </span>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>
                </div>
            </main>
        </div>
    );
}
