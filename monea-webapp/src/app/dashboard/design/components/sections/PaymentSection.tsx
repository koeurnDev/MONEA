"use client";
import * as React from 'react';
import { m } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { CreditCard, X, Plus } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload-widget";
import type { WeddingData } from '@/components/templates/types';

interface PaymentSectionProps {
    wedding: WeddingData;
    updateTheme: (key: string, value: any) => void;
    t: (key: string, opts?: any) => string;
}

export function PaymentSection({ wedding, updateTheme, t }: PaymentSectionProps) {
    return (
        <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 gap-6">
                {wedding.themeSettings?.bankAccounts?.map((acc: any, idx: number) => (
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="bg-slate-50/50 dark:bg-white/[0.02] p-5 md:p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 relative group"
                    >
                        <button
                            onClick={() => {
                                const newAccs = wedding.themeSettings?.bankAccounts?.filter((_: any, i: number) => i !== idx);
                                updateTheme('bankAccounts', newAccs);
                            }}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:shadow-lg transition-all z-10"
                        >
                            <X size={14} />
                        </button>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/3 space-y-4">
                                <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-1 italic">— {t("wizard.steps.5.qrLabel")}</Label>
                                <ImageUpload
                                    value={acc.qrUrl || ""}
                                    onChange={(url) => {
                                        const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                        newAccs[idx] = { ...newAccs[idx], qrUrl: url };
                                        updateTheme('bankAccounts', newAccs);
                                    }}
                                    onRemove={() => {
                                        const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                        newAccs[idx] = { ...newAccs[idx], qrUrl: "" };
                                        updateTheme('bankAccounts', newAccs);
                                    }}
                                    folder={wedding.id}
                                />
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.accOwner")}</Label>
                                        <select
                                            className="w-full h-12 border-none rounded-2xl px-4 bg-white dark:bg-white/5 text-xs text-slate-900 dark:text-white font-black shadow-sm outline-none appearance-none cursor-pointer"
                                            value={acc.side || 'groom'}
                                            onChange={(e) => {
                                                const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                newAccs[idx] = { ...newAccs[idx], side: e.target.value };
                                                updateTheme('bankAccounts', newAccs);
                                            }}
                                        >
                                            <option value="groom">{t("wizard.steps.2.groomSide")}</option>
                                            <option value="bride">{t("wizard.steps.2.brideSide")}</option>
                                            <option value="both">{t("wizard.steps.5.bothSides")}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.bank")}</Label>
                                        <select
                                            className="w-full h-12 border-none rounded-2xl px-4 bg-white dark:bg-white/5 text-xs text-slate-900 dark:text-white font-black shadow-sm outline-none appearance-none cursor-pointer"
                                            value={acc.bankName}
                                            onChange={(e) => {
                                                const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                newAccs[idx] = { ...newAccs[idx], bankName: e.target.value };
                                                updateTheme('bankAccounts', newAccs);
                                            }}
                                        >
                                            <option value="KHQR">KHQR (Bakong)</option>
                                            <option value="ACLEDA Bank">ACLEDA Bank</option>
                                            <option value="ABA Bank">ABA Bank</option>
                                            <option value="Wing Bank">Wing Bank</option>
                                            <option value="Other">{t("wizard.steps.5.otherBank")}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.accName")}</Label>
                                        <DebouncedInput
                                            placeholder={t("wizard.steps.5.accName")}
                                            className="h-12 text-xs rounded-2xl border-none bg-white dark:bg-white/5 shadow-sm font-bold px-5"
                                            value={acc.accountName}
                                            onDebouncedChange={(val) => {
                                                const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                newAccs[idx] = { ...newAccs[idx], accountName: val as string };
                                                updateTheme('bankAccounts', newAccs);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.accNumber")}</Label>
                                        <DebouncedInput
                                            placeholder={t("wizard.steps.5.accNumber")}
                                            className="h-12 text-xs rounded-2xl border-none bg-white dark:bg-white/5 shadow-sm font-bold px-5"
                                            value={acc.accountNumber}
                                            onDebouncedChange={(val) => {
                                                const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                newAccs[idx] = { ...newAccs[idx], accountNumber: val as string };
                                                updateTheme('bankAccounts', newAccs);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </m.div>
                ))}
            </div>

            <button
                onClick={() => {
                    const newAccs = [...(wedding.themeSettings?.bankAccounts || []), { side: "bride", bankName: "KHQR", accountName: "", accountNumber: "", qrUrl: "" }];
                    updateTheme('bankAccounts', newAccs);
                }}
                className="w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5 hover:border-rose-300 dark:hover:border-rose-500/30 hover:bg-rose-50/30 dark:hover:bg-rose-500/5 transition-all flex flex-col items-center gap-3 text-slate-400 hover:text-rose-500 group"
            >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-rose-500/10 transition-colors">
                    <Plus size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest">{t("wizard.steps.5.addBank")}</span>
            </button>
        </div>
    );
}
