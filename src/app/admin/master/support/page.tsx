"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LifeBuoy,
    ArrowLeft,
    MessageSquare,
    User,
    Clock,
    CheckCircle2,
    Loader2,
    Flag
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MasterSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        fetch("/api/admin/master/support")
            .then(res => res.json())
            .then(setTickets)
            .finally(() => setLoading(false));
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        await fetch("/api/admin/master/support", {
            method: "PATCH",
            body: JSON.stringify({ id, status }),
            headers: { "Content-Type": "application/json" }
        });
        loadData();
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Support Desk</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Hirer Assistance Console</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                ) : tickets.length === 0 ? (
                    <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        No support tickets found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((t) => (
                            <Card key={t.id} className="border-none shadow-sm shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white border-l-4 border-l-red-500">
                                <CardContent className="p-8">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Flag className={cn(
                                                    "w-4 h-4",
                                                    t.priority === 'HIGH' ? 'text-red-500' : 'text-slate-300'
                                                )} />
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t.subject}</h3>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                                    t.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                )}>
                                                    {t.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 font-medium leading-relaxed">{t.message}</p>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User size={12} className="text-slate-400" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-900">{t.user?.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">({t.user?.email})</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <LifeBuoy size={14} /> Party: {t.wedding?.groomName} & {t.wedding?.brideName}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <Clock size={14} /> {new Date(t.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {t.status === 'OPEN' ? (
                                                <Button
                                                    onClick={() => handleUpdateStatus(t.id, 'CLOSED')}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-green-100"
                                                >
                                                    Mark Resolved
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleUpdateStatus(t.id, 'OPEN')}
                                                    variant="outline"
                                                    className="border-slate-100 font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl hover:bg-slate-50"
                                                >
                                                    Re-open Ticket
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
