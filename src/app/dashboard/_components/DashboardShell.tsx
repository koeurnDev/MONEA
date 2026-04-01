"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { BroadcastBanner } from "./BroadcastBanner";
import { NotificationBell } from "./NotificationBell";
import MobileBottomNav from "./MobileBottomNav";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Settings, LogOut, LifeBuoy, ShieldCheck } from "lucide-react";
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
import { LanguageToggle } from "@/components/LanguageToggle";

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
    const pathname = usePathname();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const router = useRouter();

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
    }, [error, initialUser]);

    // REDIRECTION LOGIC: Consolidated to Server Components (DashboardPage) to avoid loops
    /*
    React.useEffect(() => {
        if (!mounted || !user || isStaff || isAdmin === false) return;

        const weddingCount = user._count?.weddings ?? 0;
        const isCreating = pathname === "/dashboard/create";
        const isAccount = pathname === "/dashboard/account";
        const isSupport = pathname === "/dashboard/support";

        if (weddingCount === 0 && !isCreating && !isAccount && !isSupport) {
            router.push("/dashboard/create");
        } else if (weddingCount > 0 && isCreating) {
            router.push("/dashboard");
        }
    }, [mounted, user, pathname, isStaff, isAdmin, router]);
    */

    const isDesignPage = pathname?.includes("/dashboard/design");
    const isLivePage = pathname?.includes("/dashboard/gifts/live");

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Logout API failed", e);
        }
        window.location.href = "/sign-in";
    };

    // Memoize the Sidebar to prevent re-renders when 'user' state changes
    const memoizedSidebar = React.useMemo(() => (
        <DashboardSidebar isStaff={isStaff} isAdmin={isAdmin} />
    ), [isStaff, isAdmin]);

    // Role-based title and subtitle for the header identity
    const isPlatformAdmin = user?.role === ROLES.PLATFORM_OWNER || user?.role === ROLES.EVENT_STAFF;
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
        <div className="flex min-h-screen w-full bg-background font-sans text-foreground print:!bg-white print:!text-black">
            {/* Desktop Sidebar */}
            <aside className="w-[280px] bg-card hidden md:flex flex-col fixed h-full z-20 shadow-sm dark:shadow-none print:hidden border-r border-border/50 accelerate-gpu">
                {memoizedSidebar}
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 flex flex-col md:ml-[280px] min-h-screen relative print:ml-0 print:m-0 print:p-0",
                !isDesignPage && "pb-32 md:pb-0",
                isDesignPage && "p-0 h-screen overflow-hidden"
            )}>
                {/* Unified Header */}
                {!isDesignPage && (
                    <header className={cn(
                        "h-16 md:h-20 sticky top-0 z-30 flex items-center px-4 md:px-10 justify-between print:hidden accelerate-gpu",
                        "bg-card border-b border-border/50"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col text-left">
                                <h2 className="text-xl font-bold text-foreground tracking-tight font-kantumruy">
                                    {pathname === "/dashboard" ? t("dashboard.nav.overview") :
                                        pathname.includes("/guests") ? t("dashboard.nav.guests") :
                                            pathname.includes("/gifts") ? t("dashboard.nav.gifts") :
                                                pathname.includes("/schedule") ? t("dashboard.nav.schedule") :
                                                    pathname.includes("/settings") ? t("dashboard.nav.settings") : t("dashboard.title")}
                                </h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-none mt-1.5 font-kantumruy">
                                    {t("dashboard.nav.generalInfo")}
                                </p>
                            </div>

                            <div className="md:hidden absolute left-1/2 -translate-x-1/2 scale-75">
                                <MoneaLogo showText size="sm" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            <LanguageToggle className="bg-zinc-100 dark:bg-white/5 border border-border/50" />
                            <ThemeToggle />
                            <NotificationBell isAuthenticated={!!user} />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="group flex items-center gap-3 pl-4 outline-none transition-opacity focus-visible:opacity-80 active:scale-95 duration-200">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-sm font-black text-foreground font-kantumruy leading-none group-hover:text-red-600 transition-colors">
                                                {!mounted ? t("common.loading.fetching") : resolvedTitle}
                                            </span>
                                            <span className="text-[9px] text-zinc-500 font-bold tracking-[0.1em] uppercase mt-1.5 opacity-60">
                                                {!mounted ? "MONEA User" : resolvedSubtitle}
                                            </span>
                                        </div>
                                        <Avatar className="w-10 h-10 rounded-2xl bg-muted/30 group-hover:bg-red-600/5 transition-all shadow-sm border-none">
                                            {user?.image ? (
                                                <AvatarImage src={user.image} alt="User" />
                                            ) : null}
                                            <AvatarFallback className="bg-transparent text-muted-foreground group-hover:text-red-600">
                                                <User className="w-5 h-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72 mt-3 p-3 rounded-2xl bg-card border border-border shadow-xl dark:shadow-none" align="end">
                                    <DropdownMenuLabel className="px-5 py-4 mb-2">
                                        <div className="flex flex-col gap-2 text-left">
                                            <p className="text-base font-black font-kantumruy text-foreground tracking-tight">{t("dashboard.user.profile")}</p>
                                            <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-[0.2em] leading-none">{t("dashboard.user.accountSettings")}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-border/40 mx-3 mb-2" />
                                    <DropdownMenuGroup className="p-1 space-y-1">
                                        <Link href="/dashboard/account">
                                            <DropdownMenuItem className="flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer focus:bg-red-600/5 focus:text-red-700 dark:focus:text-red-400 transition-all duration-200 group">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-focus:bg-red-600/10 transition-colors shadow-sm">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-bold font-kantumruy">{t("dashboard.user.accountSettings")}</span>
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/dashboard/design">
                                            <DropdownMenuItem className="flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer focus:bg-red-600/5 focus:text-red-700 dark:focus:text-red-400 transition-all duration-200 group">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-focus:bg-red-600/10 transition-colors shadow-sm">
                                                    <Settings className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-bold font-kantumruy">{t("dashboard.user.designSettings")}</span>
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/dashboard/support">
                                            <DropdownMenuItem className="flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer focus:bg-red-600/5 focus:text-red-700 dark:focus:text-red-400 transition-all duration-200 group">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-focus:bg-red-600/10 transition-colors shadow-sm">
                                                    <LifeBuoy className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-bold font-kantumruy">{t("dashboard.user.helpSupport")}</span>
                                            </DropdownMenuItem>
                                        </Link>
                                    </DropdownMenuGroup>
                                    <div className="p-1 mt-2">
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setIsLogoutModalOpen(true);
                                            }}
                                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/5 transition-all duration-200 group text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-bold"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center transition-colors group-focus:scale-95 duration-200 shadow-sm">
                                                <LogOut className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                                            </div>
                                            <span className="text-sm font-kantumruy">{t("common.auth.logout")}</span>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                )}

                {/* Mobile Hidden Sheet */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 bg-card w-72 z-[60] border-none print:hidden">
                        <DashboardSidebar
                            isStaff={isStaff}
                            isAdmin={isAdmin}
                            onCloseMobile={() => setIsMobileMenuOpen(false)}
                        />
                    </SheetContent>
                </Sheet>

                {/* Content Container */}
                <div className={cn(
                    "w-full mx-auto print:p-0 print:max-w-none",
                    !isDesignPage && "p-5 pb-28 md:pb-10 md:p-10 max-w-7xl",
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
                    variant="danger"
                />
            </main>
        </div>
    );
}
