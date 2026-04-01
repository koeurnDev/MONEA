"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, Shield, Menu, Activity, Bell, Megaphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from 'framer-motion';
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminLanguageToggle } from "@/components/AdminLanguageToggle";
import { ToastProvider } from "@/components/ui/Toast";
import { useTranslation } from "@/i18n/LanguageProvider";
import AdminHealthPulse from "@/components/admin/AdminHealthPulse";
import dynamic from "next/dynamic";

const ConfirmModal = dynamic(() => import("@/components/ui/ConfirmModal").then(m => m.ConfirmModal), { ssr: false });

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
    const { t, locale } = useTranslation();
    const pathname = usePathname();
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
            await fetch("/api/auth/logout", { method: "POST" });
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

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 relative overflow-hidden text-slate-500 dark:text-slate-400">
            <div className="absolute top-0 -left-20 w-64 h-64 bg-red-600/5 dark:bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="p-10 pb-12 relative z-10">
                <Link href="/" className="flex items-center gap-4 group transition-transform hover:scale-[1.02]">
                    <MoneaLogo showText size="md" className="dark:invert dark:brightness-200" />
                </Link>
            </div>

            <nav className="flex-1 px-6 space-y-2 relative z-10 transition-all duration-500">
                <div className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                    <Activity size={10} className="text-red-500" />
                    {t("admin.sidebar.governance")}
                </div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-4 w-full px-5 py-4 rounded-[1.5rem] transition-all duration-500 shadow-sm active:scale-95 text-sm font-bold relative group",
                                isActive
                                    ? "bg-slate-900 dark:bg-white/10 text-white dark:text-white shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-800 dark:border-white/10"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <m.div 
                                    layoutId="sidebar-active"
                                    className="absolute left-1 w-1 h-6 bg-red-600 rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-500",
                                isActive ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                            )}>
                                <item.icon size={16} strokeWidth={2.5} />
                            </div>
                            <span className="font-kantumruy tracking-tight truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <AdminHealthPulse />

            <div className="p-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                <button
                    className="flex items-center gap-4 w-full px-5 py-4 rounded-[1.5rem] transition-all duration-500 text-xs font-black text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 group"
                    onClick={() => setLogoutConfirm(true)}
                >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm border border-slate-100 dark:border-white/5">
                        <LogOut size={16} strokeWidth={2.5} />
                    </div>
                    <span className="font-kantumruy uppercase tracking-widest">{t("admin.sidebar.logout")}</span>
                </button>
            </div>
        </div>
    );

    return (
        <ToastProvider>
            <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-foreground font-kantumruy">
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
                <aside className="w-[300px] border-r border-slate-100 dark:border-border hidden lg:flex flex-col fixed h-full z-40 bg-white dark:bg-slate-950 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
                    <SidebarContent />
                </aside>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden flex">
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <m.aside
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="relative w-[300px] flex flex-col h-full z-10 shadow-2xl"
                            >
                                <SidebarContent />
                            </m.aside>
                        </div>
                    )}
                </AnimatePresence>

                <main className="flex-1 flex flex-col lg:ml-[300px] min-h-screen relative">
                    <header className={cn(
                        "h-20 sticky top-0 z-30 flex items-center px-6 md:px-10 justify-between transition-all duration-300",
                        scrolled ? "bg-card/80 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"
                    )}>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl lg:hidden border border-border/50"
                            >
                                <Menu size={20} />
                            </button>

                            <div className="hidden lg:flex flex-col">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {navItems.find(i => pathname === i.href)?.label || t("admin.sidebar.overview")}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        {t("admin.header.portal")}
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none">
                                        {t("admin.header.version")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <AdminLanguageToggle />
                            <ThemeToggle />
                            <button className="p-2.5 bg-muted border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                                <Bell size={18} />
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l border-border">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-bold text-foreground">{t("admin.header.role")}</span>
                                    <span className="text-xs text-red-600 dark:text-red-400 font-bold tracking-widest uppercase">{t("admin.header.platform")}</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border">
                                    <Shield size={20} />
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
