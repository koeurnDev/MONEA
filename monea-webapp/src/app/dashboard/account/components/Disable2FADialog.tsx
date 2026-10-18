import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldOff, Lock, RefreshCw, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[92vw] max-w-[400px] max-h-[90dvh] overflow-y-auto p-0 border-none rounded-2xl md:rounded-[2rem] bg-card shadow-2xl">
                <DialogHeader className="p-5 sm:p-8 pb-0">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <ShieldOff size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-black font-kantumruy text-destructive">{t("account.dialogs.disable2fa.title")}</DialogTitle>
                    <DialogDescription className="text-sm font-medium font-kantumruy opacity-70 mt-2">
                        {t("account.dialogs.disable2fa.description")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-6">
                    {disableError && (
                        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-bold text-destructive font-kantumruy">
                            <AlertCircle size={14} /> {disableError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t("account.dialogs.disable2fa.label")}</Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 transition-colors group-focus-within:text-destructive">
                                    <Lock size={16} />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl border-none bg-muted/40 pl-11 pr-11 font-bold transition-all focus-visible:ring-2 focus-visible:ring-destructive/30 sm:h-12"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
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
                            variant="destructive"
                            disabled={disabling2FA || !disablePassword}
                            className="h-11 w-full rounded-xl font-black font-kantumruy transition-all active:scale-95"
                        >
                            {disabling2FA ? <RefreshCw className="w-4 h-4 animate-spin" /> : t("account.dialogs.disable2fa.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
