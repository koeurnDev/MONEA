"use client";

import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";

interface OfflineSyncBannerProps {
    count: number;
    isSyncing: boolean;
    onSync: () => void;
    onClear: () => void;
}

export function OfflineSyncBanner({ count, isSyncing, onSync, onClear }: OfflineSyncBannerProps) {
    const { t } = useTranslation();
    if (count === 0) return null;

    return (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 rounded-[1.5rem] p-6 flex justify-between items-center shadow-lg shadow-orange-500/5 dark:shadow-none" role="alert">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                    <Activity size={20} className="animate-pulse" />
                </div>
                <div>
                    <p className="font-black text-foreground font-kantumruy">{t("gifts.sync.offlineData")}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("gifts.sync.pendingGifts", { count })}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <Button
                    onClick={onClear}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-bold font-kantumruy"
                >
                    {t("gifts.sync.clear")}
                </Button>
                <Button
                    onClick={onSync}
                    disabled={isSyncing}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-rose-100 dark:shadow-none font-kantumruy"
                >
                    {isSyncing ? t("gifts.sync.syncing") : t("gifts.sync.syncNow")}
                </Button>
            </div>
        </div>
    );
}
