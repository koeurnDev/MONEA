"use client";

import * as React from "react";
import Link from "next/link";
import { m } from 'framer-motion';
import { usePathname, useRouter } from "next/navigation";
import { Gift, LogOut, Palette, FileText, Clock, Crown, HelpCircle, Settings, Home, UserCog, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useLoading } from "@/components/providers/LoadingProvider";

interface DashboardSidebarProps {
    onCloseMobile?: () => void;
    isStaff?: boolean;
    isAdmin?: boolean;
}

// Memoized Link Component to prevent re-renders of the entire sidebar
const NavLink = React.memo(({ item, isActive, onClick, onNavClick }: { item: any, isActive: boolean, onClick?: () => void, onNavClick: () => void }) => {
    return (
        <Link
            href={item.href}
            onClick={(e) => {
                if (onClick) onClick();
                if (!isActive) onNavClick();
            }}
            className={`flex items-center gap-3 w-full px-4 h-10 text-[13px] font-kantumruy font-medium rounded-lg transition-all duration-75 accelerate-gpu ${isActive
                ? "bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                : "text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:bg-zinc-100/50 dark:hover:bg-white/5"
                }`}
        >
            <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-red-600 dark:text-red-400" : "text-zinc-400 dark:text-zinc-500"}`} />
            <span className="text-left">{item.label}</span>
            {item.badge && (
                <span className="text-[8px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md opacity-80">
                    {item.badge}
                </span>
            )}
        </Link>
    );
});

NavLink.displayName = "NavLink";

export const DashboardSidebar = React.memo(function DashboardSidebar({ onCloseMobile, isStaff = false, isAdmin = false }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { startLoading } = useLoading();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Logout API failed", e);
        }
        window.location.href = "/login";
    };

    const mainNav = React.useMemo(() => [
        { href: "/dashboard/gifts", label: "ចំណងដៃ", icon: Gift, hidden: !isStaff },
        { href: "/dashboard", label: "ទំព័រដើម", icon: Home, hidden: isStaff },
        { href: "/dashboard/guests", label: "ភ្ញៀវ", icon: Users, hidden: isStaff },
        { href: "/dashboard/gifts", label: "ចំណងដៃ", icon: Gift, hidden: isStaff },
    ], [isStaff]);

    const weddingNav = React.useMemo(() => [
        { href: "/dashboard/design", label: "រចនា & ការកំណត់", icon: Palette, hidden: isStaff },
        { href: "/dashboard/schedule", label: "កាលវិភាគកម្មវិធី", icon: Clock, hidden: isStaff },
        { href: "/dashboard/notes", label: "កំណត់ត្រា", icon: BookOpen, hidden: isStaff },
        { href: "/dashboard/staff", label: "បុគ្គលិក", icon: UserCog, hidden: isStaff },
    ], [isStaff]);

    const adminNav = React.useMemo(() => [
        { href: "/dashboard/reports", label: "របាយការណ៍", icon: FileText, hidden: isStaff },
        { href: "/dashboard/support", label: "ជំនួយ & ការគាំទ្រ", icon: HelpCircle, hidden: isStaff },
        { href: "/dashboard/upgrade", label: "ដំឡើងកញ្ចប់", icon: Crown, hidden: isStaff },
    ], [isStaff]);

    return (
        <div className="flex flex-col h-full bg-card relative accelerate-gpu">
            {/* Minimal Decorative Elements (No Blur) */}
            <div className="absolute top-0 -left-20 w-40 h-40 bg-red-50/10 dark:bg-red-950/20 rounded-full pointer-events-none hidden md:block" />

            <div className="p-6 pb-6 flex items-center relative">
                <Link href="/" className="flex items-center gap-4">
                    <MoneaLogo showText size="sm" />
                </Link>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-none relative">
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-black font-kantumruy text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">ទូទៅ</p>
                    {mainNav.map(item => !item.hidden && (
                        <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onCloseMobile} onNavClick={startLoading} />
                    ))}
                </div>

                {!isStaff && (
                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-black font-kantumruy text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">រៀបចំពិធី</p>
                        {weddingNav.map(item => !item.hidden && (
                            <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onCloseMobile} onNavClick={startLoading} />
                        ))}
                    </div>
                )}

                {!isStaff && (
                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-black font-kantumruy text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">ផ្សេងៗ</p>
                        {adminNav.map(item => !item.hidden && (
                            <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onCloseMobile} onNavClick={startLoading} />
                        ))}
                    </div>
                )}
            </nav>

            <div className="p-4 relative">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-accent h-10 rounded-xl transition-all"
                    onClick={() => setIsLogoutModalOpen(true)}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider font-kantumruy">ចាកចេញ</span>
                </Button>
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
        </div>
    );
});
