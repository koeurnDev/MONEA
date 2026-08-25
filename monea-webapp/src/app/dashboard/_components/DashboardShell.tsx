import * as React from "react";
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardSidebar } from "./DashboardSidebar";
import { BroadcastBanner } from "./BroadcastBanner";
import { NotificationBell } from "./NotificationBell";
import MobileBottomNav from "./MobileBottomNav";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { moneaClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Settings, LogOut, LifeBuoy, ShieldCheck, Menu } from "lucide-react";
import { ROLES } from "@/lib/constants";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import useSWR from "swr";
import { useTranslation } from "@/i18n/LanguageProvider";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

interface DashboardShellProps {
    children: React.ReactNode;
    isStaff: boolean;
    isAdmin: boolean;
    initialUser?: any;
}

export function DashboardShell({ children, isStaff, isAdmin, initialUser }: DashboardShellProps) {
    const { t } = useTranslation();
    const { data: user, error } = useSWR("/api/auth/me", fetcher, {
        fallbackData: initialUser,
        revalidateOnFocus: false,
        dedupingInterval: 60000, // 60 seconds deduping for less CPU/Network noise
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const { logout } = useAuth();
    const { pathname } = useLocation();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const router = useNavigate();

    React.useEffect(() => {
        if (error?.status === 401) {
            console.log(`[DashboardShell Debug] 401 detected. initialUser present: ${!!initialUser}`);
            if (initialUser) {
                console.warn("[DashboardShell] SWR returned 401, but ignoring because initialUser is present.");
            } else {
                console.log("[DashboardShell Debug] Redirecting to login because no initialUser.");
                handleLogout();
            }
        }
    }, [error, initialUser, logout]);

    // REDIRECTION LOGIC: Consolidated to Server Components (DashboardPage) to avoid loops
    /*
    React.useEffect(() => {
        if (!mounted || !user || isStaff || isAdmin === false) return;

        const weddingCount = user._count?.weddings ?? 0;
        const isCreating = pathname === "/dashboard/create";
        const isAccount = pathname === "/dashboard/account";
        const isSupport = pathname === "/dashboard/support";

        if (weddingCount === 0 && !isCreating && !isAccount && !isSupport) {
            navigate("/dashboard/create");
        } else if (weddingCount > 0 && isCreating) {
            navigate("/dashboard");
        }
    }, [mounted, user, pathname, isStaff, isAdmin, router]);
    */

    const isDesignPage = pathname?.includes("/dashboard/design");
    const isLivePage = pathname?.includes("/dashboard/gifts/live");

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error("Logout API failed", e);
            window.location.href = "/sign-in";
        }
    };

    const isEffectiveAdmin = isAdmin || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'PLATFORM_OWNER' || user?.type === 'admin';

    // Memoize the Sidebar to prevent re-renders when 'user' state changes
    const memoizedSidebar = React.useMemo(() => (
        <DashboardSidebar isStaff={isStaff} isAdmin={isEffectiveAdmin} />
    ), [isStaff, isEffectiveAdmin]);

    // Role-based title and subtitle for the header identity
    const isPlatformAdmin = isEffectiveAdmin || user?.role === ROLES.EVENT_STAFF;
    const userName = user?.name || (user?.email ? user.email.split('@')[0] : "");
    const resolvedTitle = isPlatformAdmin 
        ? t('admin.header.role') 
        : (userName || "MONEA User");
    const resolvedSubtitle = isPlatformAdmin
        ? t('admin.header.platform')
        : (user?.email || "MONEA User");

    if (isLivePage) {
        return <main className="w-full min-h-screen">{children}</main>;
    }

    return (
        <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-background font-sans text-foreground print:!bg-white print:!text-black">
            {/* Desktop Sidebar */}
            <aside className="w-[280px] bg-card hidden md:flex flex-col fixed h-full z-20 shadow-sm dark:shadow-none print:hidden border-r border-border/50">
                {memoizedSidebar}
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-w-0 max-w-full overflow-x-hidden flex flex-col md:ml-[280px] min-h-screen relative print:ml-0 print:m-0 print:p-0",
                !isDesignPage && "pb-32 md:pb-0",
                isDesignPage && "p-0 h-screen overflow-hidden"
            )}>
                {/* Unified Header */}
                {!isDesignPage && (
                    <header className={cn(
                        "h-16 md:h-20 sticky top-0 z-30 flex items-center px-4 sm:px-6 md:px-10 print:hidden transition-all duration-300",
                        "bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50 shadow-sm"
                    )}>
                        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden -ml-2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>

                                <Link to="/dashboard/account" className="hidden md:flex group items-center gap-3 outline-none transition-opacity focus-visible:opacity-80 active:scale-95 duration-200">
                                    <Avatar className="w-10 h-10 rounded-2xl bg-muted/30 group-hover:bg-red-600/5 transition-all shadow-sm border-none">
                                        {user?.image ? (
                                            <AvatarImage src={user.image} alt="User" />
                                        ) : null}
                                        <AvatarFallback className="bg-transparent text-muted-foreground group-hover:text-red-600">
                                            <User className="w-5 h-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden sm:flex flex-col items-start">
                                        <span className="text-sm font-black text-foreground font-kantumruy leading-none group-hover:text-red-600 transition-colors">
                                            {!mounted ? t("common.loading.fetching") : resolvedTitle}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 font-bold tracking-[0.1em] uppercase mt-1.5 opacity-60">
                                            {!mounted ? "MONEA User" : resolvedSubtitle}
                                        </span>
                                    </div>
                                </Link>

                                <div className="md:hidden absolute left-1/2 -translate-x-1/2 scale-75 pointer-events-none">
                                    <MoneaLogo showText size="sm" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4">
                                <ThemeToggle />
                                <NotificationBell isAuthenticated={!!user} />
                                <Link 
                                    to="/dashboard/account" 
                                    aria-label="Account Settings"
                                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                                >
                                    {user?.image ? (
                                        <img src={user.image} alt="User" className="w-full h-full rounded-xl object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-rose-500" />
                                    )}
                                </Link>
                            </div>
                        </div>
                    </header>
                )}

                {/* Mobile Hidden Sheet */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 bg-card w-72 z-[60] border-none print:hidden">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">Mobile navigation menu for accessing dashboard sections.</SheetDescription>
                        <DashboardSidebar
                            isStaff={isStaff}
                            isAdmin={isEffectiveAdmin}
                            onCloseMobile={() => setIsMobileMenuOpen(false)}
                        />
                    </SheetContent>
                </Sheet>

                {/* Content Container */}
                <div className={cn(
                    "w-full print:p-0 print:max-w-none",
                    !isDesignPage && "max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8 pb-36 sm:pb-32 md:pb-12",
                    isDesignPage && "p-0 m-0 max-w-none h-full flex flex-col"
                )}>
                    {!isDesignPage && <div className="print:hidden"><BroadcastBanner isAuthenticated={!!user} /></div>}
                    {children}
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="print:hidden">
                    <MobileBottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
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
            </main>
        </div>
    );
}
