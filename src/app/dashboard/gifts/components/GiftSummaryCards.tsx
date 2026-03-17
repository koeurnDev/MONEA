"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

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
    if (userRole === "staff") return null;

    const stats = [
        { label: "ភ្ញៀវសរុប", value: totalGuests, sub: "នាក់", color: "text-foreground", icon: Users },
        { label: "សាច់ប្រាក់ $", value: showGiftAmounts ? "$" + totalUSD.toLocaleString() : "******", sub: "USD", color: "text-amber-600 dark:text-amber-400", icon: DollarSign },
        { label: "សាច់ប្រាក់ ៛", value: showGiftAmounts ? totalKHR.toLocaleString() + " ៛" : "******", sub: "KHR", color: "text-slate-600 dark:text-slate-400", icon: Gift },
    ];

    return (
        <div className="grid gap-2 grid-cols-3 print:hidden">
            {stats.map((stat, i) => (
                <Card key={i} className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all rounded-2xl overflow-hidden group bg-card print:shadow-none print:bg-white print:border-gray-100">
                    <CardContent className="p-3 md:p-6 text-center">
                        <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                            <stat.icon size={10} className="opacity-30" />
                            {stat.label}
                        </p>
                        <div className={cn("text-sm md:text-2xl font-black font-kantumruy mb-1", stat.color)}>
                            {loading ? "..." : stat.value}
                        </div>
                        <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">{stat.sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
