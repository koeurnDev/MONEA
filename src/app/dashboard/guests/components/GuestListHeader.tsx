"use client";

import { Button } from "@/components/ui/button";
import { Plus, Download, Printer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { GuestForm } from "../guest-form";
import { GuestImport } from "../guest-import";

interface GuestListHeaderProps {
    isArchived: boolean;
    isPremium: boolean;
    loading: boolean;
    open: boolean;
    setOpen: (v: boolean) => void;
    editingGuest: any;
    setEditingGuest: (v: any) => void;
    loadData: () => void;
    onExportExcel: () => void;
    onPrintPdf: () => void;
}

export function GuestListHeader({
    isArchived,
    isPremium,
    loading,
    open,
    setOpen,
    editingGuest,
    setEditingGuest,
    loadData,
    onExportExcel,
    onPrintPdf
}: GuestListHeaderProps) {
    return (
        <div className="flex flex-row justify-between items-center gap-3 print:hidden">
            <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-rose-600 mb-0.5">
                    <Users size={10} />
                    Guest Management
                </div>
                <h2 className="text-xl md:text-3xl font-black tracking-tight text-foreground font-kantumruy leading-tight truncate">
                    បញ្ជីឈ្មោះភ្ញៀវ {isArchived && <span className="ml-1 text-rose-600 text-xs">(ឯកសារ)</span>}
                </h2>
                <p className="text-muted-foreground font-medium font-kantumruy text-xs hidden md:block">
                    គ្រប់គ្រងបញ្ជីឈ្មោះភ្ញៀវ និងការផ្ញើតំណរភ្ជាប់អញ្ជើញ។
                </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                    {!isArchived && <GuestImport onSuccess={loadData} className="h-8 px-2.5 text-[10px] sm:h-9 sm:px-3 sm:text-[11px]" />}
                    <Button
                        variant="outline"
                        onClick={() => isPremium ? onExportExcel() : null}
                        className={cn(
                            "h-8 px-2.5 sm:h-9 sm:px-3 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-kantumruy font-bold transition-all text-[10px] sm:text-[11px]",
                            !isPremium && "opacity-50"
                        )}
                        title={!isPremium ? "សូមដំឡើងទៅគម្រោងកម្រិតខ្ពស់ ដើម្បីទាញយក!" : ""}
                    >
                        <Download className={cn("mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5", isPremium ? "text-blue-600" : "text-gray-400")} /> Excel
                        {!isPremium && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-rose-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => isPremium ? onPrintPdf() : null}
                        className={cn(
                            "h-8 px-2.5 sm:h-9 sm:px-3 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-kantumruy font-bold transition-all text-[10px] sm:text-[11px]",
                            !isPremium && "opacity-50"
                        )}
                        title={!isPremium ? "សូមដំឡើងទៅគម្រោងកម្រិតខ្ពស់ ដើម្បីទាញយក!" : ""}
                    >
                        <Printer className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" /> PDF
                        {!isPremium && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-rose-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                    </Button>
                </div>
                <div className="hidden sm:block">
                    {!isArchived && (
                        <Dialog open={open} onOpenChange={(v) => {
                            setOpen(v);
                            if (!v) setEditingGuest(null);
                        }}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => setEditingGuest(null)}
                                    className="h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all font-kantumruy font-bold"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> បន្ថែមភ្ញៀវ
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px] rounded-3xl border-none bg-card p-4 pt-10 md:p-8 md:pt-14">
                                <div className="sr-only">
                                    <DialogTitle>បន្ថែម/កែប្រែភ្ញៀវ (Add/Edit Guest)</DialogTitle>
                                    <DialogDescription>
                                        បំពេញព័ត៌មានភ្ញៀវ (Fill in guest details)
                                    </DialogDescription>
                                </div>
                                <div className="">
                                    <GuestForm
                                        initialData={editingGuest}
                                        onSuccess={loadData}
                                        onDone={() => { setOpen(false); setEditingGuest(null); }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </div>
    );
}
