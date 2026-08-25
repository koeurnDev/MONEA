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
    Filter,
    ArrowUpRight,
    Loader2,
    RefreshCcw,
    Shield,
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
        { id: "CHECK_IN", label: isKm ? "Check-in ភ្ញៀវ" : "Guest Check-in", icon: UserCheck },
        { id: "GIFT", label: isKm ? "ទទួលចំណងដៃ" : "Gift Remittance", icon: Gift },
        { id: "UPDATE", label: isKm ? "កែសម្រួលទិន្នន័យ" : "Data Updates", icon: FileText },
    ];

    const getActionBadge = (action: string) => {
        switch (action) {
            case "CHECK_IN":
                return { label: "Check-in ភ្ញៀវ", bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
            case "GIFT":
                return { label: "ចំណងដៃ KHQR", bg: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
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
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border bg-card shadow-xs hover:bg-muted">
                                <ArrowLeft size={17} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                <History size={13} />
                                <span>Platform Accountability</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                {isKm ? "កំណត់ត្រាសវនកម្មប្រព័ន្ធ (Global Audit Trail)" : "Global Audit Explorer"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => loadData(page)}
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
                                    <Icon size={14} className={isActive ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="ស្វែងរកកំណត់ត្រា, IP, អ្នកអនុវត្ត..."
                            className="h-11 pl-10 rounded-xl border border-input bg-card text-xs font-kantumruy"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Audit Logs Table Card */}
                <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">ពេលវេលា (Time)</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">សកម្មភាព (Action)</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">ព័ត៌មានលម្អិត (Details)</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">អ្នកអនុវត្ត (Actor)</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">មង្គលការ (Wedding)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-xs">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
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
                                                <p className="text-[11px] text-muted-foreground">រាល់សកម្មភាព check-in និងទិន្នន័យសំខាន់ៗនឹងបង្ហាញនៅទីនេះ។</p>
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
                                                        <span className="font-bold text-foreground font-mono text-[11px]">
                                                            {new Date(log.createdAt).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Phnom_Penh' })}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(log.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md border", badge.bg)}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-foreground line-clamp-2 max-w-md">
                                                        {log.description || "—"}
                                                    </p>
                                                    {log.ip && (
                                                        <span className="text-[10px] text-muted-foreground font-mono">
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
                                                                <span className="text-[9px] text-muted-foreground font-mono">
                                                                    ID: {log.wedding.id.substring(0, 8)}
                                                                </span>
                                                            </div>
                                                            <Link to={`/admin/weddings/${log.wedding.id}`}>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10">
                                                                    <ArrowUpRight size={13} />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-[11px]">—</span>
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
