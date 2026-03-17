"use client";

import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";
import { Home, Users, Clock, Menu, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoading } from "@/components/providers/LoadingProvider";

interface MobileBottomNavProps {
    onOpenMenu: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
    const pathname = usePathname();
    const { startLoading } = useLoading();

    const tabs = [
        { href: "/dashboard", label: "ដើម", icon: Home },
        { href: "/dashboard/guests", label: "ភ្ញៀវ", icon: Users },
        { href: "menu", label: "Menu", icon: Menu, isAction: true },
        { href: "/dashboard/gifts", label: "ចំណងដៃ", icon: Gift },
        { href: "/dashboard/schedule", label: "កម្មវិធី", icon: Clock },
    ];

    const activeIndex = tabs.findIndex(tab => pathname === tab.href);
    // Default to center (Menu) if no active path found (e.g. for actions)
    const normalizedIndex = activeIndex === -1 ? 2 : activeIndex;

    if (pathname.includes("/dashboard/design")) return null;

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 print:hidden pointer-events-none">
            {/* Nav Container - Floating shadow-only style */}
            <div className="bg-white dark:bg-zinc-950 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center h-14 px-2 rounded-2xl pointer-events-auto border border-black/[0.03] dark:border-white/[0.05] accelerate-gpu">
                {tabs.map((tab, idx) => {
                    const isActive = pathname === tab.href || (tab.isAction && activeIndex === -1);

                    return (
                        <div key={idx} className="flex-1 flex justify-center items-center h-full">
                            <Link
                                href={tab.isAction ? "#" : tab.href}
                                onClick={(e) => {
                                    if (tab.isAction) {
                                        e.preventDefault();
                                        onOpenMenu();
                                    } else if (!isActive) {
                                        startLoading();
                                    }
                                }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 w-full max-w-[80px]",
                                    isActive
                                        ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-50/50 dark:border-red-900/50 shadow-sm"
                                        : "text-muted-foreground"
                                )}
                            >
                                <div className="relative">
                                    <tab.icon className={cn("w-[18px] h-[18px] transition-colors", isActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground/60")} strokeWidth={isActive ? 2.5 : 2} />
                                    {tab.isAction && (
                                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full border border-white dark:border-zinc-900 shadow-sm" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-wider font-kantumruy transition-all",
                                    isActive ? "opacity-100" : "opacity-70"
                                )}>
                                    {tab.label}
                                </span>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
