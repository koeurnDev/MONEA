"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ReceiptModalProps {
    open: boolean;
    onClose: () => void;
    receiptData: { name: string; amount: string; currency: string; source?: string; sequenceNumber?: number } | null;
}

export function ReceiptModal({ open, onClose, receiptData }: ReceiptModalProps) {
    if (!receiptData) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md bg-card text-center p-5 md:p-8 flex flex-col items-center justify-center space-y-4">
                <DialogTitle className="sr-only">Submission Successful</DialogTitle>
                <DialogDescription className="sr-only">
                    Details of the successfully recorded gift.
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
                    <h2 className="text-xl font-bold text-foreground">បានទទួលជោគជ័យ</h2>
                    <p className="text-muted-foreground">កាដូត្រូវបានកត់ត្រាចូលក្នុងប្រព័ន្ធ</p>
                </div>

                <div className="w-full bg-muted/30 rounded-xl p-6 border border-border my-4">
                    <p className="text-sm text-muted-foreground mb-1">ទទួលបានពី</p>
                    <h3 className="text-2xl font-bold text-foreground mb-4 font-kantumruy">{receiptData.name}</h3>

                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl md:text-4xl font-extrabold text-blue-600">
                            {receiptData.currency === "USD" ? "$" : ""}
                            {parseFloat(receiptData.amount).toLocaleString()}
                            {receiptData.currency === "KHR" ? "ល" : ""}
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
                    បិទ & បន្តទៅអ្នកបន្ទាប់
                </Button>
            </DialogContent>
        </Dialog>
    );
}
