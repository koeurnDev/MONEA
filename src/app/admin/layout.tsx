"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, Shield, Heart, Menu, X, Bell, Search, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
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
            window.location.href = "/login";
        } catch (e) {
            console.error(e);
            setLogoutLoading(false);
        }
    }

    const navItems = [
        { href: "/admin", label: "ទិដ្ឋភាពទូទៅ", icon: LayoutDashboard },
        { href: "/admin/weddings", label: "មង្គលការទាំងអស់", icon: Heart },
        { href: "/admin/users", label: "អ្នកប្រើប្រាស់", icon: Users },
        { href: "/admin/settings", label: "ការកំណត់ប្រព័ន្ធ", icon: Settings },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            {/* Subtle Gradient Accents for Depth (Light) */}
            <div className="absolute top-0 -left-24 w-48 h-48 bg-red-100/30 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 -right-24 w-48 h-48 bg-blue-100/30 blur-[100px] rounded-full pointer-events-none" />

            {/* Logo Area */}
            <div className="p-8 pb-10">
                <Link href="/" className="flex items-center gap-4 group">
                    <MoneaLogo showText size="md" variant="light" />
                </Link>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 space-y-1">
                <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-transparent">
                    តាមដានប្រព័ន្ធ
                </div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 w-full px-4 py-4 rounded-2xl transition-all duration-300 text-base font-medium relative group",
                                isActive
                                    ? "bg-red-50 text-red-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-300",
                                isActive ? "bg-white text-red-600 shadow-sm" : "bg-transparent text-slate-400 group-hover:text-slate-600"
                            )}>
                                <item.icon className="h-4 w-4" />
                            </div>
                            <span className="font-kantumruy font-bold tracking-tight">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* System Info Highlight */}
            <div className="mx-6 my-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-40" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">System Operational</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-emerald-500 h-full"
                    />
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest text-center">Engine v0.1.0-stable</p>
            </div>

            {/* Logout Action */}
            <div className="p-6 border-t border-slate-50">
                <button
                    className="flex items-center gap-3 w-full px-4 py-4 rounded-2xl transition-all duration-300 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 group"
                    onClick={() => setLogoutConfirm(true)}
                >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-red-100 transition-all border border-slate-100">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-kantumruy">ចាកចេញ</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen w-full bg-[#fcfcfd] text-slate-900 font-kantumruy">
            <ConfirmModal
                open={logoutConfirm}
                onClose={() => setLogoutConfirm(false)}
                onConfirm={confirmLogout}
                loading={logoutLoading}
                title="ចាកចេញពីប្រព័ន្ធ"
                description="តើអ្នកប្រាកដថាចង់ចាកចេញពី SuperAdmin? អ្នកនឹងត្រូវវិលត្រឡប់ទៅកាន់ទំព័រចូល (Login) ។"
                confirmLabel="ចាកចេញ"
                cancelLabel="បន្ត"
                variant="warning"
            />
            {/* Desktop Sidebar */}
            <aside className="w-[280px] border-r border-slate-100 hidden md:flex flex-col fixed h-full z-40 bg-white">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-[280px] flex flex-col h-full z-10 shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col md:ml-[280px] min-h-screen relative">
                {/* Header */}
                <header className={cn(
                    "h-20 sticky top-0 z-30 flex items-center px-6 md:px-10 justify-between transition-all duration-300",
                    scrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm" : "bg-transparent"
                )}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden md:flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                {navItems.find(i => pathname === i.href)?.label || "ទិដ្ឋភាពទូទៅ"}
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mt-1.5">
                                Admin Dashboard Portal
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                            <Bell size={18} />
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-bold text-slate-900">Administrator</span>
                                <span className="text-xs text-red-600 font-bold tracking-widest uppercase">MONEA Platform</span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
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
    )
}

