import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Shield, Menu, Activity, Bell, Megaphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from 'framer-motion';
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminLanguageToggle } from "@/components/AdminLanguageToggle";
import { ToastProvider } from "@/components/ui/Toast";
import { useTranslation } from "@/i18n/LanguageProvider";
import AdminHealthPulse from "@/components/admin/AdminHealthPulse";
// next/dynamic replaced with React.lazy;
import { moneaClient } from "@/lib/api-client";

const ConfirmModal = lazy<React.ComponentType<any>>(() => import("@/components/ui/ConfirmModal").then(m => ({ default: (m as any).ConfirmModal })));

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
    const { t, locale } = useTranslation();
    const { pathname } = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    async function confirmLogout() {
        setLogoutLoading(true);
        try {
            await moneaClient.post("/api/auth/logout");
            window.location.href = "/sign-in";
        } catch (e) {
            console.error(e);
            setLogoutLoading(false);
        }
    }

    const navItems = [
        { href: "/admin", label: t("admin.sidebar.overview"), icon: LayoutDashboard },
        { href: "/admin/weddings", label: t("admin.sidebar.weddings"), icon: Globe },
        { href: "/admin/users", label: t("admin.sidebar.users"), icon: Users },
        { href: "/admin/master/broadcast", label: locale === 'km' ? "ផ្សព្វផ្សាយសារ" : "Broadcasts", icon: Megaphone },
        { href: "/admin/master/settings", label: t("admin.sidebar.settings"), icon: Settings },
    ];

    const renderSidebarContent = (isMobile: boolean = false) => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 relative overflow-hidden text-slate-500 dark:text-slate-400">
            <div className="p-10 pb-12 relative z-10">
                <Link to="/" className="flex items-center gap-4 group transition-transform hover:scale-[1.02]">
                    <MoneaLogo showText size="md" />
                </Link>
            </div>

            <nav className="flex-1 px-6 space-y-2 relative z-10 transition-all duration-500">
                <div className="px-5 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                    <Activity size={12} className="text-slate-400" />
                    {t("admin.sidebar.governance")}
                </div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-4 w-full px-5 py-3 rounded-lg transition-all duration-300 shadow-sm text-sm font-medium relative group",
                                isActive
                                    ? "bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent"
                            )}
                        >
                            {isActive && (
                                <m.div 
                                    layoutId={isMobile ? "mobile-sidebar-active" : "sidebar-active"}
                                    className="absolute left-0 w-1 h-8 bg-slate-800 dark:bg-slate-300 rounded-full pointer-events-none"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={cn(
                                "p-2 rounded-md transition-all duration-300",
                                isActive ? "bg-white dark:bg-slate-800 text-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm" : "bg-transparent text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                            )}>
                                <item.icon size={16} strokeWidth={2} />
                            </div>
                            <span className="font-kantumruy tracking-tight truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <AdminHealthPulse />

            <div className="p-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                <button
                    className="flex items-center gap-4 w-full px-5 py-4 rounded-lg transition-all duration-300 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-white/5 group border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                    onClick={() => setLogoutConfirm(true)}
                >
                    <div className="w-8 h-8 rounded-md bg-transparent flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all shadow-sm group-hover:border group-hover:border-slate-200 dark:group-hover:border-slate-700">
                        <LogOut size={16} strokeWidth={2} />
                    </div>
                    <span className="font-kantumruy tracking-tight">{t("admin.sidebar.logout")}</span>
                </button>
            </div>
        </div>
    );

    return (
        <ToastProvider>
            <div className="flex min-h-screen w-full bg-[#FAFAFA] dark:bg-slate-950 text-foreground font-kantumruy">
                {logoutConfirm && (
                    <ConfirmModal
                        open={logoutConfirm}
                        onClose={() => setLogoutConfirm(false)}
                        onConfirm={confirmLogout}
                        loading={logoutLoading}
                        title={t("admin.logout.title")}
                        description={t("admin.logout.description")}
                        confirmLabel={t("admin.logout.confirm")}
                        cancelLabel={t("admin.logout.cancel")}
                        variant="warning"
                    />
                )}
                <aside className="w-[280px] border-r border-slate-200 dark:border-border hidden lg:flex flex-col fixed h-full z-40 bg-white dark:bg-slate-950 shadow-none">
                    {renderSidebarContent(false)}
                </aside>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden flex">
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <m.aside
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="relative w-[280px] flex flex-col h-full z-10 shadow-xl bg-white dark:bg-slate-950"
                            >
                                {renderSidebarContent(true)}
                            </m.aside>
                        </div>
                    )}
                </AnimatePresence>

                <main className="flex-1 flex flex-col lg:ml-[280px] min-h-screen relative">
                    <header className={cn(
                        "h-16 sticky top-0 z-30 flex items-center px-6 md:px-10 justify-between transition-all duration-300",
                        scrolled ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm" : "bg-transparent border-b border-transparent"
                    )}>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md lg:hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                            >
                                <Menu size={18} />
                            </button>

                            <div className="hidden lg:flex flex-col">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                    {navItems.find(i => pathname === i.href)?.label || t("admin.sidebar.overview")}
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <AdminLanguageToggle />
                            <ThemeToggle />
                            <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                                <Bell size={16} />
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t("admin.header.role")}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t("admin.header.platform")}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <Shield size={14} />
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="p-6 md:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </ToastProvider>
    )
}

