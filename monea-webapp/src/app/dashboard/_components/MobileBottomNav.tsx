import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from 'react-router-dom';
import { m } from "framer-motion";
import { Home, Users, Palette, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";

interface MobileBottomNavProps {
    onOpenMenu?: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const { startLoading } = useLoading();
    const { user } = useAuth();
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const canAccessWeddingFeatures = !!user?.weddingId;

    useEffect(() => {
        setPendingHref(null);
    }, [pathname]);

    // Mobile-first navigation should stay short and obvious for phones.
    // Keep the core wedding flow accessible without crowding the screen.
    const tabs = useMemo(() => [
        { href: "/dashboard", label: t("dashboard.nav.home", { defaultValue: "ទំព័រដើម" }), icon: Home },
        { href: canAccessWeddingFeatures ? "/dashboard/design" : "/dashboard/create", label: t("dashboard.nav.designShort", { defaultValue: "ធៀប" }), icon: Palette, disabled: !canAccessWeddingFeatures },
        { href: canAccessWeddingFeatures ? "/dashboard/guests" : "/dashboard/create", label: t("dashboard.nav.guestsShort", { defaultValue: "ភ្ញៀវ" }), icon: Users, disabled: !canAccessWeddingFeatures },
        { href: "/dashboard/account", label: t("dashboard.nav.settingsShort", { defaultValue: "កំណត់" }), icon: UserCog },
    ], [canAccessWeddingFeatures, t]);

    const navigation = (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] print:hidden px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pointer-events-auto">
            <nav className="mx-auto flex min-h-[64px] w-full max-w-md items-center justify-between gap-2 rounded-[1.4rem] border border-slate-200/80 bg-white/92 px-2 py-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90 touch-manipulation">
                {tabs.map((tab, idx) => {
                    // Prefix match keeps the tab lit on nested routes
                    // (e.g. /dashboard/gifts/live still highlights "Gifts").
                    const current = pendingHref || pathname;
                    const isActive = !!tab.href && (
                        current === tab.href ||
                        (tab.href !== "/dashboard" && current.startsWith(`${tab.href}/`))
                    );
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={idx}
                            to={tab.disabled ? "/dashboard/create" : tab.href!}
                            aria-current={isActive ? "page" : undefined}
                            onClick={(event) => {
                                if (tab.disabled) {
                                    event.preventDefault();
                                    return;
                                }
                                if (!isActive) {
                                    setPendingHref(tab.href!);
                                    startLoading();
                                }
                            }}
                            className={cn(
                                "flex-1 relative flex min-h-[52px] flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-2 transition-all duration-150 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-teal-600/60 touch-manipulation",
                                tab.disabled
                                    ? "pointer-events-none cursor-not-allowed opacity-50 text-muted-foreground"
                                    : isActive
                                        ? "text-teal-800 dark:text-teal-300 font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <m.div
                                    layoutId="bottom-nav-active-pill"
                                    className="absolute inset-x-1 inset-y-1 rounded-2xl border border-teal-200/60 bg-teal-50/90 dark:border-teal-500/20 dark:bg-teal-500/10"
                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                />
                            )}
                            <Icon
                                className={cn(
                                    "relative z-10 h-5 w-5 transition-transform",
                                    isActive ? "scale-110" : "scale-100"
                                )}
                                strokeWidth={isActive ? 2.4 : 2}
                            />
                            <span className={cn(
                                "relative z-10 text-xs font-black font-kantumruy leading-tight",
                                isActive ? "text-teal-800 dark:text-teal-300" : "text-muted-foreground"
                            )}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    return typeof document === "undefined" ? null : createPortal(navigation, document.body);
}