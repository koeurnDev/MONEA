"use client";

import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Copy, Edit, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileGuestListProps {
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
    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">កំពុងផ្ទុក...</span>
            </div>
        );
    }

    if (guests.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-2 opacity-30">
                <Users size={40} className="mb-2" />
                <p className="font-kantumruy font-bold">មិនមានទិន្នន័យភ្ញៀវឡើយ</p>
            </div>
        );
    }

    return (
        <div className="md:hidden space-y-2 p-3 print:hidden">
            <div className="grid px-4 pb-1.5" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">ឈ្មោះភ្ញៀវ</span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center opacity-50">មកពីណា / ទីតាំង</span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right opacity-50">សកម្មភាព</span>
            </div>
            {guests.slice(0, visibleCount).map((g: any) => (
                <div key={g.id} className="bg-background rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] grid items-center min-h-[52px]" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                    <div className="min-w-0 flex items-center">
                        <span className="font-bold text-foreground font-kantumruy text-sm truncate leading-tight">{g.name}</span>
                    </div>

                    <div className="flex justify-center items-center">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold truncate max-w-full text-center">
                            {g.group && g.group !== "None" ? g.group : (g.source && g.source !== "GIFT_ENTRY" && g.source !== "None" ? g.source : "ទូទៅ")}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            variant={copiedId === g.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => onCopyLink(g.name, g.id)}
                            className={cn(
                                "h-8 px-3 rounded-xl font-kantumruy font-bold text-[10px] transition-all border-border",
                                copiedId === g.id
                                    ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                                    : "text-muted-foreground hover:text-rose-600 hover:border-rose-100 dark:hover:border-rose-900/50 hover:bg-muted/50"
                            )}
                        >
                            {copiedId === g.id ? (
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> ចំលង</span>
                            ) : (
                                <span className="flex items-center gap-1.5"><Copy size={12} /> ចំលងតំណរ</span>
                            )}
                        </Button>
                        {!isArchived && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-muted rounded-xl"
                                    onClick={() => onEdit(g)}
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-muted rounded-xl"
                                    onClick={() => onDelete(g.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        )}
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
                        <Plus size={16} className="mr-2" /> បង្ហាញបន្ថែម ({guests.length - visibleCount})
                    </Button>
                </div>
            )}
        </div>
    );
}
