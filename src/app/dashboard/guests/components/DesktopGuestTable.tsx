"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "../../_components/SkeletonComponents";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

interface DesktopGuestTableProps {
    loading: boolean;
    guests: any[];
    visibleCount: number;
    setVisibleCount: (v: any) => void;
    copiedId: string | null;
    isArchived: boolean;
    onCopyLink: (name: string, id: string) => void;
    onEdit: (guest: any) => void;
    onDelete: (id: string) => void;
}

export function DesktopGuestTable({
    loading,
    guests,
    visibleCount,
    setVisibleCount,
    copiedId,
    isArchived,
    onCopyLink,
    onEdit,
    onDelete
}: DesktopGuestTableProps) {
    const { t } = useTranslation();

    return (
        <div className="hidden md:block overflow-x-auto print:block">
            <Table className="print:border-collapse print:border-2 print:border-slate-200">
                <TableHeader className="bg-muted/50 print:bg-white">
                </TableHeader>
                <TableBody>
                    <TableRow className="border-none print:border-t-2 print:border-b-2 print:border-rose-300 hover:bg-transparent hidden print:table-row bg-rose-50/20">
                        <TableHead className="h-14 px-8 text-[11px] print:text-rose-600 font-black uppercase tracking-widest w-20 border-r print:border-rose-300 print:border-t-2 print:border-l-2">{t("guests.cols.no")}</TableHead>
                        <TableHead className="h-14 px-8 text-[11px] print:text-rose-600 font-black uppercase tracking-widest border-r print:border-rose-300 text-left print:border-t-2">{t("guests.cols.name")}</TableHead>
                        <TableHead className="h-14 px-8 text-[11px] print:text-rose-600 font-black uppercase tracking-widest text-center print:border-t-2 print:border-r-2 print:border-rose-300">{t("guests.cols.location")}</TableHead>
                    </TableRow>

                    <TableRow className="border-none print:hidden hover:bg-transparent">
                        <TableHead className="h-14 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-widest w-20">{t("guests.cols.no")}</TableHead>
                        <TableHead className="h-14 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30">
                            {t("guests.cols.name")}
                        </TableHead>
                        <TableHead className="h-14 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-center opacity-70">
                            {t("guests.cols.location")}
                        </TableHead>
                        <TableHead className="h-14 px-8 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-right opacity-70">{t("guests.cols.actions")}</TableHead>
                    </TableRow>

                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="p-8">
                                <TableSkeleton />
                            </TableCell>
                        </TableRow>
                    ) : guests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-64 text-center text-sm font-kantumruy font-bold text-muted-foreground/30">{t("guests.empty")}</TableCell>
                        </TableRow>
                    ) : (
                        guests.map((g: any, index: number) => (
                            <TableRow
                                key={g.id}
                                className={cn(
                                    "border-none transition-colors group hover:bg-muted/30",
                                    "print:bg-transparent print:border-b print:border-slate-200"
                                )}
                            >
                                <TableCell className="px-8 py-5 text-muted-foreground print:text-slate-900 font-bold font-kantumruy text-sm print:border-r print:border-l-2 print:border-slate-200 italic">
                                    {String(g.sequenceNumber || index + 1).padStart(2, '0')}
                                </TableCell>
                                <TableCell className="px-8 py-5 print:border-r print:border-slate-200">
                                    <span className="font-bold text-foreground font-kantumruy text-sm">{g.name}</span>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-center print:border-r-2 print:border-slate-200">
                                    <span className="px-3 py-1 rounded-lg font-bold font-kantumruy text-[11px] bg-muted/60 dark:bg-white/5 text-muted-foreground print:bg-transparent print:text-sm print:text-slate-600">
                                        {g.group && g.group !== "None" ? g.group : (g.source && g.source !== "GIFT_ENTRY" && g.source !== "None" ? g.source : <span className="opacity-40 italic">{t("guests.general")}</span>)}
                                    </span>
                                </TableCell>
                                <TableCell className="px-8 py-4 text-right print:hidden">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant={copiedId === g.id ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onCopyLink(g.name, g.id)}
                                            className={cn(
                                                "h-9 px-4 rounded-xl font-kantumruy font-bold text-[11px] transition-all",
                                                copiedId === g.id ? "bg-green-600 text-white" : "text-muted-foreground"
                                            )}
                                        >
                                            {copiedId === g.id ? t("guests.copied") : t("guests.copyLink")}
                                        </Button>
                                        {!isArchived && (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => onEdit(g)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => onDelete(g.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {guests.length > visibleCount && (
                <div className="p-6 flex justify-center print:hidden">
                    <Button
                        variant="outline"
                        onClick={() => setVisibleCount((prev: number) => prev + 50)}
                        className="w-full max-w-xs h-12 rounded-2xl border-dashed border-2 border-border text-muted-foreground font-kantumruy font-bold hover:bg-muted/50"
                    >
                        <Plus size={16} className="mr-2" /> {t("guests.showMore", { count: guests.length - visibleCount })}
                    </Button>
                </div>
            )}
        </div>
    );
}
