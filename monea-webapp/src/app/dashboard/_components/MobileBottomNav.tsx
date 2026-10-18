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
    isCustomer?: boolean;
}

export default function MobileBottomNav({ onOpenMenu, isCustomer = false }: MobileBottomNavProps) {
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
        <div className={cn("md:hidden fixed bottom-0 left-0 right-0 z-40 print:hidden px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pointer-events-auto", isCustomer && "monea-customer-dashboard")}>
            <nav className="mx-auto flex min-h-[64px] w-full max-w-md items-center justify-between gap-2 rounded-[1.4rem] border border-border bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur-2xl touch-manipulation">
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
                                    startLoading();
                                    return;
                                }
                                if (!isActive) {
                                    setPendingHref(tab.href!);
                                    startLoading();
                                }
                            }}
                            className={cn(
                                "flex-1 relative flex min-h-[52px] flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-2 transition-all duration-150 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 touch-manipulation",
                                tab.disabled
                                    ? "cursor-pointer opacity-60 text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300"
                                    : isActive
                                        ? "text-primary font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <m.div
                                    layoutId="bottom-nav-active-pill"
                                    className="absolute inset-x-1 inset-y-1 rounded-2xl border border-primary/20 bg-accent"
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
                                isActive ? "text-primary" : "text-muted-foreground"
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