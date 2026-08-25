import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    PartyPopper,
    ShieldCheck,
    Lock,
    Globe,
    ArrowRight,
    Megaphone,
    LifeBuoy,
    Database,
    DollarSign,
    Activity,
    ShieldAlert,
    FileText,
    TrendingUp,
    Wrench,
    Settings,
    Layers,
    Sparkles,
    Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
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

    const adminModules = [
        {
            title: "គ្រប់គ្រងមង្គលការ",
            subtitle: "Weddings Management",
            desc: "គ្រប់គ្រងកម្មវិធីមង្គលការទាំងអស់ បិទ/បើក និងដំឡើងកញ្ចប់ (Free, Pro, Premium)",
            href: "/admin/master/weddings",
            icon: PartyPopper,
            color: "text-rose-500",
            bgColor: "bg-rose-500/10",
            badge: "CORE"
        },
        {
            title: "គ្រប់គ្រងអ្នកប្រើប្រាស់",
            subtitle: "Users Management",
            desc: "គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ទាំងអស់ កំណត់សិទ្ធិ (USER, ADMIN, STAFF, SUPERADMIN)",
            href: "/admin/master/users",
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            badge: "USERS"
        },
        {
            title: "ការទូទាត់ប្រាក់ & ចំណូល",
            subtitle: "Payments & Revenue",
            desc: "ត្រួតពិនិត្យ និង Approve វិក្កយបត្របង់ប្រាក់ពីអតិថិជន (Bakong / KHQR)",
            href: "/admin/master/payments",
            icon: DollarSign,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            badge: "FINANCE"
        },
        {
            title: "សារប្រកាសដំណឹង",
            subtitle: "Broadcast Banner",
            desc: "បង្ហោះសារដំណឹងបន្ទាន់ ឬប្រកាសនៅលើ Dashboard របស់អ្នកប្រើប្រាស់ទាំងអស់",
            href: "/admin/master/broadcast",
            icon: Megaphone,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            badge: "NOTIFY"
        },
        {
            title: "សន្តិសុខ & IP Firewall",
            subtitle: "Security & Firewall",
            desc: "ទប់ស្កាត់ការវាយប្រហារ មើលបញ្ជី IP Blacklist និងកម្រិតការពារសុវត្ថិភាព",
            href: "/admin/master/security",
            icon: ShieldAlert,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
            badge: "SECURITY"
        },
        {
            title: "កំណត់ត្រាសវនកម្ម",
            subtitle: "Audit & System Logs",
            desc: "ពិនិត្យប្រវត្តិនៃការកែប្រែទិន្នន័យ និងសកម្មភាពនានារបស់ Admin & Staff",
            href: "/admin/master/audit",
            icon: FileText,
            color: "text-indigo-500",
            bgColor: "bg-indigo-500/10",
            badge: "LOGS"
        },
        {
            title: "ការថែទាំប្រព័ន្ធ",
            subtitle: "Maintenance Mode",
            desc: "បើកមុខងារថែទាំប្រព័ន្ធ (Maintenance Mode) និង Backup Database",
            href: "/admin/master/maintenance",
            icon: Wrench,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            badge: "SYSTEM"
        },
        {
            title: "ស្ថិតិទូទាំងប្រទេស",
            subtitle: "Platform Analytics",
            desc: "ស្ថិតិចរាចរណ៍អ្នកចូលទស្សនាសំបុត្រឌីជីថល និងស្ថិតិ Guest RSVP",
            href: "/admin/master/analytics",
            icon: TrendingUp,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            badge: "STATS"
        },
        {
            title: "ការកំណត់ប្រព័ន្ធរួម",
            subtitle: "Global Settings",
            desc: "កំណត់ API Keys, Cloudinary, SMS Gateway, និង Turnstile",
            href: "/admin/master/settings",
            icon: Settings,
            color: "text-slate-500 dark:text-slate-400",
            bgColor: "bg-slate-500/10",
            badge: "CONFIG"
        }
    ];

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-kantumruy">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-t-red-600" />
        </div>
    );

    return (
        <div className="w-full min-h-full font-kantumruy pb-16">
            {/* Top Bar Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-tr from-red-600 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {t("admin.overview.title", { defaultValue: "មជ្ឈមណ្ឌលបញ្ជាមេ" })}
                            </h1>
                            <p className="text-[11px] text-slate-400 font-bold tracking-wide">
                                {t("admin.overview.subtitle", { defaultValue: "ការគ្រប់គ្រងប្រព័ន្ធទូទៅ" })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/admin/master/audit">
                            <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                                {t("admin.overview.systemLogs", { defaultValue: "កំណត់ត្រាប្រព័ន្ធ" })}
                            </Button>
                        </Link>
                        <Link to="/admin/master/settings">
                            <Button className="h-10 px-4 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 shadow-md">
                                {t("admin.overview.globalSettings", { defaultValue: "ការកំណត់ទូទៅ" })}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto p-4 sm:p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: t("admin.overview.stats.totalWeddings", { defaultValue: "មង្គលការសរុប" }), value: data?.stats?.totalWeddings || 0, icon: PartyPopper, color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10" },
                        { label: t("admin.overview.stats.activeHirers", { defaultValue: "អ្នកប្រើប្រាស់សរុប" }), value: data?.stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
                        { label: t("admin.overview.stats.globalGuests", { defaultValue: "ភ្ញៀវសរុប" }), value: data?.stats?.totalGuests || 0, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                        { label: t("admin.overview.stats.ipBlacklist", { defaultValue: "បញ្ជីខ្មៅ IP" }), value: data?.stats?.blacklistedIPs || 0, icon: Lock, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" },
                    ].map((s, i) => (
                        <m.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <Card className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/40 rounded-3xl overflow-hidden group">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-1">{s.label}</p>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{s.value}</h3>
                                    </div>
                                    <div className={cn("w-13 h-13 p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", s.bg, s.color)}>
                                        <s.icon size={26} />
                                    </div>
                                </CardContent>
                            </Card>
                        </m.div>
                    ))}
                </div>

                {/* ─── 9 Core Super Admin Modules Hub ─── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="text-red-600" size={20} />
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                ផ្ទាំងបញ្ជាមុខងារសំខាន់ៗទាំង ៩ (Super Admin Modules)
                            </h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            9 Active Management Systems
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {adminModules.map((mItem, idx) => (
                            <Link key={idx} to={mItem.href} className="group block">
                                <Card className="h-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-red-500/40 dark:hover:border-red-500/40 transition-all rounded-3xl overflow-hidden active:scale-[0.98]">
                                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", mItem.bgColor, mItem.color)}>
                                                <mItem.icon size={24} />
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                                {mItem.badge}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors flex items-center justify-between">
                                                <span>{mItem.title}</span>
                                                <ArrowRight size={16} className="text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                                            </h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                {mItem.subtitle}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed pt-1">
                                                {mItem.desc}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ─── Recent Weddings Table & System Health ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                    {/* Recent Weddings Table */}
                    <Card className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/40 rounded-3xl overflow-hidden">
                        <CardHeader className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/60 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {t("admin.overview.recentWeddings.title", { defaultValue: "កម្មវិធីមង្គលការថ្មីៗ" })}
                                </CardTitle>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                    {t("admin.overview.recentWeddings.subtitle", { defaultValue: "ការចុះឈ្មោះប្រើប្រាស់ចុងក្រោយ" })}
                                </p>
                            </div>
                            <Link to="/admin/master/weddings">
                                <Button variant="ghost" className="text-xs font-bold text-slate-500 hover:text-red-600 rounded-xl">
                                    {t("admin.overview.recentWeddings.viewAll", { defaultValue: "មើលទាំងអស់" })} <ArrowRight size={14} className="ml-1.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(!data?.recentWeddings || data.recentWeddings.length === 0) ? (
                                <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                                        <PartyPopper size={30} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {t("admin.overview.recentWeddings.empty", { defaultValue: "មិនទាន់មានកម្មវិធីមង្គលការនៅឡើយទេ" })}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            ទិន្នន័យមង្គលការថ្មីៗនឹងបង្ហាញនៅត្រង់នេះនៅពេលមានការបង្កើតកម្មវិធី។
                                        </p>
                                    </div>
                                    <Link to="/admin/master/weddings">
                                        <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold mt-2">
                                            គ្រប់គ្រងកម្មវិធីទាំងអស់
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400">
                                                    {t("admin.overview.recentWeddings.table.name", { defaultValue: "ឈ្មោះគូស្នេហ៍" })}
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400">
                                                    {t("admin.overview.recentWeddings.table.plan", { defaultValue: "កញ្ចប់សេវា" })}
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400">
                                                    {t("admin.overview.recentWeddings.table.status", { defaultValue: "ស្ថានភាព" })}
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 text-right">
                                                    {t("admin.overview.recentWeddings.table.created", { defaultValue: "ថ្ងៃបង្កើត" })}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {data.recentWeddings.map((w) => (
                                                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{w.groomName} & {w.brideName}</span>
                                                            <span className="text-[11px] text-slate-400 font-mono">ID: {w.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg",
                                                            w.packageType === 'PREMIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                                w.packageType === 'PRO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                                    'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                                                        )}>
                                                            {w.packageType || 'FREE'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn("w-2 h-2 rounded-full", w.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700')} />
                                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{w.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                                                            {new Date(w.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: System Health & Support */}
                    <m.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
                        {/* System Health */}
                        <Card className="bg-card text-card-foreground border border-border/80 shadow-xs rounded-3xl overflow-hidden">
                            <CardHeader className="p-6 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>{t("admin.overview.systemHealth.title", { defaultValue: "សុខភាពប្រព័ន្ធ" })}</span>
                                </CardTitle>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Real-time
                                </span>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                {[
                                    { label: t("admin.overview.systemHealth.ipFirewalls", { defaultValue: "រនាំងការពារ IP" }), status: t("admin.overview.systemHealth.active", { defaultValue: "សកម្ម" }), icon: ShieldCheck },
                                    { label: t("admin.overview.systemHealth.cdn", { defaultValue: "ប្រព័ន្ធផ្ទុកឯកសារ (CDN)" }), status: t("admin.overview.systemHealth.connected", { defaultValue: "បានភ្ជាប់" }), icon: Globe },
                                    { label: t("admin.overview.systemHealth.database", { defaultValue: "មូលដ្ឋានទិន្នន័យ (Database)" }), status: data?.stats?.dbHealth === "HEALTHY" ? t("admin.overview.systemHealth.connected", { defaultValue: "បានភ្ជាប់" }) : (data?.stats?.dbHealth || "បានភ្ជាប់"), icon: Database },
                                    { label: t("admin.overview.systemHealth.security", { defaultValue: "សន្តិសុខ" }), status: t("admin.overview.systemHealth.protected", { defaultValue: "សុវត្ថិភាព" }), icon: ShieldAlert },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <item.icon size={16} />
                                            </div>
                                            <span className="text-xs font-bold text-foreground">{item.label}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                            {item.status}
                                        </span>
                                    </div>
                                ))}

                                <div className="grid grid-cols-2 gap-3 pt-3">
                                    <Link to="/admin/master/settings">
                                        <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-bold border-border bg-card hover:bg-muted">
                                            {t("admin.overview.globalSettings", { defaultValue: "ការកំណត់ទូទៅ" })}
                                        </Button>
                                    </Link>
                                    <Link to="/api/admin/master/export">
                                        <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-bold border-border bg-card hover:bg-muted">
                                            {t("admin.overview.systemHealth.export", { defaultValue: "ទាញយកទិន្នន័យ" })}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Support Desk */}
                        <Card className="bg-card border border-border/80 shadow-xs rounded-3xl overflow-hidden p-5">
                            <Link to="/admin/master/support" className="block">
                                <Button variant="outline" className="w-full h-13 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 group transition-all hover:bg-rose-100/60 dark:hover:bg-rose-500/20">
                                    <LifeBuoy size={18} className="group-hover:rotate-45 transition-transform" />
                                    <span>{t("admin.overview.actions.supportDesk", { defaultValue: "ផ្នែកជំនួយអតិថិជន (Support Tickets)" })}</span>
                                    <span className="bg-rose-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black ml-1">LIVE</span>
                                </Button>
                            </Link>
                        </Card>
                    </m.div>
                </div>
            </main>
        </div>
    );
}
