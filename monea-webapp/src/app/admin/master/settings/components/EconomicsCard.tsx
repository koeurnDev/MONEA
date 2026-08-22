"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface EconomicsCardProps {
    config: any;
    setConfig: (val: any) => void;
    handleAutoSave: (fields: Partial<any>) => void;
}

export function EconomicsCard({ config, setConfig, handleAutoSave }: EconomicsCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-indigo-600 to-red-600 opacity-20 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-8 lg:p-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-red-600/10 rounded-2xl text-red-600">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tight">{t("admin.settings.pricingTitle")}</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t("admin.settings.pricingSubtitle")}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Standard (PRO) Plan Price */}
                    <div className="group relative p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-slate-200 transition-all duration-500 overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">{t("admin.settings.standardTier")}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("admin.settings.standardBadge")}</p>
                                </div>
                                <Zap className="w-10 h-10 text-slate-200 dark:text-white/10 group-hover:text-red-500/20 transition-colors" />
                            </div>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl">$</div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="h-20 w-full pl-12 pr-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 text-3xl font-black text-slate-900 dark:text-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none tabular-nums bg-white dark:bg-slate-950 shadow-inner transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
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
                    </div>

                    {/* Pro Master (PREMIUM) Plan Price */}
                    <div className="group relative p-8 rounded-[2.5rem] bg-slate-950 border border-slate-800 hover:border-red-500 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-red-600/20 transition-colors" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-black text-white text-lg uppercase tracking-tight">{t("admin.settings.proTier")}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("admin.settings.proBadge")}</p>
                                    </div>
                                </div>
                                <Zap className="w-10 h-10 text-red-500/20 group-hover:text-red-500 transition-colors" />
                            </div>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-black text-2xl">$</div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="h-20 w-full pl-12 pr-6 rounded-3xl border-2 border-slate-800 text-3xl font-black text-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 outline-none tabular-nums bg-slate-900 shadow-inner transition-all hover:bg-slate-800"
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
                </div>
                <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">{t("admin.settings.activeSince")}</p>
            </CardContent>
        </Card>
    );
}
