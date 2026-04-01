"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, KeyRound } from "lucide-react";

import { useTranslation } from "@/i18n/LanguageProvider";

interface ProfileTabProps {
    user: any;
    onShowChangePassword: () => void;
}

export function ProfileTab({ user, onShowChangePassword }: ProfileTabProps) {
    const { t } = useTranslation();

    return (
        <Card className="bg-card/40 backdrop-blur-2xl border-none shadow-[0_8px_60px_rgba(0,0,0,0.06)] dark:shadow-none rounded-[3rem] overflow-hidden p-1">
            <CardHeader className="p-10 pb-6">
                <CardTitle className="text-2xl font-black text-foreground font-kantumruy tracking-tight">{t("account.profile.title")}</CardTitle>
                <CardDescription className="font-kantumruy text-sm mt-1.5 opacity-60 leading-relaxed max-w-xl">
                    {t("account.profile.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-6 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">{t("account.profile.labels.username")}</Label>
                        <div className="h-16 bg-muted/30 border border-border/5 rounded-[1.5rem] px-6 flex items-center font-black text-foreground font-kantumruy shadow-sm">
                            {user?.name || "..."}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">{t("account.profile.labels.email")}</Label>
                        <div className="h-16 bg-muted/30 border border-border/5 rounded-[1.5rem] px-6 flex items-center font-black text-foreground gap-4 shadow-sm">
                            <Mail size={18} className="text-primary/40 shrink-0" />
                            <span className="truncate">{user?.email || "..."}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border/10">
                    <div className="flex items-center gap-4 p-6 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-500/10">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
                            <KeyRound size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black font-kantumruy">{t("account.profile.changePassword.title")}</p>
                            <p className="text-[11px] text-muted-foreground font-kantumruy mt-1 opacity-70">{t("account.profile.changePassword.description")}</p>
                        </div>
                        <Button
                            className="rounded-[1.2rem] font-bold font-kantumruy text-[10px] uppercase tracking-widest px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                            onClick={onShowChangePassword}
                        >
                            {t("account.profile.changePassword.button")}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
