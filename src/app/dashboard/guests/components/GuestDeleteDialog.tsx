"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";

interface GuestDeleteDialogProps {
    deleteId: string | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function GuestDeleteDialog({ deleteId, onOpenChange, onConfirm }: GuestDeleteDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={!!deleteId} onOpenChange={onOpenChange}>
            <DialogContent className="w-[92vw] max-w-[400px] rounded-[1.5rem] md:rounded-[2rem] border-none shadow-2xl bg-card p-6 md:p-10">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-xl md:text-2xl font-black font-kantumruy mb-2">
                        {t("guests.delete.title")}
                    </DialogTitle>
                    <DialogDescription className="font-kantumruy text-sm md:text-base text-muted-foreground/70 leading-relaxed px-2">
                        {t("guests.delete.description")}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Button 
                        variant="ghost" 
                        onClick={() => onOpenChange(false)} 
                        className="rounded-xl md:rounded-2xl font-kantumruy font-bold h-12 md:h-14 flex-1 order-2 sm:order-1 border border-white/5 hover:bg-white/5 transition-all"
                    >
                        {t("common.actions.cancel")}
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm} 
                        className="rounded-xl md:rounded-2xl font-kantumruy font-bold h-12 md:h-14 flex-1 order-1 sm:order-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                    >
                        {t("common.actions.delete")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
