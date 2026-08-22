"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Shield, ShieldOff, LogOut, RefreshCw, History, CheckCircle2, AlertCircle, MapPin, Monitor, Smartphone } from "lucide-react";

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
        <Card className="bg-card/40 backdrop-blur-2xl border-none shadow-[0_8px_60px_rgba(0,0,0,0.06)] dark:shadow-none rounded-[3rem] overflow-hidden p-1">
            <CardHeader className="p-10 pb-6 text-center md:text-left">
                <CardTitle className="text-2xl font-black text-foreground font-kantumruy flex items-center gap-3 justify-center md:justify-start">
                    <div className="p-2.5 bg-red-500/10 rounded-xl">
                        <Lock size={24} className="text-red-600" />
                    </div>
                    {t("account.security.title")}
                </CardTitle>
                <CardDescription className="font-kantumruy text-sm mt-2 opacity-60 leading-relaxed max-w-xl">
                    {t("account.security.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-6 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2rem] bg-muted/30 border border-border/5 gap-8">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                            <Label className="text-lg font-black text-foreground font-kantumruy">{t("account.security.twoFactor.title")}</Label>
                            {user?.twoFactorEnabled && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 h-6 text-[10px] font-black uppercase tracking-wider rounded-full">
                                    {t("account.security.twoFactor.active")}
                                </Badge>
                            )}
                        </div>
                        <p className="text-[13px] text-muted-foreground font-kantumruy mt-1 opacity-70 leading-relaxed max-w-xl">
                            {t("account.security.twoFactor.description")}
                        </p>
                    </div>
                    <div className="shrink-0">
                        {user?.twoFactorEnabled ? (
                            <Button
                                onClick={onShowDisable2FA}
                                className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-white rounded-[1.2rem] font-bold font-kantumruy text-xs flex items-center gap-3 px-8 h-12 shadow-xl transition-all active:scale-95"
                            >
                                <ShieldOff size={16} /> {t("account.security.twoFactor.disable")}
                            </Button>
                        ) : (
                            <Button
                                onClick={onShow2FASetup}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-[1.2rem] font-black font-kantumruy text-xs uppercase tracking-widest flex items-center gap-3 px-8 h-12 shadow-xl shadow-red-600/20 transition-all active:scale-95 border-none"
                            >
                                <Shield size={16} /> {t("account.security.twoFactor.enable")}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2rem] bg-red-500/[0.03] border border-red-500/10 gap-8">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                    <LogOut size={20} />
                                </div>
                                <Label className="text-lg font-black text-foreground font-kantumruy">{t("account.security.sessions.title")}</Label>
                            </div>
                            <p className="text-[13px] text-muted-foreground font-kantumruy mt-2 opacity-70 leading-relaxed max-w-xl">
                                {t("account.security.sessions.description")}
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={onRevokeSessions}
                            disabled={revoking}
                            className="rounded-[1.2rem] font-black font-kantumruy text-xs uppercase tracking-widest bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all active:scale-95 border-none px-8 h-12 shrink-0 group"
                        >
                            {revoking ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <Shield size={16} className="mr-3 group-hover:rotate-12 transition-transform" />}
                            {t("account.security.sessions.button")}
                        </Button>
                    </div>
                </div>

                <div className="pt-10 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                                <History size={16} className="text-primary/50" /> {t("account.security.logs.title")}
                            </h4>
                            <p className="text-[11px] font-medium text-muted-foreground opacity-50 font-kantumruy">{t("account.security.logs.subtitle")}</p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onFetchLogs} 
                            className="h-9 px-4 rounded-xl text-[10px] font-black border-border/10 bg-muted/20 hover:bg-muted/30 uppercase tracking-widest gap-2"
                        >
                            <RefreshCw size={12} className={`${loadingLogs ? 'animate-spin' : ''}`} /> {t("account.security.logs.refresh")}
                        </Button>
                    </div>

                    <div className="rounded-[2rem] overflow-hidden border border-border/5 bg-muted/[0.15] backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/20">
                                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("account.security.logs.table.event")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("account.security.logs.table.location")}</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">{t("account.security.logs.table.time")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/5">
                                    {loadingLogs ? (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-20 text-center text-sm text-muted-foreground font-kantumruy font-black opacity-40 uppercase tracking-widest">{t("account.security.logs.loading")}</td>
                                        </tr>
                                    ) : securityLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-20 text-center text-sm text-muted-foreground font-kantumruy font-black opacity-30 uppercase tracking-widest">{t("account.security.logs.empty")}</td>
                                        </tr>
                                    ) : securityLogs.slice(0, 5).map((log) => (
                                        <tr key={log.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2.5 rounded-xl ${log.event === 'LOGIN_SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                                        {log.event === 'LOGIN_SUCCESS' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[13px] font-black text-foreground font-kantumruy tracking-tight">
                                                            {log.event === 'LOGIN_SUCCESS' ? t("account.security.logs.events.login_success") : t("account.security.logs.events.login_failed")}
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{log.event}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground/70">
                                                            <MapPin size={12} className="text-primary/40" /> {log.geoIp || "Phnom Penh, Cambodia"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground/70">
                                                            <Monitor size={12} className="text-primary/40" /> {log.ip}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="text-[13px] font-black text-foreground tabular-nums">{new Date(log.createdAt).toLocaleTimeString(t("common.constants.locale") === 'km-KH' ? 'km-KH' : 'en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Phnom_Penh' })}</div>
                                                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">{new Date(log.createdAt).toLocaleDateString(t("common.constants.locale") === 'km-KH' ? 'km-KH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Phnom_Penh' })}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-orange-500/[0.03] border border-orange-500/10 shadow-sm">
                        <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                            <Smartphone size={18} className="text-orange-500" />
                        </div>
                        <p className="text-[11px] text-orange-700/80 font-black font-kantumruy italic uppercase tracking-wider leading-relaxed">
                            {t("account.security.logs.note")}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
