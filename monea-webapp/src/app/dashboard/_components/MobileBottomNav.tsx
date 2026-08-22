"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { usePathname } from "next/navigation";
import { Home, Users, Clock, LayoutGrid, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useTranslation } from "@/i18n/LanguageProvider";

interface MobileBottomNavProps {
    onOpenMenu: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { startLoading } = useLoading();
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    useEffect(() => {
        setPendingHref(null);
    }, [pathname]);

    const tabs = [
        { href: "/dashboard", label: t("dashboard.nav.home"), icon: Home },
        { href: "/dashboard/guests", label: t("dashboard.nav.guests"), icon: Users },
        { href: "menu", label: t("dashboard.nav.menu"), icon: LayoutGrid, isAction: true },
        { href: "/dashboard/gifts", label: t("dashboard.nav.gifts"), icon: Gift },
        { href: "/dashboard/schedule", label: t("dashboard.nav.schedule"), icon: Clock },
    ];

    if (pathname.includes("/dashboard/design")) return null;

    return (
        <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 print:hidden">
            <div className="bg-white/90 dark:bg-zinc-900/95 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center h-[58px] px-1 rounded-2xl overflow-hidden">
                {tabs.map((tab, idx) => {
                    const isActive = (pendingHref || pathname) === tab.href;
                    const Icon = tab.icon;

                    if (tab.isAction) {
                        return (
                            <div key={idx} className="flex-1 flex justify-center items-center h-full">
                                <button
                                    onClick={onOpenMenu}
                                    className="flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-150 active:scale-90"
                                >
                                    <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[8px] font-bold uppercase font-kantumruy text-zinc-400 dark:text-zinc-500 leading-none">
                                        {tab.label}
                                    </span>
                                </button>
                            </div>
                        );
                    }

                    return (
                        <div key={idx} className="flex-1 flex justify-center items-center h-full">
                            <Link
                                href={tab.href}
                                prefetch={true}
                                onClick={() => {
                                    if (!isActive) {
                                        setPendingHref(tab.href);
                                        startLoading();
                                    }
                                }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1 w-full h-full mx-0.5 rounded-xl transition-colors duration-150 active:scale-90",
                                    isActive
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-zinc-400 dark:text-zinc-500"
                                )}
                            >
                                {isActive && (
                                    <m.div
                                        layoutId="bottom-nav-pill"
                                        className="absolute inset-0 bg-red-500/10 dark:bg-red-500/15 rounded-xl"
                                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                    />
                                )}
                                <Icon
                                    className={cn(
                                        "w-5 h-5 relative z-10 transition-transform duration-150",
                                        isActive ? "scale-110" : "scale-100"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className={cn(
                                    "text-[8px] font-bold uppercase font-kantumruy relative z-10 leading-none",
                                    isActive ? "opacity-100" : "opacity-50"
                                )}>
                                    {tab.label}
                                </span>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
