"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GuestDeleteDialogProps {
    deleteId: string | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function GuestDeleteDialog({ deleteId, onOpenChange, onConfirm }: GuestDeleteDialogProps) {
    return (
        <Dialog open={!!deleteId} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-sm bg-card">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black font-kantumruy">បញ្ជាក់ការលុប</DialogTitle>
                    <DialogDescription className="font-kantumruy">
                        តើអ្នកពិតជាចង់លុបភ្ញៀវនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-kantumruy font-bold h-11 flex-1">
                        បោះបង់
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} className="rounded-xl font-kantumruy font-bold h-11 flex-1 bg-red-600 hover:bg-red-700">
                        លុប
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
