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
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-red-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <div className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-foreground uppercase tracking-tighter">Master Control</h1>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">System Administration</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/master/audit">
                            <Button variant="outline" className="h-10 rounded-xl font-bold text-xs uppercase tracking-widest border-border">
                                System Logs
                            </Button>
                        </Link>
                        <Link href="/admin/master/settings">
                            <Button className="h-10 rounded-xl font-bold text-xs uppercase tracking-widest bg-primary text-primary-foreground">
                                Global Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Total Weddings", value: data?.stats?.totalWeddings || 0, icon: PartyPopper, color: "text-red-500", bg: "bg-red-500/10" },
                        { label: "Active Hirers", value: data?.stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Global Guests", value: data?.stats?.totalGuests || 0, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
                        { label: "IP Blacklist", value: data?.stats?.blacklistedIPs || 0, icon: Lock, color: "text-orange-500", bg: "bg-orange-500/10" },
                    ].map((s, i) => (
                        <Card key={i} className="bg-card border-border shadow-sm rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                                    <h3 className="text-3xl font-black text-foreground">{s.value}</h3>
                                </div>
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", s.bg, s.color)}>
                                    <s.icon size={24} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Recent Hirers / Weddings */}
                    <Card className="lg:col-span-8 bg-card border-border shadow-sm rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-foreground tracking-tight">Recent Hirers (អ្នកជួលកម្មវិធី)</CardTitle>
                                <p className="text-xs text-muted-foreground font-bold mt-1">Latest wedding platform activations</p>
                            </div>
                            <Link href="/admin/master/weddings">
                                <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-red-600">
                                    View All <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Wedding Name</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plan</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {data?.recentWeddings?.map((w) => (
                                            <tr key={w.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground">{w.groomName} & {w.brideName}</span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">ID: {w.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase px-2 py-1 rounded-md",
                                                        w.packageType === 'PREMIUM' ? 'bg-amber-500/20 text-amber-600' :
                                                            w.packageType === 'PRO' ? 'bg-blue-500/20 text-blue-600' :
                                                                'bg-muted text-muted-foreground'
                                                    )}>
                                                        {w.packageType}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", w.status === 'ACTIVE' ? 'bg-green-500' : 'bg-muted-foreground/30')} />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{w.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-xs font-medium text-muted-foreground">
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
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-card border-border shadow-sm rounded-[2.5rem] overflow-hidden bg-slate-950 text-white">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-xl font-black tracking-tight">System Health</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                {[
                                    { label: "IP Firewalls", status: "Active", icon: ShieldCheck, health: "HEALTHY" },
                                    { label: "CDN (Cloudinary)", status: "Connected", icon: Globe, health: "HEALTHY" },
                                    { label: "Database", status: data?.stats?.dbHealth || "Checking...", icon: Database, health: data?.stats?.dbHealth },
                                    { label: "Security", status: "Protected", icon: ShieldAlert, health: "HEALTHY" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={cn(item.health === 'HEALTHY' ? "text-red-500" : "text-orange-500")} />
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">{item.label}</span>
                                        </div>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", item.health === 'HEALTHY' ? "text-green-400" : "text-orange-400")}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <Link href="/admin/master/settings">
                                        <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            Settings
                                        </Button>
                                    </Link>
                                    <Link href="/api/admin/master/export">
                                        <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                            Export Data
                                        </Button>
                                    </Link>
                                </div>
                                <Link href="/admin/master/maintenance" className="block mt-2">
                                    <Button variant="ghost" className="w-full h-10 text-white/40 hover:text-white hover:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                        <Activity size={14} className="mr-2" /> System Diagnostics
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-sm rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-black text-foreground tracking-tight">Security Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-3">
                                <Link href="/admin/master/payments" className="block">
                                    <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/10 transition-all flex items-center gap-2">
                                        <DollarSign size={16} /> Payment Center
                                    </Button>
                                </Link>
                                <Link href="/admin/master/users" className="block">
                                    <Button variant="outline" className="w-full h-12 border-border hover:bg-muted text-foreground rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Users size={16} /> User Directory
                                    </Button>
                                </Link>
                                <div className="border-t border-border/50 my-4" />
                                <Link href="/admin/master/broadcast" className="block text-center">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors">Broadcast Center</span>
                                </Link>
                                <Link href="/admin/master/support" className="block">
                                    <Button variant="outline" className="w-full h-12 border-border bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group transition-all">
                                        <LifeBuoy size={16} className="group-hover:rotate-12 transition-transform" />
                                        Support Desk
                                        <span className="bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-md animate-pulse ml-1">LIVE</span>
                                    </Button>
                                </Link>
                                <Link href="/admin/master/audit" className="block text-center mt-3">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors">Audit Explorer</span>
                                </Link>
                                <Link href="/admin/master/analytics" className="block mt-4">
                                    <Button variant="outline" className="w-full h-12 border-border hover:bg-muted text-muted-foreground rounded-2xl text-xs font-bold uppercase tracking-widest">
                                        Revenue & Growth
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
