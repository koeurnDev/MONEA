"use client";
import * as React from 'react';
import { m } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, Loader2, Save, RotateCcw } from "lucide-react";

interface HistorySectionProps {
    handleSaveVersion: () => Promise<void>;
    handleRollback: (versionId: string) => Promise<void>;
    handleDeleteVersion: (versionId: string) => Promise<void>;
    templateVersions: any[];
    fetchingVersions: boolean;
    isSavingVersion: boolean;
    newVersionTitle: string;
    setNewVersionTitle: (val: string) => void;
    mounted: boolean;
    t: (key: string, opts?: any) => string;
}

export function HistorySection({
    handleSaveVersion,
    handleRollback,
    handleDeleteVersion,
    templateVersions,
    fetchingVersions,
    isSavingVersion,
    newVersionTitle,
    setNewVersionTitle,
    mounted,
    t,
}: HistorySectionProps) {
    return (
        <div className="space-y-8 pt-4">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50/50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4 shadow-sm"
            >
                <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-1 italic">— {t("wizard.steps.5.saveVersion")}</Label>
                <div className="flex gap-3">
                    <Input
                        placeholder={t("wizard.steps.5.versionPlaceholder")}
                        value={newVersionTitle}
                        onChange={(e) => setNewVersionTitle(e.target.value)}
                        className="h-14 rounded-2xl border-none bg-white dark:bg-white/10 shadow-sm font-bold px-6 text-sm focus:ring-2 ring-rose-500/10 flex-1"
                    />
                    <button
                        onClick={handleSaveVersion}
                        disabled={isSavingVersion || !newVersionTitle}
                        className="w-14 h-14 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 dark:disabled:bg-white/10 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 transition-all active:scale-95 shrink-0"
                    >
                        {isSavingVersion ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    </button>
                </div>
            </m.div>

            <div className="space-y-4">
                <Label className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1 flex items-center gap-3">
                    <Clock size={14} /> {t("wizard.steps.5.savedList")}
                </Label>

                {fetchingVersions ? (
                    <div className="flex flex-col items-center py-12 gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={16} className="text-rose-500/20" />
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("wizard.steps.5.loading")}</span>
                    </div>
                ) : templateVersions.length === 0 ? (
                    <div className="bg-slate-50/50 dark:bg-white/5 py-12 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-3">
                        <RotateCcw size={32} className="text-slate-200 dark:text-white/5" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("wizard.steps.5.noVersions")}</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {templateVersions.map((ver, idx) => (
                            <m.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={ver.id}
                                className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50/50 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[13px] font-black text-slate-900 dark:text-white font-kantumruy tracking-tight truncate pr-4">{ver.versionName}</h4>
                                        <div className="flex items-center gap-3 mt-1.5 opacity-40">
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                {mounted ? new Date(ver.createdAt).toLocaleString(t("common.constants.locale") || 'km-KH', { timeZone: 'Asia/Phnom_Penh' }) : '...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <button
                                        onClick={() => handleRollback(ver.id)}
                                        className="px-4 py-2.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
                                    >
                                        {t("wizard.steps.5.restore")}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteVersion(ver.id)}
                                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                </div>
                            </m.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
