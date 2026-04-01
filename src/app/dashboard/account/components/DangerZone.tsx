"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface DangerZoneProps {
    onShowDeleteAccount: () => void;
}

export function DangerZone({ onShowDeleteAccount }: DangerZoneProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-none bg-red-500/[0.03] shadow-[0_8px_60px_rgba(239,68,68,0.05)] dark:shadow-none rounded-[3rem] overflow-hidden p-1 mt-10">
            <CardHeader className="p-10 pb-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-[10px] font-black tracking-[0.3em] uppercase mb-4 w-fit">
                    <AlertTriangle size={14} /> {t("account.dangerZone.badge")}
                </div>
                <CardTitle className="text-2xl font-black text-foreground font-kantumruy tracking-tight">{t("account.dangerZone.title")}</CardTitle>
                <CardDescription className="font-kantumruy text-sm mt-2 opacity-60 leading-relaxed max-w-xl">
                    {t("account.dangerZone.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 bg-white dark:bg-red-950/10 rounded-[2.5rem] border border-red-500/10 shadow-sm group hover:border-red-500/20 transition-all">
                    <div className="space-y-2">
                        <p className="text-lg font-black font-kantumruy text-red-600 flex items-center gap-3">
                            <Trash2 size={20} /> {t("account.dangerZone.deleteTitle")}
                        </p>
                        <p className="text-[13px] text-muted-foreground font-kantumruy opacity-70 leading-relaxed max-w-md italic">
                            {t("account.dangerZone.deleteDescription")}
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onShowDeleteAccount}
                        className="rounded-[1.2rem] font-black font-kantumruy text-xs uppercase tracking-widest px-8 h-12 bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all active:scale-95 border-none group-hover:scale-[1.02]"
                    >
                        {t("account.dangerZone.button")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
