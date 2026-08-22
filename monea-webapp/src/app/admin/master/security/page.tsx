"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    ShieldAlert, 
    AlertTriangle, 
    Users, 
    Loader2, 
    Slash, 
    RefreshCcw, 
    ArrowLeft, 
    Ban,
    Lock,
    Eye,
    History,
    Unlock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import { m, AnimatePresence } from 'framer-motion';
import { useTranslation } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { moneaClient } from "@/lib/api-client";

export default function SecurityDashboardPage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(false);
    const { showToast } = useToast();
    const [unblockingIp, setUnblockingIp] = useState<string | null>(null);
    const [unlockingId, setUnlockingId] = useState<string | null>(null);
    const [newIp, setNewIp] = useState("");
    const [reason, setReason] = useState("");

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await moneaClient.get("/api/admin/master/security/stats", { cache: "no-store" });
            if (res.data) {
                setStats(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRevokeAllSessions = async () => {
        if (!confirm(t("admin.settings.security.revokeConfirm"))) return;

        setRevoking(true);
        try {
            const res = await moneaClient.post("/api/admin/master/security/revoke", {});
            if (!res.error) {
                showToast({
                    title: "Security Action Triggered",
                    description: t("admin.settings.security.revokeSuccess"),
                    type: "success"
                });
                fetchStats();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRevoking(false);
        }
    };

    const handleAddIp = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await moneaClient.post("/api/admin/master/security/blacklist", { ip: newIp, reason });
        if (!res.error) {
            setNewIp("");
            setReason("");
            fetchStats();
            showToast({ title: "IP Blacklisted", type: "success" });
        }
    };

    const handleUnblockIp = async (ip: string, id: string) => {
        setUnblockingIp(ip);
        try {
            const res = await moneaClient.delete(`/api/admin/master/security/blacklist?id=${id}`);
            if (!res.error) {
                fetchStats();
                showToast({ title: "IP Unblocked", type: "success" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUnblockingIp(null);
        }
    };

    const handleUnlockAccount = async (accountId: string, type: string) => {
        setUnlockingId(accountId);
        try {
            const res = await moneaClient.post("/api/admin/master/security/unlock", { accountId, type });
            if (!res.error) {
                fetchStats();
                showToast({ title: "Account Unlocked", type: "success" });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUnlockingId(null);
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading && !stats) return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-slate-950 p-6 md:p-12">
            <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-12"
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
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                                    <ShieldAlert size={14} />
                                    Security Monitoring
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {t("admin.settings.security.title")}
                                </h1>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {t("admin.settings.security.subtitle")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={fetchStats}
                            disabled={loading}
                            className="h-12 px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-2"
                        >
                            <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
                            {t("admin.settings.security.sync")}
                        </Button>
                        <Button
                            onClick={handleRevokeAllSessions}
                            disabled={revoking}
                            className="h-12 px-8 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-200 dark:shadow-red-950/40 hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle size={16} />}
                            {t("admin.settings.security.revokeBtn")}
                        </Button>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Stat Card 1: Locked Accounts */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
                            <CardContent className="p-8 lg:p-10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                                        {t("admin.settings.security.stats.locked")}
                                    </p>
                                    <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums">
                                        {stats?.lockedAccountsCount || 0}
                                    </h3>
                                </div>
                                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-3xl text-orange-600">
                                    <Lock size={32} />
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>

                    {/* Stat Card 2: Blacklisted IPs */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600" />
                            <CardContent className="p-8 lg:p-10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                                        {t("admin.settings.security.stats.blacklisted")}
                                    </p>
                                    <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums">
                                        {stats?.blacklistedIPsCount || 0}
                                    </h3>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-3xl text-red-600">
                                    <Slash size={32} />
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>

                    {/* Stat Card 3: Failed Logins */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
                            <CardContent className="p-8 lg:p-10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                                        {t("admin.settings.security.stats.failedLogins")}
                                    </p>
                                    <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums">
                                        {stats?.failedLoginsCount || 0}
                                    </h3>
                                </div>
                                <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-3xl text-slate-600 dark:text-slate-400">
                                    <AlertTriangle size={32} />
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>
                </div>

                {/* Restriction Form Card */}
                <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {t("admin.settings.security.blacklist.title")}
                                </CardTitle>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manual Restriction Interface</p>
                            </div>
                            <div className="p-3 bg-slate-900 dark:bg-white/10 rounded-2xl text-white dark:text-white/40">
                                <Ban size={20} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleAddIp} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <div className="md:col-span-1 space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        {t("admin.settings.security.blacklist.placeholder")}
                                    </p>
                                    <Input
                                        placeholder="0.0.0.0"
                                        value={newIp}
                                        onChange={e => setNewIp(e.target.value)}
                                        className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-black text-lg focus:ring-4 focus:ring-red-500/10 placeholder:text-slate-300 transition-all"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        {t("admin.settings.security.blacklist.reason")}
                                    </p>
                                    <Input
                                        placeholder="e.g. Brute Force Attempt"
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-slate-600 dark:text-white focus:ring-4 focus:ring-red-500/10 placeholder:text-slate-300 transition-all font-kantumruy"
                                    />
                                </div>
                                <Button className="h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 md:col-span-1">
                                    {t("admin.settings.security.blacklist.addBtn")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </m.div>

                {/* Lists Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                    {/* Failed Logins List */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <CardHeader className="bg-slate-50 dark:bg-white/5 p-8 border-b dark:border-white/5">
                                <CardTitle className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users size={16} className="text-orange-500" />
                                        {t("admin.settings.security.tables.failedAccounts")}
                                    </div>
                                    <Eye size={16} className="text-slate-300" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {stats?.failedAccounts?.length > 0 ? (
                                    <div className="divide-y dark:divide-white/5 max-h-[500px] overflow-y-auto">
                                        {stats.failedAccounts.map((acc: any, i: number) => (
                                            <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <div className="space-y-1">
                                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{acc.email || acc.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                        {acc.type} • Failed: <span className="text-red-600">{acc.failedAttempts} times</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {acc.lockedUntil && new Date(acc.lockedUntil) > new Date() && (
                                                        <span className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
                                                            {t("admin.settings.security.tables.lockedBadge")}
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUnlockAccount(acc.id, acc.type)}
                                                        disabled={unlockingId === acc.id}
                                                        className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20 text-emerald-600 bg-emerald-500/5 dark:bg-emerald-500/10"
                                                    >
                                                        {unlockingId === acc.id ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Unlock className="w-3 h-3 mr-2" />}
                                                        Reset
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{t("admin.settings.security.tables.noFailed")}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </m.div>

                    {/* Blacklisted IPs List */}
                    <m.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <CardHeader className="bg-slate-50 dark:bg-white/5 p-8 border-b dark:border-white/5">
                                <CardTitle className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Slash size={16} className="text-red-500" />
                                        {t("admin.settings.security.tables.blacklistedIps")}
                                    </div>
                                    <History size={16} className="text-slate-300" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {stats?.blacklistedIPs?.length > 0 ? (
                                    <div className="divide-y dark:divide-white/5 max-h-[500px] overflow-y-auto">
                                        {stats.blacklistedIPs.map((ipRec: any, i: number) => (
                                            <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <div className="space-y-1">
                                                    <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{ipRec.ip}</p>
                                                    <p className="text-xs text-slate-400 font-medium">Blocked: {format(new Date(ipRec.createdAt), 'PP p')}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUnblockIp(ipRec.ip, ipRec.id)}
                                                    disabled={unblockingIp === ipRec.ip}
                                                    className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                                >
                                                    {unblockingIp === ipRec.ip ? t("admin.settings.security.blacklist.unblocking") : t("admin.settings.security.blacklist.unblock")}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                                            <Slash size={32} />
                                        </div>
                                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{t("admin.settings.security.tables.noBlacklisted")}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </m.div>
                </div>

                {/* Footer Link to Master Audit */}
                <m.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center pt-8"
                >
                    <Link href="/admin/master/settings">
                        <Button variant="link" className="text-slate-400 hover:text-red-600 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                            <History size={14} />
                            {t("admin.settings.security.return")}
                        </Button>
                    </Link>
                </m.div>

            </m.div>
        </div>
    );
}

// Helper icons
function CheckCircle2({ size = 24, className = "" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("lucide lucide-check-circle-2", className)}
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
