"use client";

import { cn } from "@/lib/utils";
import { Home, Users, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/guests", icon: Users, label: "Guests" },
        { href: "/timeline", icon: Calendar, label: "Timeline" },
        { href: "/settings", icon: Settings, label: "More" },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
            <div className="flex items-center justify-around rounded-full border border-white/20 bg-white/90 p-3 shadow-2xl sm:backdrop-blur-sm dark:border-white/10 dark:bg-black/80 will-change-transform">
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
                            )}
                        >
                            <Icon size={20} />
                            {isActive && (
                                <span className="absolute -bottom-6 text-[10px] font-medium text-primary shadow-sm">
                                    {link.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
