"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { BroadcastBanner } from "./BroadcastBanner";
import MobileBottomNav from "./MobileBottomNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";

interface DashboardShellProps {
    children: React.ReactNode;
    isStaff: boolean;
    isAdmin: boolean;
}

export function DashboardShell({ children, isStaff, isAdmin }: DashboardShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isDesignPage = pathname?.includes("/dashboard/design");

    return (
        <div className="flex min-h-screen w-full bg-[#FCFCFD] font-sans">
            {/* Desktop Sidebar */}
            <aside className="w-[280px] bg-white hidden md:flex flex-col fixed h-full z-20 border-r border-slate-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.03)]">
                <DashboardSidebar isStaff={isStaff} isAdmin={isAdmin} />
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 flex flex-col md:ml-[280px] min-h-screen relative",
                // Normal Dashboard: pb-24 for mobile nav
                !isDesignPage && "pb-24 md:pb-0",
                // Design Page: No padding
                isDesignPage && "p-0"
            )}>
                {/* Unified Header (Sync with Admin Layout) */}
                {!isDesignPage && (
                    <header className={cn(
                        "h-16 md:h-20 sticky top-0 z-30 flex items-center px-4 md:px-10 justify-between transition-all duration-300",
                        "bg-white/80 backdrop-blur-md border-b border-slate-100"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight font-kantumruy">
                                    {pathname === "/dashboard" ? "ទិដ្ឋភាពទូទៅ" :
                                        pathname.includes("/guests") ? "គ្រប់គ្រងភ្ញៀវ" :
                                            pathname.includes("/gifts") ? "បញ្ជីចំណងដៃ" :
                                                pathname.includes("/schedule") ? "កាលវិភាគ" :
                                                    pathname.includes("/settings") ? "ការកំណត់" : "ផ្ទាំងគ្រប់គ្រង"}
                                </h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-none mt-1.5 font-kantumruy">
                                    Wedding Management Portal
                                </p>
                            </div>

                            <div className="md:hidden absolute left-1/2 -translate-x-1/2 scale-75">
                                <MoneaLogo showText size="sm" variant="light" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-bold text-slate-900 font-kantumruy">Premium User</span>
                                    <span className="text-[10px] text-red-600 font-bold tracking-widest uppercase font-kantumruy">MONEA Client</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Mobile Hidden Sheet (Controlled by Bottom Nav) */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 bg-white w-72 z-[60] border-none">
                        <DashboardSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} isStaff={isStaff} isAdmin={isAdmin} />
                    </SheetContent>
                </Sheet>

                {/* Content Container */}
                <div className={cn(
                    "w-full mx-auto",
                    // Normal Dashboard: animate in, padding, max-width
                    !isDesignPage && "p-3 md:p-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500",
                    // Design Page: full width, no padding, no animation
                    isDesignPage && "p-0 m-0 max-w-none"
                )}>
                    {!isDesignPage && <BroadcastBanner />}
                    {children}
                </div>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
            </main>
        </div>
    );
}
