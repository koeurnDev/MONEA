"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Home, Users, Clock, Menu, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
    onOpenMenu: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
    const pathname = usePathname();

    const tabs = [
        { href: "/dashboard", label: "ដើម", icon: Home },
        { href: "/dashboard/guests", label: "ភ្ញៀវ", icon: Users },
        { href: "menu", label: "Menu", icon: Menu, isAction: true },
        { href: "/dashboard/gifts", label: "ចំណងដៃ", icon: Gift },
        { href: "/dashboard/schedule", label: "កម្មវិធី", icon: Clock },
    ];

    if (pathname.includes("/dashboard/design")) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 print:hidden pointer-events-none">
            {/* SVG Background with Notch */}
            <div className="absolute bottom-0 left-0 right-0 w-full h-[100px] drop-shadow-[0_-5px_25px_rgba(0,0,0,0.3)] pointer-events-auto">
                <svg
                    viewBox="0 0 400 100"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    className="fill-white dark:fill-zinc-950 stroke-black/5 dark:stroke-white/5 transition-colors"
                >
                    <path
                        d="M0,35 C0,25 10,20 20,20 L150,20 C165,20 170,25 175,32 C185,50 190,55 200,55 C210,55 215,50 225,32 C230,25 235,20 250,20 L380,20 C390,20 400,25 400,35 L400,100 L0,100 Z"
                    />
                </svg>
            </div>

            {/* Navigation Content */}
            <div className="relative h-[85px] w-full px-2 flex items-center justify-between pointer-events-none pb-2">
                {tabs.map((tab, idx) => {
                    const isActive = pathname === tab.href;

                    if (tab.isAction) {
                        return (
                            <div key="center-action" className="relative flex-1 flex justify-center -mt-12 pointer-events-auto">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onOpenMenu}
                                    className="w-16 h-16 rounded-full bg-slate-900 dark:bg-zinc-900 flex items-center justify-center text-white shadow-[0_8px_25px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] border-[3px] border-white dark:border-zinc-800 z-10 relative overflow-hidden group transition-colors"
                                >
                                    <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                                    <Menu className="w-8 h-8 text-white" strokeWidth={2.5} />
                                    {/* Green Indicator Dot like in the image */}
                                    <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] border-2 border-zinc-950" />
                                </motion.button>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className="flex-1 flex flex-col items-center justify-center gap-1.5 pointer-events-auto relative h-full pt-6"
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.15 : 1,
                                    y: isActive ? -4 : 0
                                }}
                                className={cn(
                                    "p-1.5 rounded-xl transition-all",
                                    isActive ? "bg-red-500/10 text-red-500" : "text-zinc-500"
                                )}
                            >
                                <tab.icon className="w-5.5 h-5.5" strokeWidth={isActive ? 2.5 : 2} />
                            </motion.div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.15em] font-kantumruy transition-all",
                                isActive ? "opacity-100 text-red-600 dark:text-red-500" : "opacity-60 text-slate-800 dark:text-white/60"
                            )}>
                                {tab.label}
                            </span>

                            {/* Active Indicator Glow */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute bottom-2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                    />
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
