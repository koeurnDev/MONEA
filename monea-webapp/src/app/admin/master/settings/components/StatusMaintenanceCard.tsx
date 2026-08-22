"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

interface StatusMaintenanceCardProps {
    config: any;
    setConfig: (val: any) => void;
    handleAutoSave: (fields: Partial<any>) => void;
}

export function StatusMaintenanceCard({ config, setConfig, handleAutoSave }: StatusMaintenanceCardProps) {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';

    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[100px] rounded-full -mr-24 -mt-24 group-hover:bg-white/10 transition-colors" />
            <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-3 h-3 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]",
                                config?.maintenanceMode ? "bg-red-500 animate-pulse" : "bg-emerald-500 shadow-emerald-500/50"
                            )} />
                            <h3 className="font-black text-xl tracking-tight">{t("admin.settings.statusTitle")}</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {config?.maintenanceMode ? t("admin.settings.statusHalt") : t("admin.settings.statusOnline")}
                        </p>
                    </div>
                    <Switch
                        className="data-[state=checked]:bg-red-500"
                        checked={config?.maintenanceMode}
                        onCheckedChange={(val) => handleAutoSave({ maintenanceMode: val })}
                    />
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-kantumruy mt-6">
                    {config?.maintenanceMode ? t("admin.settings.maintenanceDesc") : t("admin.settings.onlineDesc")}
                </p>

                <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                            <Calendar size={10} /> {isKm ? "ម៉ោងចាប់ផ្តើមបិទ (ប្រព័ន្ធនឹងបិទស្វ័យប្រវត្តិ)" : "Maintenance Start (Auto-Halt)"}
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold outline-none focus:border-red-500 transition-colors"
                            value={config?.maintenanceStart ? new Date(new Date(config.maintenanceStart).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setConfig({ ...config, maintenanceStart: e.target.value })}
                            onBlur={(e) => handleAutoSave({ maintenanceStart: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                            <LayoutGrid size={10} /> {isKm ? "ម៉ោងបើកវិញ (ប្រព័ន្ធនឹងបើកស្វ័យប្រវត្តិ)" : "Opening Hour (Auto-Resume)"}
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold outline-none focus:border-red-500 transition-colors"
                            value={config?.maintenanceEnd ? new Date(new Date(config.maintenanceEnd).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setConfig({ ...config, maintenanceEnd: e.target.value })}
                            onBlur={(e) => handleAutoSave({ maintenanceEnd: e.target.value })}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
