"use client";

import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";
import { Home, Users, Clock, Menu, Gift } from "lucide-react";
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

    const tabs = [
        { href: "/dashboard", label: t("dashboard.nav.home"), icon: Home },
        { href: "/dashboard/guests", label: t("dashboard.nav.guests"), icon: Users },
        { href: "menu", label: t("dashboard.nav.menu"), icon: Menu, isAction: true },
        { href: "/dashboard/gifts", label: t("dashboard.nav.gifts"), icon: Gift },
        { href: "/dashboard/schedule", label: t("dashboard.nav.schedule"), icon: Clock },
    ];

    const activeIndex = tabs.findIndex(tab => pathname === tab.href);
    // Default to center (Menu) if no active path found (e.g. for actions)
    const normalizedIndex = activeIndex === -1 ? 2 : activeIndex;

    if (pathname.includes("/dashboard/design")) return null;

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 print:hidden pointer-events-none">
            {/* Nav Container - Floating shadow-only style */}
            <div className="bg-white dark:bg-zinc-950 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center h-14 px-2 rounded-2xl pointer-events-auto border border-black/[0.03] dark:border-white/[0.05] accelerate-gpu">
                {tabs.map((tab, idx) => {
                    const isActive = pathname === tab.href || (tab.isAction && activeIndex === -1);

                    return (
                        <div key={idx} className="flex-1 flex justify-center items-center h-full">
                            <Link
                                href={tab.isAction ? "#" : tab.href}
                                onClick={(e) => {
                                    if (tab.isAction) {
                                        e.preventDefault();
                                        onOpenMenu();
                                    } else if (!isActive) {
                                        startLoading();
                                    }
                                }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1.5 px-3 h-full transition-all duration-300 w-full max-w-[84px]",
                                    isActive
                                        ? "text-red-600 dark:text-red-400 font-bold"
                                        : "text-muted-foreground/60"
                                )}
                            >
                                <div className="relative flex flex-col items-center">
                                    <tab.icon 
                                        className={cn(
                                            "w-5 h-5 transition-all duration-300", 
                                            isActive ? "scale-110" : "opacity-70 group-hover:opacity-100"
                                        )} 
                                        strokeWidth={isActive ? 2.5 : 2} 
                                    />
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-[0.15em] font-kantumruy transition-all mt-1 text-center truncate w-full",
                                        isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-0.5"
                                    )}>
                                        {tab.label}
                                    </span>
                                </div>
                                {isActive && (
                                    <m.div 
                                        layoutId="bottom-nav-active"
                                        className="absolute inset-0 bg-red-500/5 dark:bg-red-500/10 rounded-2xl -z-10"
                                    />
                                )}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
