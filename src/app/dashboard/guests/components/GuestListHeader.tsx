"use client";

import { Button } from "@/components/ui/button";
import { Plus, Download, Printer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/LanguageProvider";

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
    const { t } = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 print:hidden">
            <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-rose-600 mb-0.5">
                    <div className="bg-rose-500/10 p-1.5 rounded-lg">
                        <Users size={12} />
                    </div>
                    {t("guests.managementTitle")}
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-kantumruy leading-tight truncate">
                    {t("guests.title")} {isArchived && <span className="ml-1 text-rose-600 text-xs">({t("guests.archivedLabel")})</span>}
                </h2>
                <p className="text-muted-foreground/60 font-bold font-kantumruy text-[10px] md:text-xs uppercase tracking-wider hidden md:block">
                    {t("guests.descriptionLabel")}
                </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                    {!isArchived && <GuestImport onSuccess={loadData} className="h-10 px-4 text-[11px] sm:px-6 sm:text-sm rounded-xl" />}
                    <Button
                        variant="outline"
                        onClick={() => isPremium ? onExportExcel() : null}
                        className={cn(
                            "h-10 px-4 sm:px-6 border-none bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl font-kantumruy font-bold transition-all text-[11px] sm:text-sm shadow-sm flex-1 sm:flex-none",
                            !isPremium && "opacity-50"
                        )}
                        title={!isPremium ? t("guests.upgradeHint") : ""}
                    >
                        <Download className={cn("mr-1.5 h-4 w-4", isPremium ? "text-blue-600" : "text-gray-400")} /> Excel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => isPremium ? onPrintPdf() : null}
                        className={cn(
                            "h-10 px-4 sm:px-6 border-none bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl font-kantumruy font-bold transition-all text-[11px] sm:text-sm shadow-sm flex-1 sm:flex-none",
                            !isPremium && "opacity-50"
                        )}
                        title={!isPremium ? t("guests.upgradeHint") : ""}
                    >
                        <Printer className="mr-2 h-4 w-4 text-muted-foreground" /> PDF
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
                                    className="h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-100 dark:shadow-none transition-all font-kantumruy font-bold text-sm"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> {t("guests.form.addBtn")}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px] rounded-3xl border-none bg-card p-4 pt-10 md:p-8 md:pt-14 shadow-2xl">
                                <div className="sr-only">
                                    <DialogTitle>{t("guests.form.title")}</DialogTitle>
                                    <DialogDescription>
                                        {t("guests.form.description")}
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
