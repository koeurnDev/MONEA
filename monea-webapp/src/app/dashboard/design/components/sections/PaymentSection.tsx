import * as React from 'react';
import { m } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { CreditCard, Trash2, Info } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload-widget";
import type { WeddingData } from '@/components/templates/types';
import { Button } from "@/components/ui/button";

interface PaymentSectionProps {
    wedding: WeddingData;
    updateTheme: (key: string, value: any) => void;
    t: (key: string, opts?: any) => string;
}

export function PaymentSection({ wedding, updateTheme, t }: PaymentSectionProps) {
    const bankAccounts = wedding.themeSettings?.bankAccounts?.length
        ? wedding.themeSettings.bankAccounts
        : [{ bankName: "KHQR", accountName: "", accountNumber: "", qrUrl: "", side: "both" }];
    const bankAccountsRef = React.useRef(bankAccounts);

    React.useEffect(() => {
        bankAccountsRef.current = bankAccounts;
    }, [bankAccounts]);

    const updateBankAccounts = (nextAccounts: typeof bankAccounts) => {
        bankAccountsRef.current = nextAccounts;
        updateTheme('bankAccounts', nextAccounts);
    };

    const handleRemoveAccount = (idx: number) => {
        const newAccs = bankAccountsRef.current.filter((_: any, i: number) => i !== idx);
        updateBankAccounts(newAccs);
    };

    return (
        <div className="space-y-4 pt-2 font-kantumruy">
            <div className="flex items-start gap-2 rounded-xl border border-teal-100 bg-teal-50/70 p-3 text-[11px] leading-relaxed text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-300">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>ដាក់រូប KHQR និងឈ្មោះអ្នកទទួលប្រាក់ជាចម្បង។ លេខគណនី និងធនាគារ គឺជាព័ត៌មានបន្ថែម មិនចាំបាច់បំពេញទេ។</p>
            </div>
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
                                <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                                    <CreditCard size={15} />
                                </div>
                                <span>KHQR / គណនីទី {idx + 1}</span>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAccount(idx)}
                                className="h-8 px-2.5 text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-xl transition-all text-xs font-bold flex items-center gap-1"
                            >
                                <Trash2 size={13} />
                                <span>លុប</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* QR Code Upload */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground block">
                                    KHQR
                                </Label>
                                <ImageUpload
                                    value={acc.qrUrl || ""}
                                    onChange={(url) => {
                                        const newAccs = [...bankAccountsRef.current];
                                        newAccs[idx] = { ...newAccs[idx], qrUrl: url };
                                        updateBankAccounts(newAccs);
                                    }}
                                    onRemove={() => {
                                        const newAccs = [...bankAccountsRef.current];
                                        newAccs[idx] = { ...newAccs[idx], qrUrl: "" };
                                        updateBankAccounts(newAccs);
                                    }}
                                    label="បង្ហោះរូប QR ទទួលប្រាក់"
                                    folder={wedding.id}
                                    compact
                                />
                            </div>

                            {/* Primary recipient details */}
                            <div className="space-y-3.5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-foreground">ឈ្មោះអ្នកទទួលប្រាក់ <span className="text-teal-500">*</span></Label>
                                    <DebouncedInput
                                        placeholder="ឧ. SOK SAN & KONG SOCHATA"
                                        value={acc.accountName || ""}
                                        onDebouncedChange={(val) => {
                                            const newAccs = [...bankAccountsRef.current];
                                            newAccs[idx] = { ...newAccs[idx], accountName: val as string };
                                            updateBankAccounts(newAccs);
                                        }}
                                        className="h-11 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 text-xs font-bold text-foreground shadow-sm dark:border-white/10 dark:bg-black/20"
                                    />
                                </div>

                            </div>
                        </div>
                    </m.div>
                ))}

            </div>
        </div>
    );
}
