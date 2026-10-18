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
    Headphones,
    AlertCircle
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
    const [loadError, setLoadError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const res = await fetch("/api/admin/master/support");
            if (!res.ok) {
                throw new Error(`Request failed (${res.status})`);
            }
            const data = await res.json();
            if (!Array.isArray(data)) {
                throw new Error("Invalid support ticket response");
            }
            setTickets(data);
        } catch (e) {
            console.error(e);
            setLoadError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        if (updatingId) return;
        setUpdatingId(id);
        try {
            const res = await fetch("/api/admin/master/support", {
                method: "PATCH",
                body: JSON.stringify({ id, status }),
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) {
                throw new Error(`Request failed (${res.status})`);
            }
            showToast({
                title: status === 'CLOSED' ? "សំណើត្រូវបានដោះស្រាយរួចរាល់" : "បានបើកសំណើឡើងវិញ",
                type: "success"
            });
            await loadData();
        } catch (e) {
            console.error(e);
            showToast({
                title: "មិនអាចធ្វើបច្ចុប្បន្នភាពសំណើបានទេ",
                description: e instanceof Error ? e.message : String(e),
                type: "error"
            });
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="w-full min-h-full font-kantumruy pb-16">
            {/* Top Bar Header */}
            <div className="bg-card/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-3 py-3 sm:px-8 sm:py-0 sm:h-20 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" aria-label="ត្រឡប់ទៅទំព័រគ្រប់គ្រង" className="shrink-0 rounded-xl h-10 w-10 border border-border bg-card shadow-xs hover:bg-muted">
                                <ArrowLeft size={17} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs sm:text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                                <ShieldCheck size={13} />
                                <span className="truncate">{t("admin.support.ticket.masterControl", { defaultValue: "ផ្នែកជំនួយអតិថិជន (Live Support Desk)" })}</span>
                            </div>
                            <h1 className="text-base sm:text-xl font-bold leading-snug text-foreground">
                                {t("admin.support.title", { defaultValue: "ផ្នែកជំនួយអតិថិជន (Support Tickets)" })}
                            </h1>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <Button
                            onClick={loadData}
                            variant="outline"
                            disabled={loading}
                            aria-label={t("admin.support.refresh", { defaultValue: "ផ្ទុកឡើងវិញ" })}
                            className="h-10 w-10 sm:w-auto sm:px-4 rounded-xl font-bold text-xs border border-border bg-card shadow-xs flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">{t("admin.support.refresh", { defaultValue: "ផ្ទុកឡើងវិញ" })}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto min-h-[60vh] p-3 sm:p-8 space-y-4 sm:space-y-6">
                {loading && tickets.length === 0 ? (
                    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 py-16">
                        <Loader2 className="w-10 h-10 animate-spin text-teal-700 dark:text-teal-300" />
                        <p className="text-xs font-bold text-muted-foreground">
                            {t("admin.support.syncing", { defaultValue: "កំពុងទាញយកទិន្នន័យ..." })}
                        </p>
                    </div>
                ) : loadError ? (
                    <Card className="mx-auto mt-6 max-w-xl bg-card border border-rose-500/20 rounded-2xl shadow-xs">
                        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center sm:p-8">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                <AlertCircle size={26} />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-base font-bold text-foreground">មិនអាចទាញយកសំណើជំនួយបានទេ</h3>
                                <p className="text-xs leading-relaxed text-muted-foreground">សូមពិនិត្យការតភ្ជាប់ រួចសាកល្បងម្ដងទៀត។</p>
                            </div>
                            <Button onClick={loadData} variant="outline" className="h-10 rounded-xl px-5 text-xs font-bold">
                                <RotateCcw size={14} className="mr-2" />
                                {t("admin.support.refresh", { defaultValue: "ផ្ទុកឡើងវិញ" })}
                            </Button>
                        </CardContent>
                    </Card>
                ) : tickets.length === 0 ? (
                    <Card className="mx-auto mt-6 max-w-xl bg-card border border-border/80 rounded-2xl shadow-xs text-center">
                        <CardContent className="flex flex-col items-center justify-center space-y-4 px-5 py-12 sm:px-8 sm:py-16">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-800 dark:text-teal-300 sm:h-16 sm:w-16">
                                <Headphones size={28} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-foreground">
                                    {t("admin.support.noTickets", { defaultValue: "មិនទាន់មានសំណើសុំជំនួយនៅឡើយទេ" })}
                                </h3>
                                <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">
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
                            {tickets.map((ticket) => (
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
                                        <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-8">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider",
                                                            ticket.status === 'OPEN' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                        )}>
                                                            {ticket.status}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                                                            <Flag size={12} className={cn(ticket.priority === 'HIGH' ? "text-rose-500" : "text-muted-foreground")} />
                                                            {ticket.priority || "NORMAL"}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground sm:text-xs">
                                                            <Clock size={12} />
                                                            {new Date(ticket.createdAt).toLocaleString('km-KH', {
                                                                timeZone: 'Asia/Phnom_Penh',
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            })}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h3 className="break-words text-base font-bold text-foreground sm:text-lg">
                                                            {ticket.subject}
                                                        </h3>
                                                        <div className="mt-2 rounded-xl border border-border/60 bg-muted/40 p-3 sm:p-4">
                                                            <p className="break-words text-sm leading-relaxed text-foreground">
                                                                {ticket.message}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-teal-600/10 flex items-center justify-center text-teal-800 dark:text-teal-300 shrink-0">
                                                                <User size={18} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-xs font-bold text-foreground truncate">
                                                                    {ticket.user?.name || t("admin.support.ticket.unknown", { defaultValue: "អ្នកប្រើប្រាស់" })}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground font-mono truncate">{ticket.user?.email}</span>
                                                            </div>
                                                        </div>

                                                        {ticket.wedding && (
                                                            <div className="flex min-w-0 flex-col justify-center sm:border-l sm:border-border/60 sm:pl-4">
                                                                <span className="text-xs font-bold text-muted-foreground uppercase">
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
                                                            disabled={updatingId !== null}
                                                            onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                                                            className="h-10 px-5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
                                                        >
                                                        {updatingId === ticket.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                            <span>{t("admin.support.ticket.resolved", { defaultValue: "ដោះស្រាយរួចរាល់" })}</span>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            disabled={updatingId !== null}
                                                            onClick={() => handleUpdateStatus(ticket.id, 'OPEN')}
                                                            variant="outline"
                                                            className="h-10 px-5 font-bold text-xs rounded-xl border-border flex items-center gap-2"
                                                        >
                                                            {updatingId === ticket.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
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
