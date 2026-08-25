import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Copy, Edit, Trash2, Users, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

interface MobileGuestListProps {
    loading: boolean;
    guests: any[];
    visibleCount: number;
    setVisibleCount: (v: any) => void;
    copiedId: string | null;
    isArchived: boolean;
    onCopyLink: (name: string, id: string) => void;
    onEdit: (guest: any) => void;
    onDelete: (id: string, name: string) => void;
}

export function MobileGuestList({
    loading,
    guests,
    visibleCount,
    setVisibleCount,
    copiedId,
    isArchived,
    onCopyLink,
    onEdit,
    onDelete
}: MobileGuestListProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
                <span className="text-[12px] font-black text-muted-foreground/50 uppercase tracking-widest">{t("guests.loading")}</span>
            </div>
        );
    }

    if (guests.length === 0) {
        return (
            <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-5 px-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
                    <Users className="w-8 h-8 text-rose-300 dark:text-rose-700" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-black text-foreground font-kantumruy">
                        {t("guests.empty")}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground/80 font-kantumruy">
                        ចាប់ផ្តើមបន្ថែមភ្ញៀវកិត្តិយសរបស់អ្នក ដើម្បីងាយស្រួលក្នុងការគ្រប់គ្រង និងផ្ញើធៀប។
                    </p>
                </div>
                <Button 
                    onClick={() => onEdit(null)} 
                    className="h-12 w-full max-w-[200px] bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-lg shadow-rose-600/20 font-bold font-kantumruy transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {t("dashboard.actions.addGuest", { defaultValue: "បន្ថែមភ្ញៀវដំបូង" })}
                </Button>
            </div>
        );
    }

    return (
        <div className="md:hidden space-y-3 p-4 print:hidden">
            <div className="grid px-4 pb-2" style={{ gridTemplateColumns: '1.5fr 1fr auto' }}>
                <span className="text-xs font-bold font-kantumruy text-muted-foreground opacity-70">{t("guests.cols.name")}</span>
                <span className="text-xs font-bold font-kantumruy text-muted-foreground text-center opacity-70">{t("guests.cols.location")}</span>
                <span className="text-xs font-bold font-kantumruy text-muted-foreground text-right opacity-70">{t("guests.cols.actions")}</span>
            </div>
            {guests.slice(0, visibleCount).map((g: any) => (
                <div key={g.id} className="bg-background rounded-3xl px-4 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] grid items-center min-h-[72px] border border-black/[0.02] dark:border-white/[0.02]" style={{ gridTemplateColumns: '1.5fr 1fr auto' }}>
                    <div className="min-w-0 pr-2 flex items-center gap-2">
                        <div className={cn("w-2 h-2 shrink-0 rounded-full", g.rsvpStatus === 'CONFIRMED' ? 'bg-green-500' : g.rsvpStatus === 'DECLINED' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700')} title={g.rsvpStatus || 'PENDING'} />
                        <span className="font-bold text-foreground font-kantumruy text-[16px] leading-tight line-clamp-2">{g.name}</span>
                    </div>

                    <div className="flex justify-center items-center px-1">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-muted-foreground text-[11px] font-bold truncate max-w-full text-center tracking-tight">
                            {g.group && g.group !== "None" ? g.group : (g.source && g.source !== "GIFT_ENTRY" && g.source !== "None" ? g.source : t("guests.general"))}
                        </span>
                    </div>

                    <div className="flex items-center justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-muted/50 rounded-xl">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 font-kantumruy">
                                <DropdownMenuItem onClick={() => onCopyLink(g.name, g.id)} className="gap-3 py-3 rounded-xl cursor-pointer">
                                    {copiedId === g.id ? (
                                        <CheckCircle2 size={16} className="text-green-600" />
                                    ) : (
                                        <Copy size={16} className="text-muted-foreground" />
                                    )}
                                    <span className="font-bold">{copiedId === g.id ? t("guests.copied", { defaultValue: "បានចម្លង" }) : t("guests.copyLink", { defaultValue: "ចម្លងតំណភ្ជាប់" })}</span>
                                </DropdownMenuItem>
                                
                                {!isArchived && (
                                    <>
                                        <DropdownMenuItem onClick={() => onEdit(g)} className="gap-3 py-3 rounded-xl cursor-pointer">
                                            <Edit size={16} className="text-blue-600" />
                                            <span className="font-bold">កែប្រែ</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(g.id, g.name)} className="gap-3 py-3 rounded-xl cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50">
                                            <Trash2 size={16} />
                                            <span className="font-bold">លុប</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
            {guests.length > visibleCount && (
                <div className="pt-4 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => setVisibleCount((prev: number) => prev + 50)}
                        className="w-full h-12 rounded-2xl border-dashed border-2 border-border text-muted-foreground font-kantumruy font-bold hover:bg-muted/50"
                    >
                        <Plus size={16} className="mr-2" /> {t("guests.showMore", { count: guests.length - visibleCount })}
                    </Button>
                </div>
            )}
        </div>
    );
}
