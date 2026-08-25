import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, LayoutGrid, AlertOctagon } from "lucide-react";
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
        <Card className="border border-slate-800 shadow-xl rounded-3xl bg-slate-950 text-white relative overflow-hidden font-kantumruy">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full" />
            <CardContent className="p-6 sm:p-8 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-3 h-3 rounded-full shrink-0",
                            config?.maintenanceMode ? "bg-red-500 animate-pulse" : "bg-emerald-500 shadow-emerald-500/50"
                        )} />
                        <div>
                            <h3 className="font-black text-lg text-white">
                                {t("admin.settings.statusTitle", { defaultValue: "ស្ថានភាពប្រព័ន្ធ (Status)" })}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                {config?.maintenanceMode 
                                    ? t("admin.settings.statusHalt", { defaultValue: "ប្រព័ន្ធកំពុងបិទថែទាំ" }) 
                                    : t("admin.settings.statusOnline", { defaultValue: "ប្រព័ន្ធដំណើរការជាធម្មតា (Online)" })}
                            </p>
                        </div>
                    </div>
                    <Switch
                        className="data-[state=checked]:bg-red-500"
                        checked={config?.maintenanceMode}
                        onCheckedChange={(val) => handleAutoSave({ maintenanceMode: val })}
                    />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {config?.maintenanceMode 
                        ? t("admin.settings.maintenanceDesc", { defaultValue: "រាល់សេវាកម្មទាំងអស់ត្រូវបានផ្អាកបណ្តោះអាសន្នសម្រាប់អតិថិជន។" }) 
                        : t("admin.settings.onlineDesc", { defaultValue: "រាល់សេវាកម្មទាំងអស់ និងការគ្រប់គ្រងរបស់អតិថិជនកំពុងដំណើរការជាធម្មតា។" })}
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <Calendar size={13} className="text-red-400" />
                            <span>{isKm ? "ម៉ោងចាប់ផ្តើមបិទ (Auto-Halt)" : "Maintenance Start (Auto-Halt)"}</span>
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-white outline-none focus:border-red-500"
                            value={config?.maintenanceStart ? new Date(new Date(config.maintenanceStart).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setConfig({ ...config, maintenanceStart: e.target.value })}
                            onBlur={(e) => handleAutoSave({ maintenanceStart: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <LayoutGrid size={13} className="text-emerald-400" />
                            <span>{isKm ? "ម៉ោងបើកវិញ (Auto-Resume)" : "Opening Hour (Auto-Resume)"}</span>
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-white outline-none focus:border-red-500"
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
