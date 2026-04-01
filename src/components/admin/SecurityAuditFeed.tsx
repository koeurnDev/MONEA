"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, Settings, AlertTriangle, Zap, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { moneaClient } from '@/lib/api-client';
import { useToast } from "@/components/ui/Toast";
import { formatDistanceToNow } from 'date-fns';
import { m, AnimatePresence } from 'framer-motion';

interface AuditLog {
    id: string;
    event?: string;
    action?: string;
    actorName?: string;
    email?: string;
    ip?: string;
    createdAt: string;
    details?: any;
}

export function SecurityAuditFeed() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState<'SECURITY' | 'GOVERNANCE'>('SECURITY');
    const [rollingBackId, setRollingBackId] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchLogs = async () => {
        try {
            const res = await moneaClient.get(`/api/admin/logs?type=${type}&limit=10`);
            setLogs(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch audit logs", e);
        }
    };

    const handleRollback = async (versionId: string) => {
        setRollingBackId(versionId);
        try {
            await moneaClient.patch("/api/admin/governance", { versionId });
            showToast({ title: "Rollback Successful", type: "success" });
            fetchLogs(); // Refresh feed immediately
        } catch (e) {
            console.error(e);
            showToast({ title: "Rollback Failed", type: "error" });
        } finally {
            setRollingBackId(null);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [type]);

    const getIcon = (log: AuditLog) => {
        if (log.event?.includes('FAILED') || log.event?.includes('UNAUTHORIZED')) return <AlertTriangle className="text-red-500" size={16} />;
        if (log.event?.includes('LOGIN')) return <User className="text-blue-500" size={16} />;
        if (log.event?.includes('TWOFA')) return <Lock className="text-emerald-500" size={16} />;
        if (log.action === 'CONFIG_UPDATE') return <Settings className="text-amber-500" size={16} />;
        if (log.action === 'ROLLBACK') return <Zap className="text-purple-500" size={16} />;
        return <Shield className="text-slate-400" size={16} />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20">
                        <Shield className="text-red-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t("admin.settings.logsHistory")}</h3>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Real-time Platform Audit</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <button 
                        onClick={() => setType('SECURITY')}
                        className={cn(
                            "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                            type === 'SECURITY' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Security
                    </button>
                    <button 
                        onClick={() => setType('GOVERNANCE')}
                        className={cn(
                            "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                            type === 'GOVERNANCE' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Gov
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-16 w-full bg-slate-50 dark:bg-white/5 animate-pulse rounded-xl" />
                        ))
                    ) : Array.isArray(logs) && logs.length > 0 ? (
                        logs.map((log) => (
                            <m.div
                                layout
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="group p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-default"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                                        {getIcon(log)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate">
                                                {log.event || log.action}
                                            </p>
                                            <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                            {log.email || log.actorName} • {log.ip || 'INTERNAL'}
                                        </p>
                                        {log.details && (
                                            <div className="mt-2 space-y-2">
                                                <div className="p-1.5 bg-slate-50 dark:bg-black/20 rounded-md text-[9px] font-mono text-slate-400 line-clamp-1 uppercase">
                                                    {JSON.stringify(log.details)}
                                                </div>
                                                {log.action === "PUBLISH" && log.details.versionId && (
                                                    <button
                                                        onClick={() => handleRollback(log.details.versionId)}
                                                        disabled={rollingBackId === log.details.versionId}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors w-fit border border-red-500/20"
                                                    >
                                                        {rollingBackId === log.details.versionId ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <RotateCcw className="w-3 h-3" />
                                                        )}
                                                        Rollback to this version
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </m.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <Shield className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-xs uppercase tracking-widest font-black">No Logs Found</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
