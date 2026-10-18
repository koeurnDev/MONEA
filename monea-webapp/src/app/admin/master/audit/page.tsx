import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    ArrowLeft,
    History,
    User,
    Clock,
    Globe,
    ArrowUpRight,
    Loader2,
    RefreshCcw,
    Gift,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    FileText
} from "lucide-react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

export default function MasterAuditPage() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';

    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const loadData = useCallback((currentPage = 1) => {
        setLoading(true);
        fetch(`/api/admin/master/audit?search=${encodeURIComponent(search)}&action=${actionFilter === 'ALL' ? '' : actionFilter}&page=${currentPage}`)
            .then(res => res.json())
            .then(data => {
                setLogs(data.logs || []);
                setPagination(data.pagination || null);
            })
            .catch(() => {
                setLogs([]);
                setPagination(null);
            })
            .finally(() => setLoading(false));
    }, [search, actionFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            loadData(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, actionFilter, loadData]);

    useEffect(() => {
        loadData(page);
    }, [page, loadData]);

    const filterTabs = [
        { id: "ALL", label: isKm ? "កំណត់ត្រាទាំងអស់" : "All Events", icon: History },
        { id: "UPDATE", label: isKm ? "កែសម្រួលទិន្នន័យ" : "Data Updates", icon: FileText },
    ];

    const getActionBadge = (action: string) => {
        switch (action) {
            case "UPDATE":
                return { label: "កែប្រែទិន្នន័យ", bg: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
            case "DELETE":
                return { label: "លុបទិន្នន័យ", bg: "bg-rose-500/10 text-rose-600 border-rose-500/20" };
            default:
                return { label: action || "EVENT", bg: "bg-muted text-muted-foreground border-border/60" };
        }
    };

    return (
        <div className="w-full min-h-full font-kantumruy pb-16">
            {/* Top Bar Header */}
            <div className="bg-card/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-3 py-3 sm:px-8 sm:py-0 sm:h-20 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" aria-label={isKm ? "ត្រឡប់ទៅទំព័រគ្រប់គ្រង" : "Back to admin"} className="shrink-0 rounded-xl h-10 w-10 border border-border bg-card shadow-xs hover:bg-muted">
                                <ArrowLeft size={17} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs sm:text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                                <History size={13} />
                                <span>{isKm ? "ប្រវត្តិសកម្មភាពប្រព័ន្ធ" : "Platform Accountability"}</span>
                            </div>
                            <h1 className="truncate text-base sm:text-xl font-bold text-foreground">
                                {isKm ? "កំណត់ត្រាសវនកម្ម" : "Global Audit Explorer"}
                            </h1>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <Button
                            onClick={() => loadData(page)}
                            variant="outline"
                            disabled={loading}
                            aria-label={isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}
                            className="h-10 w-10 sm:w-auto sm:px-4 rounded-xl font-bold text-xs border border-border bg-card shadow-xs flex items-center justify-center gap-2"
                        >
                            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">{isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-3 sm:p-8 space-y-4 sm:space-y-6">
                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/60 overflow-x-auto scrollbar-none">
                        {filterTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = actionFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActionFilter(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                                        isActive
                                            ? "bg-card text-foreground shadow-xs border border-border/80"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                    )}
                                >
                                    <Icon size={14} className={isActive ? "text-teal-800 dark:text-teal-300" : "text-muted-foreground"} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder={isKm ? "ស្វែងរកកំណត់ត្រា ឬអ្នកអនុវត្ត..." : "Search logs or actors..."}
                            aria-label={isKm ? "ស្វែងរកកំណត់ត្រាសវនកម្ម" : "Search audit logs"}
                            className="h-11 pl-10 rounded-xl border border-input bg-card text-xs font-kantumruy"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Audit Logs Table Card */}
                <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                    <div className="space-y-3 p-3 md:hidden">
                        {loading && logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center" role="status">
                                <Loader2 className="h-7 w-7 animate-spin text-teal-700 dark:text-teal-300" />
                                <span className="text-xs font-bold text-muted-foreground">កំពុងទាញយកកំណត់ត្រាសវនកម្ម...</span>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                <History size={28} className="text-muted-foreground/60" />
                                <p className="text-xs font-bold text-foreground">មិនមានកំណត់ត្រាសវនកម្មទេ</p>
                                <p className="text-xs text-muted-foreground">សកម្មភាពសំខាន់ៗក្នុងប្រព័ន្ធនឹងបង្ហាញនៅទីនេះ។</p>
                            </div>
                        ) : logs.map((log) => {
                            const badge = getActionBadge(log.action);
                            const timestamp = new Date(log.createdAt);
                            return (
                                <article key={log.id} className="rounded-xl border border-border/70 bg-background p-3.5 shadow-xs">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-2">
                                            <Clock size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0">
                                                <p className="font-mono text-xs font-bold text-foreground">
                                                    {timestamp.toLocaleTimeString(isKm ? "km-KH" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Phnom_Penh" })}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {timestamp.toLocaleDateString(isKm ? "km-KH" : "en-US", { timeZone: "Asia/Phnom_Penh" })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={cn("shrink-0 rounded-md border px-2 py-1 text-xs font-black uppercase", badge.bg)}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    <p className="mt-3 break-words text-xs font-medium leading-relaxed text-foreground">
                                        {log.description || "—"}
                                    </p>
                                    {log.ip && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Globe size={12} className="shrink-0" />
                                            <span className="font-mono break-all">IP: {log.ip}</span>
                                        </div>
                                    )}

                                    <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border/60 pt-3">
                                        <div className="flex min-w-0 items-center gap-2 text-xs">
                                            <UserCheck size={13} className="shrink-0 text-muted-foreground" />
                                            <span className="truncate font-semibold text-foreground">{log.actorName || "System / Staff"}</span>
                                        </div>
                                        {log.wedding && (
                                            <div className="flex min-w-0 items-center gap-2 text-xs">
                                                <Gift size={13} className="shrink-0 text-muted-foreground" />
                                                <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                                                    {log.wedding.groomName} & {log.wedding.brideName}
                                                </span>
                                                <Link to={`/admin/weddings/${log.wedding.id}`} aria-label={isKm ? "មើលព័ត៌មានមង្គលការ" : "View wedding"}>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground hover:text-teal-800 hover:bg-teal-600/10 dark:hover:text-teal-300">
                                                        <ArrowUpRight size={13} />
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-widest">ពេលវេលា (Time)</th>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-widest">សកម្មភាព (Action)</th>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-widest">ព័ត៌មានលម្អិត (Details)</th>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-widest">អ្នកអនុវត្ត (Actor)</th>
                                    <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-widest">មង្គលការ (Wedding)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-xs">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Loader2 className="w-7 h-7 animate-spin text-teal-700 dark:text-teal-300" />
                                                <span className="text-xs text-muted-foreground font-bold">កំពុងទាញយកកំណត់ត្រាសវនកម្ម...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-1.5">
                                                <History size={28} className="text-muted-foreground/60 mb-1" />
                                                <p className="text-xs font-bold text-foreground">មិនមានកំណត់ត្រាសវនកម្មទេ</p>
                                                <p className="text-xs text-muted-foreground">រាល់សកម្មភាព check-in និងទិន្នន័យសំខាន់ៗនឹងបង្ហាញនៅទីនេះ។</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => {
                                        const badge = getActionBadge(log.action);
                                        return (
                                            <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground font-mono text-xs">
                                                            {new Date(log.createdAt).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Phnom_Penh' })}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(log.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn("text-xs font-black uppercase px-2 py-0.5 rounded-md border", badge.bg)}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-foreground line-clamp-2 max-w-md">
                                                        {log.description || "—"}
                                                    </p>
                                                    {log.ip && (
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            IP: {log.ip}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                                            <User size={12} />
                                                        </div>
                                                        <span className="font-bold text-foreground">
                                                            {log.actorName || "System / Staff"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {log.wedding ? (
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-bold text-foreground truncate max-w-[140px]">
                                                                    {log.wedding.groomName} & {log.wedding.brideName}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground font-mono">
                                                                    ID: {log.wedding.id.substring(0, 8)}
                                                                </span>
                                                            </div>
                                                            <Link to={`/admin/weddings/${log.wedding.id}`}>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-teal-800 hover:bg-teal-600/10 dark:hover:text-teal-300">
                                                                    <ArrowUpRight size={13} />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="h-9 px-3 rounded-xl text-xs font-bold"
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            ទំព័រមុន
                        </Button>
                        <span className="text-xs font-bold px-3 text-muted-foreground">
                            {page} / {pagination.pages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={page >= pagination.pages}
                            className="h-9 px-3 rounded-xl text-xs font-bold"
                        >
                            ទំព័របន្ទាប់
                            <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
