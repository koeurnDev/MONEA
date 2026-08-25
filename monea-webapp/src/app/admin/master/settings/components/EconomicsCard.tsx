import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Crown, DollarSign } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface EconomicsCardProps {
    config: any;
    setConfig: (val: any) => void;
    handleAutoSave: (fields: Partial<any>) => void;
}

export function EconomicsCard({ config, setConfig, handleAutoSave }: EconomicsCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/40 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden font-kantumruy">
            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-lg">
                            {t("admin.settings.pricingTitle", { defaultValue: "សេដ្ឋកិច្ចប្រព័ន្ធ (Pricing)" })}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold">
                            {t("admin.settings.pricingSubtitle", { defaultValue: "កំណត់តម្លៃកញ្ចប់សេវាកម្មសម្រាប់អតិថិជន" })}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Standard Plan */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-500" />
                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                    {t("admin.settings.standardTier", { defaultValue: "កញ្ចប់ STANDARD" })}
                                </span>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                PRO TIER
                            </span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className="h-12 w-full pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xl font-black text-slate-900 dark:text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none tabular-nums bg-white dark:bg-slate-900 transition-all font-mono"
                                value={config?.stadPrice || 0}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, ''); 
                                    setConfig({ ...config, stadPrice: val });
                                }}
                                onBlur={(e) => handleAutoSave({ stadPrice: parseFloat(e.target.value || "0") })}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                        </div>
                    </div>

                    {/* Pro Master (PREMIUM) Plan */}
                    <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-sm text-white">
                                    {t("admin.settings.proTier", { defaultValue: "កញ្ចប់ PRO MASTER" })}
                                </span>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                PREMIUM
                            </span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className="h-12 w-full pl-9 pr-4 rounded-xl border border-slate-700 text-xl font-black text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none tabular-nums bg-slate-900 transition-all font-mono"
                                value={config?.proPrice || 0}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, ''); 
                                    setConfig({ ...config, proPrice: val });
                                }}
                                onBlur={(e) => handleAutoSave({ proPrice: parseFloat(e.target.value || "0") })}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
