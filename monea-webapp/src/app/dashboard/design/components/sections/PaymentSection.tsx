import * as React from 'react';
import { m } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { CreditCard, Trash2, Plus } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload-widget";
import type { WeddingData } from '@/components/templates/types';
import { Button } from "@/components/ui/button";

interface PaymentSectionProps {
    wedding: WeddingData;
    updateTheme: (key: string, value: any) => void;
    t: (key: string, opts?: any) => string;
}

export function PaymentSection({ wedding, updateTheme, t }: PaymentSectionProps) {
    const bankAccounts = wedding.themeSettings?.bankAccounts || [];

    const handleAddAccount = () => {
        const newAccs = [
            ...bankAccounts,
            { bankName: "KHQR", accountName: "", accountNumber: "", qrUrl: "", side: "both" }
        ];
        updateTheme('bankAccounts', newAccs);
    };

    const handleRemoveAccount = (idx: number) => {
        const newAccs = bankAccounts.filter((_: any, i: number) => i !== idx);
        updateTheme('bankAccounts', newAccs);
    };

    return (
        <div className="space-y-6 pt-2 font-kantumruy">
            <div className="space-y-4">
                {bankAccounts.map((acc: any, idx: number) => (
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="bg-white dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm relative group space-y-4"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                    <CreditCard size={15} />
                                </div>
                                <span>គណនីធនាគារទី {idx + 1}</span>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAccount(idx)}
                                className="h-8 px-2.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all text-xs font-bold flex items-center gap-1"
                            >
                                <Trash2 size={13} />
                                <span>លុប</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* QR Code Upload */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground block">
                                    រូបភាព QR Code (KHQR / Bakong)
                                </Label>
                                <ImageUpload
                                    value={acc.qrUrl || ""}
                                    onChange={(url) => {
                                        const newAccs = [...bankAccounts];
                                        newAccs[idx] = { ...newAccs[idx], qrUrl: url };
                                        updateTheme('bankAccounts', newAccs);
                                    }}
                                    onRemove={() => {
                                        const newAccs = [...bankAccounts];
                                        newAccs[idx] = { ...newAccs[idx], qrUrl: "" };
                                        updateTheme('bankAccounts', newAccs);
                                    }}
                                    label="បង្ហោះរូប QR ទទួលប្រាក់"
                                    folder={wedding.id}
                                />
                            </div>

                            {/* Account Details */}
                            <div className="space-y-3.5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">ម្ចាស់គណនី</Label>
                                    <select
                                        className="w-full h-11 border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 bg-slate-50/50 dark:bg-black/20 text-xs text-foreground font-bold shadow-sm outline-none cursor-pointer"
                                        value={acc.side || 'both'}
                                        onChange={(e) => {
                                            const newAccs = [...bankAccounts];
                                            newAccs[idx] = { ...newAccs[idx], side: e.target.value };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    >
                                        <option value="both">ទាំងសងខាង (Both Sides)</option>
                                        <option value="groom">ខាងកូនកំលោះ / ស្វាមី</option>
                                        <option value="bride">ខាងកូនក្រមុំ / ភរិយា</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">ធនាគារ</Label>
                                    <select
                                        className="w-full h-11 border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 bg-slate-50/50 dark:bg-black/20 text-xs text-foreground font-bold shadow-sm outline-none cursor-pointer"
                                        value={acc.bankName || "KHQR"}
                                        onChange={(e) => {
                                            const newAccs = [...bankAccounts];
                                            newAccs[idx] = { ...newAccs[idx], bankName: e.target.value };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    >
                                        <option value="KHQR">KHQR (Bakong / គ្រប់ធនាគារ)</option>
                                        <option value="ABA Bank">ABA Bank</option>
                                        <option value="ACLEDA Bank">ACLEDA Bank</option>
                                        <option value="Wing Bank">Wing Bank</option>
                                        <option value="Canadia Bank">Canadia Bank</option>
                                        <option value="Other">ធនាគារផ្សេងទៀត</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">ឈ្មោះម្ចាស់គណនី</Label>
                                    <DebouncedInput
                                        placeholder="ឧ. SOK SAN"
                                        className="h-11 text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 shadow-sm font-bold px-3.5 text-foreground placeholder:text-muted-foreground/60"
                                        value={acc.accountName || ""}
                                        onDebouncedChange={(val) => {
                                            const newAccs = [...bankAccounts];
                                            newAccs[idx] = { ...newAccs[idx], accountName: val as string };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">លេខគណនី</Label>
                                    <DebouncedInput
                                        placeholder="ឧ. 000 123 456"
                                        className="h-11 text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 shadow-sm font-bold px-3.5 text-foreground font-mono placeholder:text-muted-foreground/60"
                                        value={acc.accountNumber || ""}
                                        onDebouncedChange={(val) => {
                                            const newAccs = [...bankAccounts];
                                            newAccs[idx] = { ...newAccs[idx], accountNumber: val as string };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </m.div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAccount}
                    className="w-full h-11 border-dashed border-slate-300 dark:border-white/20 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all flex items-center justify-center gap-1.5"
                >
                    <Plus size={14} />
                    <span>បន្ថែមគណនីធនាគារថ្មី (Add Bank Account)</span>
                </Button>
            </div>
        </div>
    );
}
