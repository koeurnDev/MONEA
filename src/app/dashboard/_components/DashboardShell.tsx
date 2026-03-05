"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { BroadcastBanner } from "./BroadcastBanner";
import MobileBottomNav from "./MobileBottomNav";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { HelpCircle, Loader2, User, Settings, LogOut, ShieldCheck, LifeBuoy } from "lucide-react";
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

interface DashboardShellProps {
    children: React.ReactNode;
    isStaff: boolean;
    isAdmin: boolean;
}


export function DashboardShell({ children, isStaff, isAdmin }: DashboardShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const isDesignPage = pathname?.includes("/dashboard/design");
    const isLivePage = pathname?.includes("/dashboard/gifts/live");

    const handleLogout = async () => {
        // Call the server API to clear HttpOnly cookies first
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Logout API failed", e);
        }
        // Hard redirect to clear all client states and Next.js router cache
        window.location.href = "/login";
    };

    // Pure Fullscreen / Kiosk mode for Live View
    if (isLivePage) {
        return <main className="w-full min-h-screen">{children}</main>;
    }

    return (
        <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
            {/* Desktop Sidebar */}
            <aside className="w-[280px] bg-card hidden md:flex flex-col fixed h-full z-20 border-r border-border shadow-[4px_0_24px_-12px_rgba(0,0,0,0.03)] print:hidden">
                <DashboardSidebar isStaff={isStaff} isAdmin={isAdmin} />
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
                        "h-16 md:h-20 sticky top-0 z-30 flex items-center px-4 md:px-10 justify-between print:hidden",
                        "bg-card border-b border-border"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col">
                                <h2 className="text-xl font-bold text-foreground tracking-tight font-kantumruy">
                                    {pathname === "/dashboard" ? "ទិដ្ឋភាពទូទៅ" :
                                        pathname.includes("/guests") ? "គ្រប់គ្រងភ្ញៀវ" :
                                            pathname.includes("/gifts") ? "បញ្ជីចំណងដៃ" :
                                                pathname.includes("/schedule") ? "កាលវិភាគ" :
                                                    pathname.includes("/settings") ? "ការកំណត់" : "ផ្ទាំងគ្រប់គ្រង"}
                                </h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-none mt-1.5 font-kantumruy">
                                    ព័ត៌មានទូទៅ
                                </p>
                            </div>

                            <div className="md:hidden absolute left-1/2 -translate-x-1/2 scale-75">
                                <MoneaLogo showText size="sm" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="group flex items-center gap-3 pl-4 border-l border-border outline-none transition-opacity focus-visible:opacity-80 active:scale-95 duration-200">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-sm font-black text-foreground font-kantumruy leading-none group-hover:text-red-600 transition-colors">Premium User</span>
                                            <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mt-1.5 opacity-60">MONEA Client</span>
                                        </div>
                                        <Avatar className="w-10 h-10 rounded-2xl border-2 border-border/40 bg-muted/30 group-hover:border-red-600/30 group-hover:bg-red-600/5 transition-all shadow-sm">
                                            <AvatarImage src="" alt="User" />
                                            <AvatarFallback className="bg-transparent text-muted-foreground group-hover:text-red-600">
                                                <User className="w-5 h-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 mt-2 p-2 rounded-[1.5rem] bg-card/80 backdrop-blur-xl border-border/40 shadow-2xl" align="end">
                                    <DropdownMenuLabel className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-black font-kantumruy">កម្រងព័ត៌មាន</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Account Settings</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-border/40 mx-2" />
                                    <DropdownMenuGroup className="p-1">
                                        <Link href="/dashboard/design">
                                            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-red-600/5 focus:text-red-600 transition-colors group">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-focus:bg-red-600/10 transition-colors">
                                                    <Settings className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold font-kantumruy">រចនា & ការកំណត់</span>
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/dashboard/support">
                                            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-red-600/5 focus:text-red-600 transition-colors group">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-focus:bg-red-600/10 transition-colors">
                                                    <LifeBuoy className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold font-kantumruy">ជំនួយ & ការគាំទ្រ</span>
                                            </DropdownMenuItem>
                                        </Link>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-border/40 mx-2" />
                                    <div className="p-1">
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setIsLogoutModalOpen(true);
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-red-600 focus:text-white transition-colors group text-red-600 font-bold"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center group-focus:bg-white/20 transition-colors">
                                                <LogOut className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-kantumruy">ចាកចេញពីកម្មវិធី</span>
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
                        <DashboardSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} isStaff={isStaff} isAdmin={isAdmin} />
                    </SheetContent>
                </Sheet>

                {/* Content Container */}
                <div className={cn(
                    "w-full mx-auto print:p-0 print:max-w-none",
                    !isDesignPage && "p-3 md:p-10 max-w-7xl",
                    isDesignPage && "p-0 m-0 max-w-none h-full flex flex-col"
                )}>
                    {!isDesignPage && <div className="print:hidden"><BroadcastBanner /></div>}
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
                    title="ចាកចេញពីគណនី?"
                    description="តើអ្នកពិតជាចង់ចាកចេញពីគណនីរបស់អ្នកមែនទេ? អ្នកនឹងត្រូវបញ្ចូលលេខសម្ងាត់ម្តងទៀតនៅពេលចូលប្រើប្រាស់លើកក្រោយ។"
                    confirmLabel="ចាកចេញ"
                    cancelLabel="បោះបង់"
                    variant="danger"
                />
            </main>
        </div>
    );
}
