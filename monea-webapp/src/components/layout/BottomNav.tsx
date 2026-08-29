import { cn } from "@/lib/utils";
import { Home, Users, Calendar, Settings } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

export function BottomNav() {
    const { pathname } = useLocation();

    const links = [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/dashboard/guests", icon: Users, label: "Guests" }, // Updated to match dashboard subroute path if applicable
        { href: "/dashboard/timeline", icon: Calendar, label: "Timeline" },
        { href: "/dashboard/account", icon: Settings, label: "More" },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden print:hidden">
            <div className="flex items-center justify-around rounded-full border border-white/20 bg-white/90 p-3 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-black/80 will-change-transform">
                {links.map((link) => {
                    // Fixed: Exact match for home, startsWith for subroutes
                    const isActive = link.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(link.href);

                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={cn(
                                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-95",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
                            )}
                        >
                            <Icon size={20} />
                            {isActive && (
                                <span className="absolute -bottom-6 text-[10px] font-bold font-kantumruy text-primary shadow-sm whitespace-nowrap">
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