"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LifeBuoy,
    ArrowLeft,
    User,
    Clock,
    Loader2,
    Flag,
    ShieldCheck,
    CheckCircle2,
    RotateCcw
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, m } from "framer-motion";

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
        <div className="min-h-screen bg-background p-6 md:p-10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

            <div className="max-w-6xl mx-auto space-y-10 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-border bg-card/50 backdrop-blur-md shadow-sm hover:scale-110 active:scale-95 transition-all">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black tracking-widest uppercase mb-2 w-fit">
                                <ShieldCheck size={12} /> Master Control
                            </div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase leading-none">Support Desk</h1>
                            <p className="text-xs text-muted-foreground font-medium mt-1.5 uppercase tracking-wide">Manage and resolve user assistance requests</p>
                        </div>
                    </div>

                    <Button
                        onClick={loadData}
                        variant="outline"
                        disabled={loading}
                        className="rounded-2xl h-12 px-6 gap-2 border-border/50 bg-card/30 backdrop-blur-sm font-bold text-xs uppercase tracking-widest hover:bg-card/60 transition-all active:scale-95"
                    >
                        <RotateCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Database...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-32 text-center bg-card/30 backdrop-blur-md rounded-[3rem] border border-dashed border-border"
                    >
                        <LifeBuoy className="mx-auto text-muted-foreground/20 mb-4" size={48} />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">No active tickets found</p>
                    </m.div>
                ) : (
                    <div className="grid gap-8">
                        <AnimatePresence>
                            {tickets.map((t, idx) => (
                                <m.div
                                    key={t.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className={cn(
                                        "border border-border/50 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-xl relative transition-all",
                                        t.status === 'OPEN' ? "border-l-[6px] border-l-red-500" : "border-l-[6px] border-l-green-500 opacity-80"
                                    )}>
                                        <CardContent className="p-8 md:p-10">
                                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                                                <div className="space-y-6 flex-1">
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <div className={cn(
                                                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]",
                                                            t.status === 'OPEN' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                                                        )}>
                                                            {t.status}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1.5 rounded-xl">
                                                            <Flag size={12} className={t.priority === 'HIGH' ? "text-red-500" : "text-muted-foreground/30"} />
                                                            {t.priority}
                                                        </div>
                                                        <div className="h-4 w-[1px] bg-border/50 mx-2 hidden md:block" />
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                            <Clock size={12} /> {new Date(t.createdAt).toLocaleString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight uppercase">{t.subject}</h3>
                                                        <div className="p-8 rounded-[2rem] bg-background/40 border border-border/50 shadow-inner">
                                                            <p className="text-foreground/80 font-medium text-base leading-relaxed font-kantumruy">{t.message}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-10 pt-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                                                                <User size={20} className="text-primary" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-base font-bold text-foreground font-kantumruy leading-none mb-1">{t.user?.name || "Unknown"}</span>
                                                                <span className="text-[11px] text-muted-foreground font-medium italic">{t.user?.email}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                                <LifeBuoy size={12} /> Affiliated Party
                                                            </span>
                                                            <span className="text-sm font-bold text-foreground font-kantumruy">
                                                                {t.wedding?.groomName} & {t.wedding?.brideName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 pt-2 lg:pt-0">
                                                    {t.status === 'OPEN' ? (
                                                        <Button
                                                            onClick={() => handleUpdateStatus(t.id, 'CLOSED')}
                                                            className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-[0.2em] text-[10px] h-16 px-10 rounded-[1.5rem] shadow-2xl shadow-green-500/20 transition-all hover:scale-105 active:scale-95 flex gap-3 border-none"
                                                        >
                                                            <CheckCircle2 size={18} /> Mark Resolved
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleUpdateStatus(t.id, 'OPEN')}
                                                            variant="outline"
                                                            className="border-dashed border-2 border-border/50 font-black uppercase tracking-[0.2em] text-[10px] h-16 px-10 rounded-[1.5rem] hover:bg-background/80 transition-all flex gap-3 active:scale-95"
                                                        >
                                                            <RotateCcw size={18} /> Re-open Ticket
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </m.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
