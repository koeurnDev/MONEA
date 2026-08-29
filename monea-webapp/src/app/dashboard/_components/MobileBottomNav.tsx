import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from 'react-router-dom';
import { m } from "framer-motion";
import { Home, Users, Palette, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useTranslation } from "@/i18n/LanguageProvider";

interface MobileBottomNavProps {
    onOpenMenu: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const { startLoading } = useLoading();
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    useEffect(() => {
        setPendingHref(null);
    }, [pathname]);

    // Memoize tabs to prevent recreation on every render
    const tabs = useMemo(() => [
        { href: "/dashboard", label: t("dashboard.nav.home", { defaultValue: "ទំព័រដើម" }), icon: Home },
        { href: "/dashboard/guests", label: t("dashboard.nav.guests", { defaultValue: "គ្រប់គ្រងភ្ញៀវ" }), icon: Users },
        { label: t("dashboard.nav.menu", { defaultValue: "ម៉ឺនុយ" }), icon: LayoutGrid, isAction: true },
        { href: "/dashboard/design", label: t("dashboard.nav.design", { defaultValue: "ឌីហ្សាញ" }), icon: Palette },
    ], [t]);

    if (pathname.includes("/dashboard/design")) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 print:hidden">
            <nav className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 shadow-[0_-6px_25px_rgba(0,0,0,0.06)] flex items-center justify-around h-[68px] px-2 pb-[env(safe-area-inset-bottom,4px)]">
                {tabs.map((tab, idx) => {
                    const isActive = !tab.isAction && (pendingHref || pathname) === tab.href;
                    const Icon = tab.icon;

                    if (tab.isAction) {
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={onOpenMenu}
                                aria-label={tab.label}
                                className="flex-1 flex flex-col items-center justify-center gap-1 h-full py-1 group outline-none active:scale-95 transition-transform"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:bg-rose-600 transition-colors">
                                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                                </div>
                                <span className="text-[10px] font-bold font-kantumruy text-muted-foreground group-hover:text-foreground leading-none">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            to={tab.href!}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => {
                                if (!isActive) {
                                    setPendingHref(tab.href!);
                                    startLoading();
                                }
                            }}
                            className={cn(
                                "flex-1 relative flex flex-col items-center justify-center gap-1 h-full py-1 rounded-2xl transition-all duration-150 active:scale-95 outline-none",
                                isActive
                                    ? "text-rose-600 dark:text-rose-400 font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <m.div
                                    layoutId="bottom-nav-active-pill"
                                    className="absolute inset-x-2 inset-y-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-2xl -z-0 border border-rose-200/50 dark:border-rose-500/20"
                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                />
                            )}
                            <Icon
                                className={cn(
                                    "w-5 h-5 relative z-10 transition-transform",
                                    isActive ? "scale-110" : "scale-100"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={cn(
                                "text-[10px] font-bold font-kantumruy relative z-10 leading-none truncate max-w-[80px]",
                                isActive ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                            )}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}