import React, { useState, useEffect, memo, useCallback } from "react";
import { Link, useLocation } from 'react-router-dom';
import { 
    LogOut, Palette, HelpCircle, Home, UserCog, Users,
    Crown, ShieldCheck, LucideIcon,
    PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/LanguageProvider";

interface DashboardSidebarProps {
    onCloseMobile?: () => void;
    isStaff?: boolean;
    isAdmin?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
    disabled?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const NavLink = memo(({ item, isActive, isPending, onClick, onNavClick, collapsed }: { item: NavItem, isActive: boolean, isPending?: boolean, onClick?: () => void, onNavClick?: (href: string) => void, collapsed?: boolean }) => {
    const isHighlighted = isActive || isPending;
    return (
        <Link
            to={item.disabled ? "/dashboard/create" : item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => {
                if (item.disabled) {
                    event.preventDefault();
                    return;
                }
                if (onNavClick) onNavClick(item.href);
                if (onClick) {
                    onClick();
                }
            }}
            title={collapsed ? item.label : undefined}
            className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3.5"} w-full h-11 md:h-10 text-xs font-kantumruy font-bold rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-teal-600/60 focus-visible:ring-offset-1 focus-visible:ring-offset-card ${item.disabled
                ? "pointer-events-none cursor-not-allowed opacity-50 text-zinc-400 dark:text-zinc-500"
                : isHighlighted
                    ? "bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 font-bold shadow-xs border border-teal-200/50 dark:border-teal-500/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-teal-800 hover:bg-slate-100/60 dark:hover:bg-white/5"
                }`}
        >
            <item.icon className={`h-4 w-4 transition-colors shrink-0 ${item.disabled ? "text-zinc-400 dark:text-zinc-500" : isHighlighted ? "text-teal-800 dark:text-teal-300" : "text-zinc-400 dark:text-zinc-500"}`} />
            {!collapsed && <span className="text-left flex-1 truncate">{item.label}</span>}
            {item.badge && !collapsed && (
                <span className="text-[9px] font-black bg-teal-700 text-white px-1.5 py-0.5 rounded-md opacity-90">
                    {item.badge}
                </span>
            )}
        </Link>
    );
});

NavLink.displayName = "NavLink";

export const DashboardSidebar = memo(function DashboardSidebar({ onCloseMobile, isStaff = false, isAdmin = false, collapsed = false, onToggleCollapse }: DashboardSidebarProps) {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const { startLoading } = useLoading();
    const { user, logout } = useAuth();
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const isSuperAdmin = isAdmin && (
        user?.role === 'SUPERADMIN' ||
        user?.role === 'PLATFORM_OWNER'
    );
    const canAccessWeddingFeatures = !!user?.weddingId;

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

    /**
     * Highlight the parent entry on nested routes as well, e.g. /dashboard/gifts/live
     * keeps "Gifts" lit (the previous exact-match check left users without any
     * active indicator on sub-pages, so they lost track of where they were).
     */
    const isActiveRoute = useCallback((href: string) => {
        if (pathname === href) return true;
        return href !== "/dashboard" && pathname.startsWith(`${href}/`);
    }, [pathname]);

    /** Keep the supported dashboard routes reachable from desktop and mobile menus. */
    const sections = React.useMemo<NavSection[]>(() => {
        const guests: NavItem = { href: "/dashboard/guests", label: t("dashboard.nav.guests", { defaultValue: "គ្រប់គ្រងភ្ញៀវ" }), icon: Users };
        const account: NavItem = { href: "/dashboard/account", label: t("dashboard.nav.account", { defaultValue: "គណនី និងប្រវត្តិរូប" }), icon: UserCog };
        const support: NavItem = { href: "/dashboard/support", label: t("dashboard.nav.support", { defaultValue: "ជំនួយ និងការគាំទ្រ" }), icon: HelpCircle };

        if (isStaff) {
            return [
                {
                    title: t("dashboard.menu.others", { defaultValue: "ផ្សេងៗ" }),
                    items: [account, support],
                },
            ];
        }

        const adminPortal: NavItem[] = isSuperAdmin
            ? [{
                href: "/admin/master",
                label: user?.name?.trim() || user?.email?.split("@")[0] || "Super Admin Portal",
                icon: ShieldCheck,
                badge: "ADMIN"
            }]
            : [];

        return [
            {
                title: t("dashboard.menu.invitation", { defaultValue: "ធៀបការឌីជីថល" }),
                items: [
                    { href: "/dashboard", label: t("dashboard.nav.overview", { defaultValue: "ទំព័រដើម" }), icon: Home },
                    { href: "/dashboard/design", label: t("dashboard.user.designSettings", { defaultValue: "រចនាធៀបការ" }), icon: Palette, disabled: !canAccessWeddingFeatures },
                    { ...guests, disabled: !canAccessWeddingFeatures },
                ],
            },
            {
                title: t("dashboard.menu.others", { defaultValue: "ផ្សេងៗ" }),
                items: [
                    { href: "/dashboard/upgrade", label: t("dashboard.nav.upgrade", { defaultValue: "ដំឡើងកម្រិត" }), icon: Crown },
                    account,
                    support,
                    ...adminPortal,
                ],
            },
        ];
    }, [isStaff, isSuperAdmin, canAccessWeddingFeatures, t]);

    return (
        <div className="flex flex-col h-full bg-card relative">
            <div className="absolute top-0 -left-20 w-40 h-40 bg-teal-500/5 rounded-full pointer-events-none hidden md:block" />

            <div className={`p-5 pb-4 flex items-center ${collapsed ? "justify-center" : "justify-between"} border-b border-border/40 relative z-10`}>
                <Link to="/" className="flex items-center gap-3">
                    <MoneaLogo showText={!collapsed} size="sm" />
                </Link>
                {onToggleCollapse && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCollapse}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                        title={collapsed ? "បើក Navbar" : "បង្រួម Navbar"}
                        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
                    >
                        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </Button>
                )}
            </div>

            <nav aria-label="Dashboard" className="min-h-0 flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-none relative z-10">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-1">
                        {!collapsed && (
                            <h2 className="px-3.5 pb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground/70 font-kantumruy">
                                {section.title}
                            </h2>
                        )}
                        {section.items.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                isActive={isActiveRoute(item.href)}
                                isPending={pendingHref === item.href}
                                onClick={onCloseMobile}
                                onNavClick={handleNavClick}
                                collapsed={collapsed}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            <div className={`p-4 relative ${collapsed ? "flex justify-center" : ""}`}>
                <Button
                    variant="ghost"
                    className={`${collapsed ? "w-10 justify-center px-0" : "w-full justify-start gap-3"} text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-accent h-10 rounded-xl transition-all`}
                    onClick={() => setIsLogoutModalOpen(true)}
                    title={collapsed ? t("common.auth.logout", { defaultValue: "ចាកចេញ" }) : undefined}
                >
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span className="text-xs font-bold uppercase tracking-wider font-kantumruy">{t("common.auth.logout", { defaultValue: "ចាកចេញ" })}</span>}
                </Button>
            </div>

            <ConfirmModal
                open={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title={t("dashboard.logout.confirmTitle", { defaultValue: "តើអ្នកពិតជាចង់ចាកចេញមែនទេ?" })}
                description={t("dashboard.logout.confirmDescription", { defaultValue: "អ្នកនឹងត្រូវចូលគណនីជាថ្មីម្តងទៀតដើម្បីប្រើប្រាស់។" })}
                confirmLabel={t("common.actions.logout", { defaultValue: "ចាកចេញ" })}
                cancelLabel={t("common.actions.cancel", { defaultValue: "បោះបង់" })}
                variant="logout"
            />
        </div>
    );
});