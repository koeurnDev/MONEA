"use client";

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
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none rounded-[2rem] bg-card shadow-2xl">
                <DialogHeader className="p-8 pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 mb-4">
                        <KeyRound size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-black font-kantumruy">{t("account.dialogs.changePassword.title")}</DialogTitle>
                    <DialogDescription className="text-sm font-medium font-kantumruy opacity-60">
                        {t("account.dialogs.changePassword.description")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="p-8 space-y-6">
                    {pwError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold font-kantumruy flex items-center gap-2">
                            <AlertCircle size={14} /> {pwError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("account.dialogs.changePassword.labels.current")}</Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={t("account.dialogs.changePassword.placeholders.password")}
                                    className="h-12 pl-11 pr-11 bg-muted/40 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("account.dialogs.changePassword.labels.new")}</Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:text-indigo-500 transition-colors">
                                    <KeyRound size={16} />
                                </div>
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t("account.dialogs.changePassword.placeholders.password")}
                                    className="h-12 pl-11 pr-11 bg-muted/40 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("account.dialogs.changePassword.labels.confirm")}</Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40 group-focus-within:text-indigo-500 transition-colors">
                                    <CheckCircle2 size={16} />
                                </div>
                                <Input
                                    type={showPasswords ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t("account.dialogs.changePassword.placeholders.password")}
                                    className="h-12 pl-11 bg-muted/40 border-none rounded-xl font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={changingPassword}
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black font-kantumruy shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {changingPassword ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>{t("account.dialogs.changePassword.submit")} <Save size={18} /></>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
