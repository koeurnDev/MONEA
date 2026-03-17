"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MasterAuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [pagination, setPagination] = useState<any>(null);

    const loadData = useCallback((page = 1) => {
        setLoading(true);
        fetch(`/api/admin/master/audit?search=${search}&action=${actionFilter}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                setLogs(data.logs);
                setPagination(data.pagination);
            })
            .finally(() => setLoading(false));
    }, [search, actionFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadData(1);
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global Audit Explorer</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">System-Wide Accountability</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by description or actor..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-12 h-12 rounded-2xl bg-white border-slate-100 shadow-sm"
                            />
                        </div>
                        <Button className="h-12 bg-slate-900 text-white px-8 rounded-2xl font-bold uppercase tracking-widest text-xs">
                            Search Logs
                        </Button>
                    </form>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wedding Party</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-red-600" />
                                            Reading Audit Trail...
                                        </td>
                                    </tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">{new Date(log.createdAt).toLocaleTimeString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(log.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2 py-1 rounded-md",
                                                log.action === 'CHECK_IN' ? 'bg-green-100 text-green-700' :
                                                    log.action === 'GIFT' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                            )}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-medium text-slate-600 line-clamp-1">{log.description}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-slate-300" />
                                                <span className="text-xs font-bold text-slate-800">{log.actorName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900">{log.wedding?.groomName} & {log.wedding?.brideName}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">ID: {log.wedding?.id.substring(0, 8)}</span>
                                                </div>
                                                <Link href={`/dashboard?weddingId=${log.wedding?.id}`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowUpRight size={14} />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {pagination && pagination.pages > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: pagination.pages }).map((_, i) => (
                            <Button
                                key={i}
                                onClick={() => loadData(i + 1)}
                                variant={pagination.currentPage === i + 1 ? "default" : "outline"}
                                className={cn(
                                    "w-10 h-10 rounded-xl font-bold transition-all",
                                    pagination.currentPage === i + 1 ? "bg-slate-900 shadow-lg shadow-slate-200" : "border-slate-100 bg-white"
                                )}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
