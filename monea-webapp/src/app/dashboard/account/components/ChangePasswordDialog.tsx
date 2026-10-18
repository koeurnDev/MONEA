import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Lock, Eye, EyeOff, Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    currentPassword: string;
    setCurrentPassword: (v: string) => void;
    newPassword: string;
    setNewPassword: (v: string) => void;
    confirmPassword: string;
    setConfirmPassword: (v: string) => void;
    showPasswords: boolean;
    setShowPasswords: (v: boolean) => void;
    changingPassword: boolean;
    pwError: string;
}

export function ChangePasswordDialog({
    open,
    onOpenChange,
    onSubmit,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPasswords,
    setShowPasswords,
    changingPassword,
    pwError
}: ChangePasswordDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[92vw] max-w-[440px] max-h-[90dvh] overflow-y-auto p-0 border-none rounded-2xl sm:rounded-[2rem] bg-card shadow-2xl">
                <DialogHeader className="p-5 sm:p-8 pb-0">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                        <KeyRound size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-black font-kantumruy">
                        {t("account.dialogs.changePassword.title", { defaultValue: "ផ្លាស់ប្តូរពាក្យសម្ងាត់" })}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium font-kantumruy opacity-60">
                        {t("account.dialogs.changePassword.description", { defaultValue: "សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន និងពាក្យសម្ងាត់ថ្មីរបស់អ្នក។" })}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-6">
                    {pwError && (
                        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-bold text-destructive font-kantumruy">
                            <AlertCircle size={14} /> {pwError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground ml-1">
                                {t("account.dialogs.changePassword.currentLabel", { defaultValue: "ពាក្យសម្ងាត់បច្ចុប្បន្ន" })}
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 transition-colors group-focus-within:text-primary">
                                    <Lock size={16} />
                                </div>
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={t("account.dialogs.changePassword.currentPlaceholder", { defaultValue: "បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន" })}
                                    className="h-11 rounded-xl border-none bg-muted/40 pl-11 pr-11 font-bold transition-all focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground ml-1">
                                {t("account.dialogs.changePassword.newLabel", { defaultValue: "ពាក្យសម្ងាត់ថ្មី" })}
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 transition-colors group-focus-within:text-primary">
                                    <KeyRound size={16} />
                                </div>
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t("account.dialogs.changePassword.newPlaceholder", { defaultValue: "បញ្ចូលពាក្យសម្ងាត់ថ្មី" })}
                                    className="h-11 rounded-xl border-none bg-muted/40 pl-11 pr-11 font-bold transition-all focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground ml-1">
                                {t("account.dialogs.changePassword.confirmLabel", { defaultValue: "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី" })}
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 transition-colors group-focus-within:text-primary">
                                    <CheckCircle2 size={16} />
                                </div>
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t("account.dialogs.changePassword.confirmPlaceholder", { defaultValue: "បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត" })}
                                    className="h-11 rounded-xl border-none bg-muted/40 pl-11 pr-11 font-bold transition-all focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={changingPassword}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-kantumruy font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 sm:h-12"
                        >
                            {changingPassword ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>{t("account.dialogs.changePassword.submit", { defaultValue: "ផ្លាស់ប្តូរពាក្យសម្ងាត់" })} <Save size={18} /></>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
