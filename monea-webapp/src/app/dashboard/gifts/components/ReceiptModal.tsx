"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/LanguageProvider";

interface ReceiptModalProps {
    open: boolean;
    onClose: () => void;
    receiptData: { name: string; amount: string; currency: string; source?: string; sequenceNumber?: number } | null;
}

export function ReceiptModal({ open, onClose, receiptData }: ReceiptModalProps) {
    const { t } = useTranslation();
    if (!receiptData) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="w-[92vw] max-w-[440px] rounded-[1.5rem] md:rounded-[2rem] bg-card text-center p-6 md:p-10 flex flex-col items-center justify-center space-y-4 border-none shadow-2xl">
                <DialogTitle className="sr-only">{t("gifts.receipt.success")}</DialogTitle>
                <DialogDescription className="sr-only">
                    {t("gifts.receipt.recorded")}
                </DialogDescription>
                <div className="rounded-full bg-emerald-500/10 p-2 md:p-3">
                    <Check className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                </div>
                <div className="space-y-1">
                    {receiptData.sequenceNumber && (
                        <div className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full inline-block mb-1 uppercase tracking-widest">
                            {receiptData.sequenceNumber}
                        </div>
                    )}
                    <h2 className="text-xl font-bold text-foreground">{t("gifts.receipt.success")}</h2>
                    <p className="text-muted-foreground">{t("gifts.receipt.recorded")}</p>
                </div>

                <div className="w-full bg-muted/30 rounded-xl p-6 border border-border my-4">
                    <p className="text-sm text-muted-foreground mb-1">{t("gifts.receipt.from")}</p>
                    <h3 className="text-2xl font-bold text-foreground mb-4 font-kantumruy">{receiptData.name}</h3>

                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl md:text-4xl font-extrabold text-blue-600">
                            {receiptData.currency === "USD" ? "$" : ""}
                            {parseFloat(receiptData.amount).toLocaleString()}
                            {receiptData.currency === "KHR" ? "៛" : ""}
                        </span>
                        <span className="text-gray-400 font-medium">{receiptData.currency}</span>
                    </div>
                    {receiptData.source && (
                        <p className="text-sm text-gray-400 mt-2">📍 {receiptData.source}</p>
                    )}
                </div>

                <Button
                    onClick={onClose}
                    className="w-full h-11 md:h-12 text-lg bg-blue-600 hover:bg-blue-700 font-bold"
                    autoFocus
                >
                    {t("gifts.receipt.closeAndNext")}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
