"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowUpRight, Sparkles, CheckCircle2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from 'framer-motion';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchLogs = useCallback(async () => {
        try {
            const url = filter === "all" ? "/api/admin/logs?limit=50" : `/api/admin/logs?limit=50&action=${filter}`;
            const res = await fetch(url);
            if (res.ok) setLogs(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter(log =>
        log.actorName.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">គម្រោងត្រួតពិនិត្យ (Audit Logs)</h2>
                    <p className="text-slate-500 font-medium text-sm">តាមដានរាល់សកម្មភាពរបស់អ្នកប្រើប្រាស់ និងបុគ្គលិកក្នុងប្រព័ន្ធ។</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchLogs} variant="outline" className="h-10 rounded-xl font-bold">ផ្ទុកឡើងវិញ</Button>
                </div>
            </div>

            <Card className="bg-white border-slate-100 shadow-sm rounded-[2rem] border overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="ស្វែងរកឈ្មោះ ឬសកម្មភាព..."
                            className="pl-10 h-10 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl">
                                <SelectValue placeholder="ប្រភេទសកម្មភាព" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ទាំងអស់</SelectItem>
                                <SelectItem value="CREATE">បង្កើតថ្មី</SelectItem>
                                <SelectItem value="UPDATE">កែប្រែ</SelectItem>
                                <SelectItem value="DELETE">លុប</SelectItem>
                                <SelectItem value="GIFT">ផ្ញើកាដូ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                                    <th className="px-8 py-4">កាលបរិច្ឆេទ</th>
                                    <th className="px-8 py-4">អ្នកធ្វើការងារ</th>
                                    <th className="px-8 py-4">សកម្មភាព</th>
                                    <th className="px-8 py-4">ព័ត៌មានលម្អិត</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLogs.map((log, i) => (
                                    <m.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-8 py-5 text-xs font-bold text-slate-400 tabular-nums">
                                            {new Date(log.createdAt).toLocaleString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                <span className="text-sm font-bold text-slate-900">{log.actorName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black ${log.action === 'CREATE' ? 'bg-green-50 text-green-600' :
                                                    log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                                                        log.action === 'GIFT' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-blue-50 text-blue-600'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-600 font-kantumruy">
                                            {log.description}
                                        </td>
                                    </m.tr>
                                ))}
                                {filteredLogs.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-slate-400 font-medium">
                                            មិនមានកំណត់ត្រាដែលត្រូវនឹងការស្វែងរករបស់អ្នកឡើយ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
