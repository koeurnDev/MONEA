"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

interface GiftSummaryCardsProps {
    totalGuests: number;
    totalUSD: number;
    totalKHR: number;
    loading?: boolean;
    userRole?: string | null;
    showGiftAmounts?: boolean;
}

export function GiftSummaryCards({
    totalGuests,
    totalUSD,
    totalKHR,
    loading,
    userRole,
    showGiftAmounts = true
}: GiftSummaryCardsProps) {
    const { t } = useTranslation();
    if (userRole === "staff") return null;

    const stats = [
        { label: t("gifts.totalGuests"), value: totalGuests, sub: t("gifts.personUnit"), color: "text-foreground", icon: Users },
        { label: t("gifts.cashUSD"), value: showGiftAmounts ? "$" + totalUSD.toLocaleString() : "******", sub: "USD", color: "text-amber-600 dark:text-amber-400", icon: DollarSign },
        { label: t("gifts.cashKHR"), value: showGiftAmounts ? totalKHR.toLocaleString() + " ៛" : "******", sub: "KHR", color: "text-slate-600 dark:text-slate-400", icon: Gift },
    ];

    return (
        <div className="grid gap-3 grid-cols-3 print:hidden">
            {stats.map((stat, i) => (
                <Card key={i} className="border-none shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all rounded-3xl overflow-hidden group bg-card print:shadow-none print:bg-white print:border-gray-100">
                    <CardContent className="p-4 md:p-6 text-center">
                        <p className="text-[9px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-1.5">
                            <stat.icon size={11} className="opacity-50" />
                            {stat.label}
                        </p>
                        <div className={cn("text-xl md:text-2xl font-black font-kantumruy mb-1.5 tracking-tight", stat.color)}>
                            {loading ? "..." : stat.value}
                        </div>
                        <p className="text-[10px] md:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.15em] font-kantumruy">{stat.sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
