import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Shield, ShieldOff, LogOut, RefreshCw, History, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface SecurityTabProps {
    user: any;
    securityLogs: any[];
    loadingLogs: boolean;
    securityLogsError: boolean;
    revoking: boolean;
    onFetchLogs: () => void;
    onRevokeSessions: () => void;
    onShow2FASetup: () => void;
    onShowDisable2FA: () => void;
}

export function SecurityTab({
    user,
    securityLogs,
    loadingLogs,
    securityLogsError,
    revoking,
    onFetchLogs,
    onRevokeSessions,
    onShow2FASetup,
    onShowDisable2FA
}: SecurityTabProps) {
    const { t } = useTranslation();

    return (
        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#141419] font-kantumruy">
            <CardHeader className="border-b border-slate-200/80 p-5 pb-4 dark:border-white/10 sm:p-7">
                <CardTitle className="flex items-center gap-3 text-xl font-black text-foreground font-kantumruy sm:text-2xl">
                    <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-2.5">
                        <Lock size={22} className="text-teal-600 dark:text-teal-400" />
                    </div>
                    <span>{t("account.security.title", { defaultValue: "ការកំណត់សុវត្ថិភាព" })}</span>
                </CardTitle>
                <CardDescription className="mt-1 font-kantumruy text-sm leading-relaxed text-muted-foreground">
                    {t("account.security.description", { defaultValue: "រក្សាគណនីរបស់អ្នកឱ្យមានសុវត្ថិភាពជាមួយ 2FA និងការគ្រប់គ្រងឧបករណ៍។" })}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-5 sm:p-7">
                {/* 2FA Section */}
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:p-5">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <Label className="text-base font-bold text-foreground font-kantumruy">
                                {t("account.security.twoFactor.title", { defaultValue: "ការផ្ទៀងផ្ទាត់២ដំណាក់ (2FA)" })}
                            </Label>
                            {user?.twoFactorEnabled ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 h-6 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    <CheckCircle2 size={12} className="mr-1" />
                                    {t("account.security.twoFactor.active", { defaultValue: "កំពុងប្រើ" })}
                                </Badge>
                            ) : (
                                <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 h-6 text-[10px] font-bold uppercase tracking-wider rounded-full">
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
                        {user?.twoFactorEnabled ? (
                            <Button
                                onClick={onShowDisable2FA}
                                variant="outline"
                                className="w-full rounded-xl border-slate-200 font-bold text-foreground transition-all active:scale-95 dark:border-white/10 sm:w-auto"
                            >
                                <ShieldOff size={15} /> 
                                <span>{t("account.security.twoFactor.disable", { defaultValue: "បិទការផ្ទៀងផ្ទាត់" })}</span>
                            </Button>
                        ) : !user?.hasPassword ? (
                            <span className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-100 px-4 text-center text-[11px] font-bold text-muted-foreground dark:bg-white/5 sm:w-auto">
                                {t("account.security.passwordRequired", { defaultValue: "ត្រូវមាន Password មុន" })}
                            </span>
                        ) : (
                            <Button
                                onClick={onShow2FASetup}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 font-kantumruy text-xs font-bold text-white transition-all active:scale-95 hover:bg-teal-700 sm:w-auto"
                            >
                                <Shield size={15} /> 
                                <span>{t("account.security.twoFactor.enable", { defaultValue: "បើកប្រើប្រាស់ 2FA" })}</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:p-5">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="rounded-lg border border-slate-200 bg-white p-1.5 text-muted-foreground dark:border-white/10 dark:bg-white/5">
                                <LogOut size={16} />
                            </div>
                            <Label className="text-base font-bold text-foreground font-kantumruy">
                                {t("account.security.sessions.title", { defaultValue: "ឧបករណ៍ដែលកំពុងសកម្ម (Active Sessions)" })}
                            </Label>
                        </div>
                        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground font-kantumruy">
                            {t("account.security.sessions.description", { defaultValue: "ផ្តាច់ការភ្ជាប់ចេញពីឧបករណ៍ និងកម្មវិធីរុករកផ្សេងៗទាំងអស់ក្រៅពីឧបករណ៍បច្ចុប្បន្ន។" })}
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onRevokeSessions}
                        disabled={revoking}
                        className="min-h-11 w-full shrink-0 rounded-xl bg-teal-600 px-5 font-kantumruy text-sm font-bold text-white transition-all active:scale-95 hover:bg-teal-700 sm:w-auto"
                    >
                        {revoking ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : <Shield size={15} className="mr-2" />}
                        <span>{t("account.security.sessions.button", { defaultValue: "ផ្តាច់ឧបករណ៍ទាំងអស់" })}</span>
                    </Button>
                </div>

                {/* Security Logs */}
                <div className="pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 font-kantumruy">
                                <History size={15} className="text-teal-500" />
                                <span>{t("account.security.logs.title", { defaultValue: "កំណត់ត្រាសុវត្ថិភាព" })}</span>
                            </h4>
                            <p className="text-xs text-muted-foreground font-kantumruy">
                                {t("account.security.logs.subtitle", { defaultValue: "សកម្មភាពថ្មីៗទាក់ទងនឹងគណនីរបស់អ្នក" })}
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={onFetchLogs} 
                            disabled={loadingLogs}
                            className="min-h-11 shrink-0 rounded-xl border-slate-200 px-3 text-sm font-bold dark:border-white/10 font-kantumruy"
                        >
                            <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} /> 
                            <span>{t("account.security.logs.refresh", { defaultValue: "ទាញយកថ្មី" })}</span>
                        </Button>
                    </div>

                    {loadingLogs ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-8 text-sm text-muted-foreground dark:border-white/10" role="status">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>{t("account.security.logs.loading", { defaultValue: "កំពុងទាញយកកំណត់ត្រា..." })}</span>
                        </div>
                    ) : securityLogsError ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 px-4 py-6 text-center dark:border-rose-500/20 dark:bg-rose-500/5" role="alert">
                            <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                            <p className="text-sm text-muted-foreground font-kantumruy">
                                {t("account.security.logs.error", { defaultValue: "មិនអាចទាញយកកំណត់ត្រាសុវត្ថិភាពបានទេ។" })}
                            </p>
                            <Button type="button" variant="outline" onClick={onFetchLogs} className="min-h-11 rounded-xl font-kantumruy font-bold">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {t("account.security.logs.retry", { defaultValue: "សាកល្បងម្ដងទៀត" })}
                            </Button>
                        </div>
                    ) : securityLogs && securityLogs.length > 0 ? (
                        <div className="space-y-2">
                            {securityLogs.map((log: any, i: number) => (
                                <div key={i} className="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 text-xs font-kantumruy dark:border-white/5 dark:bg-black/20 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                                        <span className="truncate font-bold text-foreground">{log.event || log.action || "សកម្មភាពអ្នកប្រើប្រាស់"}</span>
                                        {log.ip && <span className="truncate text-[11px] text-muted-foreground font-mono">{log.ip}</span>}
                                    </div>
                                    <span className="text-muted-foreground text-[11px] shrink-0">
                                        {log.createdAt ? new Date(log.createdAt).toLocaleString('km-KH') : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 rounded-2xl bg-slate-50/50 dark:bg-black/10 border border-dashed border-slate-200 dark:border-white/10">
                            <p className="text-xs text-muted-foreground font-kantumruy">
                                {t("account.security.logs.empty", { defaultValue: "មិនទាន់មានកំណត់ត្រាសកម្មភាពថ្មីៗនៅឡើយទេ" })}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
