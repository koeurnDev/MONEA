import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Shield, ShieldOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Link } from "react-router-dom";

interface SecurityTabProps {
    user: any;
    onShow2FASetup: () => void;
    onShowDisable2FA: () => void;
}

export function SecurityTab({
    user,
    onShow2FASetup,
    onShowDisable2FA
}: SecurityTabProps) {
    const { t } = useTranslation();

    return (
        <Card className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm font-kantumruy">
            <CardHeader className="border-b border-border p-5 pb-4 sm:p-7">
                <CardTitle className="flex items-center gap-3 text-xl font-black text-foreground font-kantumruy sm:text-2xl">
                    <div className="rounded-2xl border border-sage/20 bg-accent p-2.5">
                        <Lock size={22} className="text-primary" />
                    </div>
                    <span>{t("account.security.title", { defaultValue: "ការកំណត់សុវត្ថិភាព" })}</span>
                </CardTitle>
                <CardDescription className="mt-1 font-kantumruy text-sm leading-relaxed text-muted-foreground">
                    {t("account.security.description", { defaultValue: "គ្រប់គ្រងការផ្ទៀងផ្ទាត់ពីរជាន់ និងសុវត្ថិភាពគណនីរបស់អ្នក។" })}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-5 sm:p-7">
                {/* 2FA Section */}
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-muted/50 p-3.5 sm:flex-row sm:items-center sm:p-5">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <Label className="text-base font-bold text-foreground font-kantumruy">
                                {t("account.security.twoFactor.title", { defaultValue: "ការផ្ទៀងផ្ទាត់២ដំណាក់ (2FA)" })}
                            </Label>
                            {user?.twoFactorEnabled ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 h-6 text-xs font-bold uppercase tracking-wider rounded-full">
                                    <CheckCircle2 size={12} className="mr-1" />
                                    {t("account.security.twoFactor.active", { defaultValue: "កំពុងប្រើ" })}
                                </Badge>
                            ) : (
                                <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 h-6 text-xs font-bold uppercase tracking-wider rounded-full">
                                    <AlertCircle size={12} className="mr-1" />
                                    {t("account.security.twoFactor.inactive", { defaultValue: "មិនទាន់បើក" })}
                                </Badge>
                            )}
                        </div>
                        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground font-kantumruy">
                            {t("account.security.twoFactor.description", { defaultValue: "បន្ថែមស្រទាប់សុវត្ថិភាពមួយកម្រិតទៀតទៅគណនីរបស់អ្នក ដោយទាមទារកូដពី Authenticator App។" })}
                        </p>
                    </div>
                    <div className="w-full shrink-0 sm:w-auto">
                        {!user?.hasPassword ? (
                            <div className="space-y-2.5 rounded-xl border border-border bg-background p-3 sm:max-w-sm">
                                <p className="text-xs leading-relaxed text-muted-foreground font-kantumruy">
                                    {t("account.security.ssoPasswordRequired", { defaultValue: "គណនីចូលតាម Google មិនទាន់មានពាក្យសម្ងាត់ MONEO ទេ។ កំណត់ពាក្យសម្ងាត់តាមអ៊ីមែលជាមុនសិន ដើម្បីបើក ឬបិទ 2FA។" })}
                                </p>
                                <Button asChild variant="outline" className="min-h-11 w-full rounded-xl font-kantumruy text-xs font-bold">
                                    <Link to="/forgot-password">
                                        {t("account.security.setPassword", { defaultValue: "កំណត់ពាក្យសម្ងាត់តាមអ៊ីមែល" })}
                                    </Link>
                                </Button>
                            </div>
                        ) : user?.twoFactorEnabled ? (
                            <Button
                                onClick={onShowDisable2FA}
                                variant="outline"
                                className="w-full rounded-xl border-border font-bold text-foreground transition-all active:scale-95 sm:w-auto"
                            >
                                <ShieldOff size={15} /> 
                                <span>{t("account.security.twoFactor.disable", { defaultValue: "បិទការផ្ទៀងផ្ទាត់" })}</span>
                            </Button>
                        ) : (
                            <Button
                                onClick={onShow2FASetup}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-kantumruy text-xs font-bold text-primary-foreground transition-all active:scale-95 hover:bg-primary/90 sm:w-auto"
                            >
                                <Shield size={15} /> 
                                <span>{t("account.security.twoFactor.enable", { defaultValue: "បើកប្រើប្រាស់ 2FA" })}</span>
                            </Button>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
