"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, ArrowUpRight, Users, Gift, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MasterWeddingsPage() {
    const [weddings, setWeddings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState<any>(null);

    const loadData = (page = 1) => {
        setLoading(true);
        fetch(`/api/admin/master/weddings?search=${search}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                setWeddings(data.weddings);
                setPagination(data.pagination);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadData(1);
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Wedding Management</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Admin អ្នកជួលកម្មវិធី</p>
                        </div>
                    </div>
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or code..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-12 h-12 rounded-2xl bg-white border-slate-100 shadow-sm"
                        />
                    </form>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wedding Party</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Plan / Code</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Engagement</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner / Email</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600 mb-4" />
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Loading Data...</p>
                                        </td>
                                    </tr>
                                ) : weddings.map((w) => (
                                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{w.groomName} & {w.brideName}</span>
                                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(w.date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                                    w.packageType === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    {w.packageType}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold text-slate-400">#{w.weddingCode || '---'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="flex flex-col items-center">
                                                    <Users size={12} className="text-slate-300 mb-1" />
                                                    <span className="text-xs font-bold text-slate-600">{w._count.guests}</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <Gift size={12} className="text-slate-300 mb-1" />
                                                    <span className="text-xs font-bold text-slate-600">{w._count.gifts}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{w.user?.name || "No User"}</span>
                                                <span className="text-[10px] text-slate-400">{w.user?.email || "No Email"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link href={`/dashboard?weddingId=${w.id}`} target="_blank">
                                                <Button variant="ghost" className="h-9 px-4 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl">
                                                    Inspect <ArrowUpRight size={14} className="ml-1" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: pagination.pages }).map((_, i) => (
                            <Button
                                key={i}
                                onClick={() => loadData(i + 1)}
                                variant={pagination.currentPage === i + 1 ? "default" : "outline"}
                                className={cn(
                                    "w-10 h-10 rounded-xl font-bold",
                                    pagination.currentPage === i + 1 ? "bg-slate-900" : "border-slate-100"
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
