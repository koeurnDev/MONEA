"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/i18n/LanguageProvider";

interface DeleteAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (password: string) => Promise<void>;
    isDeleting: boolean;
    error?: string;
}

export function DeleteAccountDialog({ 
    open, 
    onOpenChange, 
    onSubmit, 
    isDeleting, 
    error 
}: DeleteAccountDialogProps) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(password);
        if (!error) setPassword("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[92vw] max-w-[440px] rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-2xl p-6 md:p-10">
                <DialogHeader className="space-y-4">
                    <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
                        <Trash2 size={28} />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center font-kantumruy">{t("account.dialogs.deleteAccount.title")}</DialogTitle>
                    <DialogDescription className="text-center font-kantumruy text-sm opacity-70">
                        {t("account.dialogs.deleteAccount.description")}
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive" className="bg-red-50/50 border-red-100 text-red-900 rounded-2xl py-4 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-bold font-kantumruy ml-2">
                        {t("account.dialogs.deleteAccount.alert")}
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t("account.dialogs.deleteAccount.label")}
                        </Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 bg-muted/40 border-none rounded-2xl px-5 font-bold focus-visible:ring-2 focus-visible:ring-red-500/20"
                                placeholder={t("account.dialogs.deleteAccount.placeholder")}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs font-bold text-red-600 font-kantumruy ml-1">{error}</p>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between gap-3 mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 rounded-2xl font-bold font-kantumruy"
                        >
                            {t("account.dialogs.deleteAccount.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isDeleting || !password}
                            className="flex-[1.5] h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black font-kantumruy shadow-lg shadow-red-500/20"
                        >
                            {isDeleting ? t("account.dialogs.deleteAccount.processing") : t("account.dialogs.deleteAccount.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
