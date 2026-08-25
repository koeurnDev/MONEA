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
    ChevronRight,
    Headphones
} from "lucide-react";
import { Link } from 'react-router-dom';
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
            setTickets(Array.isArray(data) ? data : []);
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
                    title: status === 'CLOSED' ? "សំណើត្រូវបានដោះស្រាយរួចរាល់" : "បានបើកសំណើឡើងវិញ", 
                    type: "success" 
                });
                loadData();
            }
        } catch (e) {
            console.error(e);
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
                                <ShieldCheck size={13} />
                                <span>{t("admin.support.ticket.masterControl", { defaultValue: "ផ្នែកជំនួយអតិថិជន (Live Support Desk)" })}</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                {t("admin.support.title", { defaultValue: "ផ្នែកជំនួយអតិថិជន (Support Tickets)" })}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadData}
                            variant="outline"
                            disabled={loading}
                            className="h-10 px-4 rounded-xl font-bold text-xs border border-border bg-card shadow-xs flex items-center gap-2"
                        >
                            <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
                            <span>{t("admin.support.refresh", { defaultValue: "ផ្ទុកឡើងវិញ" })}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
                {loading && tickets.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-rose-600" />
                        <p className="text-xs font-bold text-muted-foreground">
                            {t("admin.support.syncing", { defaultValue: "កំពុងទាញយកទិន្នន័យ..." })}
                        </p>
                    </div>
                ) : tickets.length === 0 ? (
                    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs py-24 text-center">
                        <CardContent className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                <Headphones size={28} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-foreground">
                                    {t("admin.support.noTickets", { defaultValue: "មិនទាន់មានសំណើសុំជំនួយនៅឡើយទេ" })}
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                    នៅពេលអតិថិជនផ្ញើសំបុត្រជំនួយ ឬសំណួរពី Dashboard របស់ពួកគេ សំបុត្រទាំងអស់នឹងបង្ហាញនៅទីនេះ។
                                </p>
                            </div>
                            <Button
                                onClick={loadData}
                                variant="outline"
                                className="h-10 px-5 rounded-xl text-xs font-bold border-border mt-2"
                            >
                                <RotateCcw size={14} className="mr-1.5" />
                                {t("admin.support.refresh", { defaultValue: "ពិនិត្យឡើងវិញ" })}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {tickets.map((ticket, idx) => (
                                <m.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    layout
                                >
                                    <Card className={cn(
                                        "bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden transition-all",
                                        ticket.status === 'OPEN' ? "border-l-4 border-l-rose-500" : "border-l-4 border-l-emerald-500 opacity-90"
                                    )}>
                                        <CardContent className="p-6 sm:p-8 space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                                                            ticket.status === 'OPEN' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                        )}>
                                                            {ticket.status}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                                                            <Flag size={12} className={cn(ticket.priority === 'HIGH' ? "text-rose-500" : "text-muted-foreground")} />
                                                            {ticket.priority || "NORMAL"}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {new Date(ticket.createdAt).toLocaleString(idx === 0 ? 'km-KH' : 'en-US', { 
                                                                timeZone: 'Asia/Phnom_Penh',
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            })}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-lg font-bold text-foreground">
                                                            {ticket.subject}
                                                        </h3>
                                                        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 mt-2">
                                                            <p className="text-foreground text-sm leading-relaxed">
                                                                {ticket.message}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                                                                <User size={18} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-xs font-bold text-foreground truncate">
                                                                    {ticket.user?.name || t("admin.support.ticket.unknown", { defaultValue: "អ្នកប្រើប្រាស់" })}
                                                                </span>
                                                                <span className="text-[11px] text-muted-foreground font-mono truncate">{ticket.user?.email}</span>
                                                            </div>
                                                        </div>

                                                        {ticket.wedding && (
                                                            <div className="flex flex-col justify-center border-l border-border/60 pl-4">
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                    {t("admin.support.ticket.affiliated", { defaultValue: "មង្គលការដែលពាក់ព័ន្ធ" })}
                                                                </span>
                                                                <span className="text-xs font-bold text-foreground truncate">
                                                                    {ticket.wedding?.groomName} & {ticket.wedding?.brideName}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 pt-2 sm:pt-0">
                                                    {ticket.status === 'OPEN' ? (
                                                        <Button
                                                            onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                                                            className="h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                            <span>{t("admin.support.ticket.resolved", { defaultValue: "ដោះស្រាយរួចរាល់" })}</span>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleUpdateStatus(ticket.id, 'OPEN')}
                                                            variant="outline"
                                                            className="h-10 px-5 font-bold text-xs rounded-xl border-border flex items-center gap-2"
                                                        >
                                                            <RotateCcw size={14} />
                                                            <span>{t("admin.support.ticket.reopen", { defaultValue: "បើកសំណើឡើងវិញ" })}</span>
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
            </main>
        </div>
    );
}
