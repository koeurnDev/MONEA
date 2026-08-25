import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gift, LogOut, Palette, FileText, Clock, Crown, HelpCircle, Settings, Home, UserCog, BookOpen, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useAuth } from "@/hooks/useAuth";
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
            to={item.href}
            onClick={() => {
                if (onNavClick) onNavClick(item.href);
                if (onClick) {
                    onClick();
                }
            }}
            className={`flex items-center gap-3 w-full px-4 h-10 text-[13px] font-kantumruy font-medium rounded-lg transition-all duration-150 ${isHighlighted
                ? "bg-primary/10 text-primary font-bold shadow-sm"
                : "text-zinc-700 dark:text-zinc-300 hover:text-primary hover:bg-zinc-100/50 dark:hover:bg-white/5"
                }`}
        >
            <item.icon className={`h-4 w-4 transition-colors ${isHighlighted ? "text-primary" : "text-zinc-400 dark:text-zinc-500"}`} />
            <span className="text-left flex-1">{item.label}</span>
            {item.badge && (
                <span className="text-[8px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md opacity-80">
                    {item.badge}
                </span>
            )}
        </Link>
    );
});

NavLink.displayName = "NavLink";

export const DashboardSidebar = memo(function DashboardSidebar({ onCloseMobile, isStaff = false, isAdmin = false }: DashboardSidebarProps) {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const router = useNavigate();
    const { startLoading } = useLoading();
    const { user, logout } = useAuth();
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const isSuperAdmin = isAdmin || user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'PLATFORM_OWNER';

    useEffect(() => {
        setPendingHref(null);
    }, [pathname]);

    const handleNavClick = useCallback((href: string) => {
        if (pathname !== href) {
            setPendingHref(href);
            startLoading();
        }
    }, [pathname, startLoading]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error("Logout API failed", e);
            window.location.href = "/sign-in";
        }
    };

    const mainNav = React.useMemo(() => [
        { href: "/dashboard", label: t("dashboard.nav.overview", { defaultValue: "ទំព័រដើម" }), icon: Home, hidden: isStaff },
        { href: "/dashboard/guests", label: t("dashboard.nav.guests", { defaultValue: "ភ្ញៀវ" }), icon: Users, hidden: isStaff },
    ], [isStaff, t]);

    const weddingNav = React.useMemo(() => [
        { href: "/dashboard/design", label: t("dashboard.user.designSettings", { defaultValue: "ការកំណត់រចនា" }), icon: Palette, hidden: isStaff },
        { href: "/dashboard/schedule", label: t("dashboard.nav.schedule", { defaultValue: "កម្មវិធី" }), icon: Clock, hidden: isStaff },
    ], [isStaff, t]);

    const adminNav = React.useMemo(() => [
        { href: "/dashboard/account", label: t("account.title", { defaultValue: "ការកំណត់គណនី" }), icon: UserCog, hidden: isStaff },
        { href: "/dashboard/support", label: t("dashboard.user.helpSupport"), icon: HelpCircle, hidden: isStaff },
        { href: "/dashboard/upgrade", label: t("dashboard.upgrade.cta"), icon: Crown, hidden: isStaff },
        ...(isSuperAdmin ? [{ 
            href: "/admin/master", 
            label: "Super Admin Portal", 
            icon: ShieldCheck, 
            badge: "ADMIN" 
        }] : []),
    ], [isStaff, isSuperAdmin, t]);

    return (
        <div className="flex flex-col h-full bg-card relative">
            {/* Minimal Decorative Elements (No Blur) */}
            <div className="absolute top-0 -left-20 w-40 h-40 bg-primary/5 rounded-full pointer-events-none hidden md:block" />

            <div className="p-6 pb-6 flex items-center relative z-10">
                <Link to="/" className="flex items-center gap-4">
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
                variant="logout"
            />
        </div>
    );
});

