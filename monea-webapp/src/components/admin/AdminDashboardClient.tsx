import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PartyPopper, CalendarCheck, TrendingUp, Sparkles, Activity, ShieldCheck, Database, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { m } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { ErrorBoundary } from "@/components/error-boundary";
import { useTranslation } from "@/i18n/LanguageProvider";

interface AdminStats {
    totalUsers: number;
    totalProjects: number;
    activeProjects: number;
    newProjectsToday: number;
    financialOverview: {
        USD: number;
        KHR: number;
    };
}

interface AdminDashboardClientProps {
    initialStats: AdminStats;
    initialLogs: any[];
    userRole: string | null;
}

export default function AdminDashboardClient({ initialStats, initialLogs, userRole }: AdminDashboardClientProps) {
    const { t } = useTranslation();

    const cards = [
        {
            title: t('admin.overview.stats.activeHirers'),
            value: initialStats?.totalUsers ?? 0,
            trend: "+12%",
            desc: t('account.profile.description'),
            icon: Users,
        },
        {
            title: t('admin.overview.stats.totalProjects'),
            value: initialStats?.totalProjects ?? (initialStats as any)?.totalWeddings ?? 0,
            trend: "+5.4%",
            desc: t('admin.overview.recentWeddings.subtitle'),
            icon: PartyPopper,
        },
        {
            title: t('admin.overview.stats.activeProjects'),
            value: initialStats?.activeProjects ?? (initialStats as any)?.activeWeddings ?? 0,
            trend: "Active",
            desc: t('admin.overview.stats.activeHirers'),
            icon: CalendarCheck,
        },
        {
            title: t('admin.overview.stats.totalRevenue'),
            value: initialStats?.financialOverview?.USD ?? 0,
            trend: "USD",
            desc: t('admin.overview.actions.revenueGrowth'),
            icon: TrendingUp,
        }
    ];

    return (
        <ErrorBoundary name="Admin Dashboard">
            <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-8 pb-20"
            >
                {/* Minimalist Welcome Banner */}
                <m.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 md:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500">
                                <Sparkles size={14} />
                                MONEA Intelligence v2.1
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {t('dashboard.welcome', { name: '' })} <span className="text-slate-500 font-normal">{t('admin.header.role')}</span>
                            </h2>
                            <p className="text-slate-500 max-w-md font-medium text-sm">
                                {t('dashboard.adminSubtitle')}
                            </p>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl text-center min-w-[120px]">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    LIVE
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl text-center min-w-[120px]">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Safety</div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white">99.9%</div>
                            </div>
                        </div>
                    </div>
                </m.div>

                {/* Main Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 + 0.1, duration: 0.4 }}
                        >
                            <Card className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
                                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{card.title}</CardTitle>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                                        <card.icon size={16} />
                                    </div>
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
                                            {card.value.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            {card.trend}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-4 flex items-center gap-1.5">
                                        <ArrowUpRight size={12} className="text-slate-400" />
                                        {card.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        </m.div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    <m.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-8 space-y-6"
                    >
                        <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-6 px-8 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">សកម្មភាពចុងក្រោយ</CardTitle>
                                    </div>
                                </div>
                                <Link to="/admin/logs">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg text-xs font-semibold text-slate-600 border-slate-200"
                                    >
                                        {t('admin.overview.recentWeddings.viewAll')}
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(initialLogs || []).map((log, i) => (
                                        <div key={log.id || i} className="flex items-center justify-between p-5 px-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    {log.action === 'CREATE' ? <ArrowUpRight size={16} /> :
                                                        log.action === 'GIFT' ? <Sparkles size={16} /> :
                                                            <CheckCircle2 size={16} />}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{log.actorName}</span>
                                                    <span className="text-xs text-slate-500">{log.description}</span>
                                                </div>
                                            </div>
                                            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                                {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Phnom_Penh' }) : ''}
                                            </div>
                                        </div>
                                    ))}
                                    {(!initialLogs || initialLogs.length === 0) && (
                                        <div className="p-16 text-center space-y-3">
                                            <Activity className="text-slate-300 mx-auto" size={24} />
                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t('admin.settings.support.noTickets')}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>

                    <m.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-6 px-8 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{t('admin.overview.stats.securityAudit')}</CardTitle>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{t('admin.overview.stats.failures')}</div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">24</div>
                                    </div>
                                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{t('admin.overview.stats.blocked')}</div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">0</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('admin.overview.actions.auditExplorer')}</h4>
                                    {[
                                        { ip: "103.243.24.12", attempts: 8, severity: "High" },
                                        { ip: "202.1.23.45", attempts: 3, severity: "Medium" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">{item.ip}</span>
                                                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest">{item.attempts} Attempts</span>
                                            </div>
                                            <span className="text-[9px] font-bold uppercase px-2 py-1 rounded bg-slate-200 text-slate-600">
                                                {item.severity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {userRole === "PLATFORM_OWNER" && (
                                    <Link to="/admin/master/security">
                                        <Button variant="outline" className="w-full mt-2 rounded-lg text-xs font-semibold text-slate-600 border-slate-200">
                                            {t('admin.overview.actions.auditExplorer')}
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* System Health Block */}
                        <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900">
                            <CardHeader className="py-6 px-8 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-slate-400" />
                                    <h3 className="text-lg font-bold tracking-tight">{t('admin.overview.systemHealth.title')}</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-5">
                                {[
                                    { label: "Server", value: "Online", progress: 98, icon: <Activity size={14} /> },
                                    { label: "Database", value: "Healthy", progress: 100, icon: <Database size={14} /> },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                                                <span className="text-slate-400">{item.icon}</span>
                                                {item.label}
                                            </span>
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                                {item.value}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <m.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.progress}%` }}
                                                transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                                className="h-full bg-slate-300"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </m.div>
                </div>
            </m.div>
        </ErrorBoundary>
    );
}
