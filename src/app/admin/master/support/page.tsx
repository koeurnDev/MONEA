"use client";
import React, { useEffect, useState } from "react";
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
    RotateCcw,
    History,
    MessageSquare,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, m } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

export default function MasterSupportPage() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/master/support");
            const data = await res.json();
            setTickets(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/admin/master/support", {
                method: "PATCH",
                body: JSON.stringify({ id, status }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                showToast({ 
                    title: status === 'CLOSED' ? "Ticket Resolved" : "Ticket Re-opened", 
                    type: "success" 
                });
                loadData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 p-6 md:p-12 relative overflow-hidden">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />

            <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-12 relative"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/master">
                                <m.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                    </Button>
                                </m.div>
                            </Link>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                                    <ShieldCheck size={14} />
                                    {t("admin.support.ticket.masterControl")}
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                                    {t("admin.support.title")}
                                </h1>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                                    {t("admin.support.subtitle")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadData}
                            variant="outline"
                            disabled={loading}
                            className="h-12 px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-2"
                        >
                            <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
                            {t("admin.support.refresh")}
                        </Button>
                    </div>
                </div>

                {loading && tickets.length === 0 ? (
                    <div className="py-40 flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                            <Loader2 className="animate-spin text-indigo-600 relative" size={48} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
                            {t("admin.support.syncing")}
                        </p>
                    </div>
                ) : tickets.length === 0 ? (
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-40 text-center bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[4rem] border border-dashed border-slate-200 dark:border-slate-800"
                    >
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <LifeBuoy className="text-slate-300 dark:text-slate-700" size={32} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            {t("admin.support.noTickets")}
                        </p>
                    </m.div>
                ) : (
                    <m.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-12"
                    >
                        <AnimatePresence mode="popLayout">
                            {tickets.map((ticket, idx) => (
                                <m.div
                                    key={ticket.id}
                                    variants={itemVariants}
                                    layout
                                >
                                    <Card className={cn(
                                        "border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative transition-all group",
                                        ticket.status === 'OPEN' ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-2 before:bg-red-500" : "opacity-90 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-2 before:bg-emerald-500"
                                    )}>
                                        <CardContent className="p-10 md:p-14">
                                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
                                                <div className="space-y-8 flex-1">
                                                    <div className="flex flex-wrap items-center gap-6">
                                                        <div className={cn(
                                                            "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                                                            ticket.status === 'OPEN' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                        )}>
                                                            {ticket.status}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-2xl">
                                                            <Flag size={14} className={cn(ticket.priority === 'HIGH' ? "text-red-500" : "text-slate-300")} />
                                                            {ticket.priority}
                                                        </div>
                                                        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <Clock size={14} /> 
                                                            {new Date(ticket.createdAt).toLocaleString(idx === 0 ? 'km-KH' : 'en-US', { 
                                                                timeZone: 'Asia/Phnom_Penh',
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase group-hover:text-indigo-600 transition-colors">
                                                            {ticket.subject}
                                                        </h3>
                                                        <div className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mt-4 relative">
                                                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300">
                                                                <MessageSquare size={20} />
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed font-kantumruy">
                                                                {ticket.message}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                                                <User size={28} className="text-indigo-600" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xl font-black text-slate-900 dark:text-white font-kantumruy leading-none mb-1.5">
                                                                    {ticket.user?.name || t("admin.support.ticket.unknown")}
                                                                </span>
                                                                <span className="text-xs text-slate-400 font-medium tabular-nums">{ticket.user?.email}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-center border-l border-slate-100 dark:border-slate-800 pl-10">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 opacity-60">
                                                                <LifeBuoy size={14} /> 
                                                                {t("admin.support.ticket.affiliated")}
                                                            </span>
                                                            <span className="text-lg font-black text-slate-700 dark:text-slate-200 font-kantumruy flex items-center gap-2">
                                                                {ticket.wedding?.groomName} <span className="text-slate-300 font-medium mx-1">&</span> {ticket.wedding?.brideName}
                                                                <ChevronRight size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 pt-4 lg:pt-0">
                                                    {ticket.status === 'OPEN' ? (
                                                        <Button
                                                            onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                                                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] h-20 px-12 rounded-[2rem] shadow-2xl shadow-slate-300 dark:shadow-black/50 transition-all hover:scale-105 active:scale-95 flex gap-3 group/btn"
                                                        >
                                                            <CheckCircle2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                            {t("admin.support.ticket.resolved")}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleUpdateStatus(ticket.id, 'OPEN')}
                                                            variant="outline"
                                                            className="border-dashed border-2 border-slate-200 dark:border-slate-800 font-black uppercase tracking-[0.2em] text-[10px] h-20 px-12 rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 transition-all flex gap-3 active:scale-95 text-slate-500"
                                                        >
                                                            <RotateCcw size={20} />
                                                            {t("admin.support.ticket.reopen")}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </m.div>
                            ))}
                        </AnimatePresence>
                    </m.div>
                )}

                {/* Footer History Trace */}
                <m.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center pt-12 pb-20"
                >
                    <Link href="/admin/master/settings">
                        <Button variant="link" className="text-slate-400 hover:text-indigo-600 flex items-center gap-3 font-black uppercase tracking-widest text-[10px] transition-colors">
                            <History size={16} />
                            {t("admin.support.return")}
                        </Button>
                    </Link>
                </m.div>
            </m.div>
        </div>
    );
}
