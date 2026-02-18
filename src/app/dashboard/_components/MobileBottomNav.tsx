"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Clock, Menu, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
    onOpenMenu: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
    const pathname = usePathname();

    const tabs = [
        { href: "/dashboard", label: "ទំព័រដើម", icon: Home },
        { href: "/dashboard/guests", label: "ភ្ញៀវ", icon: Users },
        { href: "/dashboard/schedule", label: "កម្មវិធី", icon: Clock },
    ];

    // Hide on Design Wizard
    if (pathname.includes("/dashboard/design")) return null;

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl z-50 px-6 flex items-center justify-between border border-white/40 ring-1 ring-slate-200/50 shadow-slate-200/50">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full transition-all duration-300 relative",
                            isActive ? "text-red-600" : "text-slate-400 hover:text-slate-900"
                        )}
                    >
                        <tab.icon className={cn("w-5 h-5 transition-all", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                        {isActive && <span className="absolute -bottom-2 w-1 h-1 bg-red-600 rounded-full" />}
                    </Link>
                )
            })}

            {/* Divider */}
            <div className="w-px h-6 bg-slate-100 mx-2" />

            {/* More Button */}
            <button
                onClick={onOpenMenu}
                className="flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-full text-slate-400 hover:text-slate-900 transition-all duration-300"
            >
                <Menu className="w-5 h-5" />
            </button>
        </div>
    );
}
