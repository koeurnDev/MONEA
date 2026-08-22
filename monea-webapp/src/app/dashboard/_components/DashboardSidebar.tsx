"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gift, LogOut, Palette, FileText, Clock, Crown, HelpCircle, Settings, Home, UserCog, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useTranslation } from "@/i18n/LanguageProvider";
import { moneaClient } from "@/lib/api-client";

interface DashboardSidebarProps {
    onCloseMobile?: () => void;
    isStaff?: boolean;
    isAdmin?: boolean;
}

const NavLink = memo(({ item, isActive, isPending, onClick, onNavClick }: { item: any, isActive: boolean, isPending?: boolean, onClick?: () => void, onNavClick?: (href: string) => void }) => {
    const isHighlighted = isActive || isPending;
    return (
        <Link
            href={item.href}
            prefetch={true}
            onClick={() => {
                if (onNavClick) onNavClick(item.href);
                if (onClick) {
                    onClick();
                }
            }}
            className={`flex items-center gap-3 w-full px-4 h-10 text-[13px] font-kantumruy font-medium rounded-lg transition-all duration-150 ${isHighlighted
                ? "bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100/50 dark:hover:bg-white/5"
                }`}
        >
            <item.icon className={`h-4 w-4 transition-colors ${isHighlighted ? "text-red-600 dark:text-red-400" : "text-zinc-400 dark:text-zinc-500"}`} />
            <span className="text-left flex-1">{item.label}</span>
            {item.badge && (
                <span className="text-[8px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-md opacity-80">
                    {item.badge}
                </span>
            )}
        </Link>
    );
});

NavLink.displayName = "NavLink";

export const DashboardSidebar = memo(function DashboardSidebar({ onCloseMobile, isStaff = false, isAdmin = false }: DashboardSidebarProps) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const { startLoading } = useLoading();
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        setPendingHref(null);
    }, [pathname]);

    const handleNavClick = useCallback((href: string) => {
        if (href !== pathname) {
            setPendingHref(href);
            startLoading();
        }
    }, [pathname, startLoading]);

    const handleLogout = async () => {
        try {
            await moneaClient.post("/api/auth/logout");
        } catch (e) {
            console.error("Logout API failed", e);
        }
        window.location.href = "/sign-in";
    };

    const mainNav = React.useMemo(() => [
        { href: "/dashboard/gifts", label: t("dashboard.menu.gifts"), icon: Gift, hidden: !isStaff },
        { href: "/dashboard", label: t("dashboard.nav.overview"), icon: Home, hidden: isStaff },
        { href: "/dashboard/guests", label: t("dashboard.menu.guests"), icon: Users, hidden: isStaff },
        { href: "/dashboard/gifts", label: t("dashboard.menu.gifts"), icon: Gift, hidden: isStaff },
    ], [isStaff, t]);

    const weddingNav = React.useMemo(() => [
        { href: "/dashboard/design", label: t("dashboard.user.designSettings"), icon: Palette, hidden: isStaff },
        { href: "/dashboard/schedule", label: t("dashboard.menu.schedule"), icon: Clock, hidden: isStaff },
        { href: "/dashboard/notes", label: t("dashboard.menu.notes"), icon: BookOpen, hidden: isStaff },
        { href: "/dashboard/staff", label: t("dashboard.menu.staff"), icon: UserCog, hidden: isStaff },
    ], [isStaff, t]);

    const adminNav = React.useMemo(() => [
        { href: "/dashboard/reports", label: t("dashboard.menu.reports"), icon: FileText, hidden: isStaff },
        { href: "/dashboard/support", label: t("dashboard.user.helpSupport"), icon: HelpCircle, hidden: isStaff },
        { href: "/dashboard/upgrade", label: t("dashboard.upgrade.cta"), icon: Crown, hidden: isStaff },
    ], [isStaff, t]);

    return (
        <div className="flex flex-col h-full bg-card relative">
            {/* Minimal Decorative Elements (No Blur) */}
            <div className="absolute top-0 -left-20 w-40 h-40 bg-red-600/5 dark:bg-red-500/5 rounded-full pointer-events-none hidden md:block" />

            <div className="p-6 pb-6 flex items-center relative z-10">
                <Link href="/" className="flex items-center gap-4">
                    <MoneaLogo showText size="sm" />
                </Link>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-none relative z-10">
                <div className="space-y-1">
                    {/* Section header removed */}
                    {mainNav.map(item => !item.hidden && (
                        <NavLink key={item.href} item={item} isActive={pathname === item.href} isPending={pendingHref === item.href} onClick={onCloseMobile} onNavClick={handleNavClick} />
                    ))}
                </div>

                {!isStaff && (
                    <div className="space-y-1">
                        {/* Section header removed */}
                        {weddingNav.map(item => !item.hidden && (
                            <NavLink key={item.href} item={item} isActive={pathname === item.href} isPending={pendingHref === item.href} onClick={onCloseMobile} onNavClick={handleNavClick} />
                        ))}
                    </div>
                )}

                {!isStaff && (
                    <div className="space-y-1">
                        {/* Section header removed */}
                        {adminNav.map(item => !item.hidden && (
                            <NavLink key={item.href} item={item} isActive={pathname === item.href} isPending={pendingHref === item.href} onClick={onCloseMobile} onNavClick={handleNavClick} />
                        ))}
                    </div>
                )}
            </nav>

            <div className="p-4 relative">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-accent h-10 rounded-xl transition-all"
                    onClick={() => setIsLogoutModalOpen(true)}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider font-kantumruy">{t("common.auth.logout")}</span>
                </Button>
            </div>

            <ConfirmModal
                open={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title={t("dashboard.logout.confirmTitle")}
                description={t("dashboard.logout.confirmDescription")}
                confirmLabel={t("common.actions.logout")}
                cancelLabel={t("common.actions.cancel")}
                variant="danger"
            />
        </div>
    );
});
