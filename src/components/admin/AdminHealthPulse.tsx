"use client";
import * as React from "react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { moneaClient } from '@/lib/api-client';

export default function AdminHealthPulse() {
    const { t } = useTranslation();
    const [pulseData, setPulseData] = React.useState({ uptime: '99.9%', status: 'HEALTHY' });

    React.useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await moneaClient.get('/api/admin/health');
                if (res.data) {
                    const data = res.data as { uptime: string; status: string };
                    setPulseData({ uptime: data.uptime || '99.9%', status: data.status || 'HEALTHY' });
                } else {
                    setPulseData(prev => ({ ...prev, status: 'UNHEALTHY' }));
                }
            } catch (e: any) {
                console.error("Health fetch failed", e);
                if (e.response?.status === 401 || e.status === 401) {
                    window.location.href = "/sign-in";
                }
                setPulseData(prev => ({ ...prev, status: 'UNHEALTHY' }));
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mx-8 my-6 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 relative overflow-hidden group/pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover/pulse:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="relative w-2 h-2">
                            <div className={cn(
                                "absolute inset-0 rounded-full animate-ping opacity-40",
                                pulseData.status === 'HEALTHY' ? "bg-emerald-500" : "bg-red-500"
                            )} />
                            <div className={cn(
                                "relative w-2 h-2 rounded-full",
                                pulseData.status === 'HEALTHY' ? "bg-emerald-500" : "bg-red-500"
                            )} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic font-mono">{t("admin.sidebar.pulse")}</span>
                    </div>
                    <span className={cn(
                        "text-[9px] font-black font-mono tracking-tighter",
                        pulseData.status === 'HEALTHY' ? "text-emerald-500" : "text-red-500"
                    )}>
                        {pulseData.uptime} {pulseData.status === 'HEALTHY' ? 'Up' : 'Degraded'}
                    </span>
                </div>
                <div className="h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <m.div
                        initial={{ width: "0%" }}
                        animate={{ width: pulseData.status === 'HEALTHY' ? "100%" : "60%" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className={cn(
                            "h-full transition-all duration-1000",
                            pulseData.status === 'HEALTHY' ? "bg-emerald-500/80" : "bg-red-500/80"
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
