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
    revoking,
    onFetchLogs,
    onRevokeSessions,
    onShow2FASetup,
    onShowDisable2FA
}: SecurityTabProps) {
    const { t } = useTranslation();

    return (
        <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden font-kantumruy">
            <CardHeader className="p-6 sm:p-8 pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-kantumruy flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/10 rounded-2xl">
                        <Lock size={22} className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <span>{t("account.security.title", { defaultValue: "ការកំណត់សុវត្ថិភាព" })}</span>
                </CardTitle>
                <CardDescription className="font-kantumruy text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {t("account.security.description", { defaultValue: "រក្សាគណនីរបស់អ្នកឱ្យមានសុវត្ថិភាពជាមួយ 2FA និងការគ្រប់គ្រងឧបករណ៍។" })}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
                {/* 2FA Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200/80 dark:border-white/10 gap-6">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                            <Label className="text-base font-bold text-foreground font-kantumruy">
                                {t("account.security.twoFactor.title", { defaultValue: "ការផ្ទៀងផ្ទាត់២ដំណាក់ (2FA)" })}
                            </Label>
                            {user?.twoFactorEnabled ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 h-6 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    <CheckCircle2 size={12} className="mr-1" />
                                    {t("account.security.twoFactor.active", { defaultValue: "កំពុងប្រើ" })}
                                </Badge>
                            ) : (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 h-6 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    <AlertCircle size={12} className="mr-1" />
                                    {t("account.security.twoFactor.inactive", { defaultValue: "មិនទាន់បើក" })}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed max-w-xl">
                            {t("account.security.twoFactor.description", { defaultValue: "បន្ថែមស្រទាប់សុវត្ថិភាពមួយកម្រិតទៀតទៅគណនីរបស់អ្នក ដោយទាមទារកូដពី Authenticator App។" })}
                        </p>
                    </div>
                    <div className="shrink-0">
                        {user?.twoFactorEnabled ? (
                            <Button
                                onClick={onShowDisable2FA}
                                variant="outline"
                                className="border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl font-bold font-kantumruy text-xs flex items-center gap-2 px-6 h-10 transition-all active:scale-95 w-full sm:w-auto"
                            >
                                <ShieldOff size={15} /> 
                                <span>{t("account.security.twoFactor.disable", { defaultValue: "បិទការផ្ទៀងផ្ទាត់" })}</span>
                            </Button>
                        ) : (
                            <Button
                                onClick={onShow2FASetup}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold font-kantumruy text-xs flex items-center gap-2 px-6 h-10 shadow-md shadow-rose-600/20 transition-all active:scale-95 w-full sm:w-auto"
                            >
                                <Shield size={15} /> 
                                <span>{t("account.security.twoFactor.enable", { defaultValue: "បើកប្រើប្រាស់ 2FA" })}</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-2xl bg-rose-500/[0.03] border border-rose-500/10 gap-6">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400">
                                <LogOut size={16} />
                            </div>
                            <Label className="text-base font-bold text-foreground font-kantumruy">
                                {t("account.security.sessions.title", { defaultValue: "ឧបករណ៍ដែលកំពុងសកម្ម (Active Sessions)" })}
                            </Label>
                        </div>
                        <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed max-w-xl">
                            {t("account.security.sessions.description", { defaultValue: "ផ្តាច់ការភ្ជាប់ចេញពីឧបករណ៍ និងកម្មវិធីរុករកផ្សេងៗទាំងអស់ក្រៅពីឧបករណ៍បច្ចុប្បន្ន។" })}
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onRevokeSessions}
                        disabled={revoking}
                        className="rounded-xl font-bold font-kantumruy text-xs bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all active:scale-95 px-6 h-10 shrink-0 w-full sm:w-auto"
                    >
                        {revoking ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : <Shield size={15} className="mr-2" />}
                        <span>{t("account.security.sessions.button", { defaultValue: "ផ្តាច់ឧបករណ៍ទាំងអស់" })}</span>
                    </Button>
                </div>

                {/* Security Logs */}
                <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 font-kantumruy">
                                <History size={15} className="text-rose-500" /> 
                                <span>{t("account.security.logs.title", { defaultValue: "កំណត់ត្រាសុវត្ថិភាព" })}</span>
                            </h4>
                            <p className="text-xs text-muted-foreground font-kantumruy">
                                {t("account.security.logs.subtitle", { defaultValue: "សកម្មភាពថ្មីៗទាក់ទងនឹងគណនីរបស់អ្នក" })}
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onFetchLogs} 
                            className="h-8 px-3 rounded-lg text-xs font-bold border-slate-200 dark:border-white/10 hover:bg-slate-50 gap-1.5 font-kantumruy"
                        >
                            <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} /> 
                            <span>{t("account.security.logs.refresh", { defaultValue: "ទាញយកថ្មី" })}</span>
                        </Button>
                    </div>

                    {securityLogs && securityLogs.length > 0 ? (
                        <div className="space-y-2">
                            {securityLogs.map((log: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 text-xs font-kantumruy">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                        <span className="font-bold text-foreground">{log.action || "User Activity"}</span>
                                        <span className="text-muted-foreground text-[11px] font-mono">{log.ip || ""}</span>
                                    </div>
                                    <span className="text-muted-foreground text-[11px]">
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
