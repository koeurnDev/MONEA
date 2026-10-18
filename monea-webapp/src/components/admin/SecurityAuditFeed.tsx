import React, { useState, useEffect, useCallback } from 'react';
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

    const fetchLogs = useCallback(async () => {
        try {
            const res = await moneaClient.get(`/api/admin/logs?type=${type}&limit=10`);
            setLogs(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch audit logs", e);
        }
    }, [type]);

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
        const interval = setInterval(fetchLogs, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, [fetchLogs]);

    const getIcon = (log: AuditLog) => {
        if (log.event?.includes('FAILED') || log.event?.includes('UNAUTHORIZED')) return <AlertTriangle className="text-red-500" size={16} />;
        if (log.event?.includes('LOGIN')) return <User className="text-primary" size={16} />;
        if (log.event?.includes('TWOFA')) return <Lock className="text-emerald-500" size={16} />;
        if (log.action === 'CONFIG_UPDATE') return <Settings className="text-amber-500" size={16} />;
        if (log.action === 'ROLLBACK') return <Zap className="text-primary" size={16} />;
        return <Shield className="text-muted-foreground" size={16} />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border border-primary/20">
                        <Shield className="text-primary" size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t("admin.settings.logsHistory")}</h3>
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">Real-time Platform Audit</p>
                    </div>
                </div>
                <div className="flex bg-muted p-1 rounded-lg">
                    <button 
                        onClick={() => setType('SECURITY')}
                        className={cn(
                            "px-3 py-1 text-xs font-bold rounded-md transition-all",
                            type === 'SECURITY' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Security
                    </button>
                    <button 
                        onClick={() => setType('GOVERNANCE')}
                        className={cn(
                            "px-3 py-1 text-xs font-bold rounded-md transition-all",
                            type === 'GOVERNANCE' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Gov
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-border">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-xl" />
                        ))
                    ) : Array.isArray(logs) && logs.length > 0 ? (
                        logs.map((log) => (
                            <m.div
                                layout
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="group p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-border/60 bg-card/70 hover:bg-card transition-all cursor-default"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        {getIcon(log)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold text-foreground truncate">
                                                {log.event || log.action}
                                            </p>
                                            <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                            {log.email || log.actorName} • {log.ip || 'INTERNAL'}
                                        </p>
                                        {log.details && (
                                            <div className="mt-2 space-y-2">
                                                <div className="p-1.5 bg-muted/60 rounded-md text-xs font-mono text-muted-foreground line-clamp-1 uppercase">
                                                    {JSON.stringify(log.details)}
                                                </div>
                                                {log.action === "PUBLISH" && log.details.versionId && (
                                                    <button
                                                        onClick={() => handleRollback(log.details.versionId)}
                                                        disabled={rollingBackId === log.details.versionId}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg text-xs font-black uppercase tracking-widest transition-colors w-fit border border-red-500/20"
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
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <Shield className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-xs uppercase tracking-widest font-black">No Logs Found</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
