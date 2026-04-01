"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldOff, Lock, RefreshCw, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface Disable2FADialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    disablePassword: string;
    setDisablePassword: (v: string) => void;
    disabling2FA: boolean;
    disableError: string;
}

export function Disable2FADialog({
    open,
    onOpenChange,
    onSubmit,
    disablePassword,
    setDisablePassword,
    disabling2FA,
    disableError
}: Disable2FADialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[92vw] max-w-[400px] p-0 overflow-hidden border-none rounded-[1.5rem] md:rounded-[2rem] bg-card shadow-2xl">
                <DialogHeader className="p-8 pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 mb-4">
                        <ShieldOff size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-black font-kantumruy text-red-600">{t("account.dialogs.disable2fa.title")}</DialogTitle>
                    <DialogDescription className="text-sm font-medium font-kantumruy opacity-70 mt-2">
                        {t("account.dialogs.disable2fa.description")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="p-8 space-y-6">
                    {disableError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold font-kantumruy flex items-center gap-2">
                            <AlertCircle size={14} /> {disableError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("account.dialogs.disable2fa.label")}</Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:text-red-500 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <Input
                                    type="password"
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 pl-11 bg-muted/40 border-none rounded-xl font-bold focus:ring-2 focus:ring-red-500/20 transition-all"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="w-full h-11 rounded-xl font-bold font-kantumruy"
                        >
                            {t("account.dialogs.disable2fa.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={disabling2FA || !disablePassword}
                            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black font-kantumruy shadow-lg shadow-red-500/20 transition-all active:scale-95"
                        >
                            {disabling2FA ? <RefreshCw className="w-4 h-4 animate-spin" /> : t("account.dialogs.disable2fa.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
