import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "../../_components/SkeletonComponents";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Users, Send, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

interface DesktopGuestTableProps {
    loading: boolean;
    guests: any[];
    searchActive: boolean;
    onClearSearch: () => void;
    visibleCount: number;
    setVisibleCount: (v: any) => void;
    copiedId: string | null;
    isArchived: boolean;
    onCopyLink: (name: string, id: string) => void;
    onShareTelegram?: (name: string, id: string) => void;
    onViewPass?: (guest: any) => void;
    onEdit: (guest: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function DesktopGuestTable({
    loading,
    guests,
    searchActive,
    onClearSearch,
    visibleCount,
    setVisibleCount,
    copiedId,
    isArchived,
    onCopyLink,
    onShareTelegram,
    onViewPass,
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
                    <TableRow className="border-none print:border-t-2 print:border-b-2 print:border-teal-300 hover:bg-transparent hidden print:table-row bg-teal-50/20">
                        <TableHead className="h-14 px-4 text-xs font-bold font-kantumruy print:text-teal-600 w-16 text-center whitespace-nowrap border-r print:border-teal-300 print:border-t-2 print:border-l-2">{t("guests.cols.no")}</TableHead>
                        <TableHead className="h-14 px-8 text-xs font-bold font-kantumruy print:text-teal-600 border-r print:border-teal-300 text-left print:border-t-2">{t("guests.cols.name")}</TableHead>
                        <TableHead className="h-14 px-8 text-xs font-bold font-kantumruy print:text-teal-600 text-center print:border-t-2 print:border-r-2 print:border-teal-300">{t("guests.cols.location")}</TableHead>
                    </TableRow>

                    <TableRow className="border-none print:hidden hover:bg-transparent">
                        <TableHead className="h-14 px-4 text-xs font-bold font-kantumruy text-muted-foreground w-16 text-center whitespace-nowrap">{t("guests.cols.no")}</TableHead>
                        <TableHead className="h-14 px-8 text-xs font-bold font-kantumruy text-foreground bg-muted/30">
                            {t("guests.cols.name")}
                        </TableHead>
                        <TableHead className="h-14 px-8 text-xs font-bold font-kantumruy text-muted-foreground text-center">
                            {t("guests.cols.location")}
                        </TableHead>
                        <TableHead className="h-14 px-8 text-xs font-bold font-kantumruy text-muted-foreground text-right">{t("guests.cols.actions")}</TableHead>
                    </TableRow>

                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="p-8">
                                <TableSkeleton />
                            </TableCell>
                        </TableRow>
                    ) : guests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-[400px]">
                                <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center border border-primary/20">
                                        <Users className="w-10 h-10 text-primary/60" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-foreground font-kantumruy">
                                            {searchActive
                                                ? t("guests.searchEmptyTitle", { defaultValue: "រកមិនឃើញភ្ញៀវដែលត្រូវនឹងការស្វែងរកទេ" })
                                                : isArchived ? "មិនមានភ្ញៀវក្នុងប័ណ្ណសារទេ" : t("guests.empty")}
                                        </h3>
                                        <p className="text-sm font-medium text-muted-foreground/80 max-w-sm mx-auto font-kantumruy">
                                            {searchActive
                                                ? t("guests.searchEmptyDescription", { defaultValue: "សាកល្បងពាក្យផ្សេង ឬសម្អាតការស្វែងរក។" })
                                                : isArchived ? "ភ្ញៀវដែលបានរក្សាទុកក្នុងប័ណ្ណសារ នឹងបង្ហាញនៅទីនេះ។" : "ចាប់ផ្តើមបន្ថែមភ្ញៀវកិត្តិយសរបស់អ្នក ដើម្បីងាយស្រួលក្នុងការគ្រប់គ្រង និងផ្ញើធៀប។"}
                                        </p>
                                    </div>
                                    {searchActive ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onClearSearch}
                                            className="h-11 rounded-xl px-6 font-kantumruy font-bold"
                                        >
                                            {t("guests.clearSearch", { defaultValue: "សម្អាតការស្វែងរក" })}
                                        </Button>
                                    ) : !isArchived && (
                                        <Button
                                            type="button"
                                            onClick={() => onEdit(null)}
                                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg font-bold font-kantumruy transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Plus className="w-5 h-5 mr-2" />
                                            {t("dashboard.actions.addGuest", { defaultValue: "បន្ថែមភ្ញៀវដំបូង" })}
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
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
                                <TableCell className="px-4 py-5 text-muted-foreground print:text-slate-900 font-bold font-kantumruy text-sm print:border-r print:border-l-2 print:border-slate-200 italic w-16 text-center whitespace-nowrap">
                                    {String(g.sequenceNumber || index + 1).padStart(2, '0')}
                                </TableCell>
                                <TableCell className="px-8 py-5 print:border-r print:border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 shrink-0 rounded-full print:hidden", g.rsvpStatus === 'CONFIRMED' ? 'bg-green-500' : g.rsvpStatus === 'DECLINED' ? 'bg-red-500' : 'bg-muted-foreground/40')} title={g.rsvpStatus || 'PENDING'} />
                                        <span className="font-bold text-foreground font-kantumruy text-sm">{g.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-center print:border-r-2 print:border-slate-200">
                                    <span className="px-3 py-1 rounded-lg font-bold font-kantumruy text-xs bg-muted/60 dark:bg-white/5 text-muted-foreground print:bg-transparent print:text-sm print:text-slate-600">
                                        {g.group && g.group !== "None" ? g.group : (g.source && g.source !== "GIFT_ENTRY" && g.source !== "None" ? g.source : <span className="opacity-40 italic">{t("guests.general")}</span>)}
                                    </span>
                                </TableCell>
                                <TableCell className="px-8 py-4 text-right print:hidden">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button
                                            variant={copiedId === g.id ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onCopyLink(g.name, g.id)}
                                            className={cn(
                                                "h-11 px-3 rounded-xl font-kantumruy font-bold text-xs transition-all",
                                                copiedId === g.id ? "bg-green-600 text-white" : "text-muted-foreground"
                                            )}
                                        >
                                            {copiedId === g.id ? t("guests.copied") : t("guests.copyLink")}
                                        </Button>
                                        {onShareTelegram && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onShareTelegram(g.name, g.id)}
                                                className="h-11 px-3 rounded-xl font-kantumruy font-bold text-xs border-[#229ED9]/30 text-[#1A6F9E] dark:text-[#229ED9] hover:bg-[#229ED9]/10 hover:text-[#1A6F9E] dark:hover:text-[#229ED9] transition-all flex items-center gap-1.5"
                                                title="ផ្ញើតាម Telegram ជាមួយឈ្មោះភ្ញៀវ"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Telegram</span>
                                            </Button>
                                        )}
                                        {onViewPass && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewPass(g)}
                                                className="h-11 px-3 rounded-xl font-kantumruy font-bold text-xs border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 transition-all flex items-center gap-1.5"
                                                title="មើល ឬទាញយកសំបុត្រឌីជីថល"
                                            >
                                                <Ticket className="w-3.5 h-3.5 text-amber-600" />
                                                <span>សំបុត្រ</span>
                                            </Button>
                                        )}
                                        {!isArchived && (
                                            <>
                                                <Button variant="ghost" size="icon" aria-label="Edit guest" className="h-11 w-11 rounded-xl" onClick={() => onEdit(g)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" aria-label="Delete guest" className="h-11 w-11 rounded-xl" onClick={() => onDelete(g.id, g.name)}><Trash2 className="h-4 w-4" /></Button>
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
