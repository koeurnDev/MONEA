"use client";

import { useState, memo, useMemo } from "react";
import Link from "next/link";
import { m } from 'framer-motion';
import { usePathname, useRouter } from "next/navigation";
import { Gift, LogOut, Palette, FileText, Clock, Crown, HelpCircle, Settings, Home, UserCog, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface DashboardSidebarProps {
    onCloseMobile?: () => void;
    isStaff?: boolean;
    isAdmin?: boolean;
}

// Memoized Link Component to prevent re-renders of the entire sidebar
const NavLink = memo(({ item, isActive, onClick }: { item: any, isActive: boolean, onClick?: () => void }) => {
    return (
        <Link
            href={item.href}
            onClick={onClick}
            prefetch={true}
            className={`flex items-center gap-3 w-full px-4 h-11 text-[14px] font-kantumruy font-bold rounded-xl transition-all duration-75 ${isActive
                ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100/50 dark:border-red-900/50 shadow-sm"
                : "text-muted-foreground hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/10"
                }`}
        >
            <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground/60"}`} />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
                <span className="text-[8px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md animate-pulse">
                    {item.badge}
                </span>
            )}
        </Link>
    );
});

NavLink.displayName = "NavLink";

export function DashboardSidebar({ onCloseMobile, isStaff = false, isAdmin = false }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Logout API failed", e);
        }
        window.location.href = "/login";
    };

    const mainNav = useMemo(() => [
        { href: "/dashboard/gifts", label: "ចំណងដៃ", icon: Gift, hidden: !isStaff },
        { href: "/dashboard", label: "ទំព័រដើម", icon: Home, hidden: isStaff },
        { href: "/dashboard/guests", label: "ភ្ញៀវ", icon: Users, hidden: isStaff },
        { href: "/dashboard/gifts", label: "ចំណងដៃ", icon: Gift, hidden: isStaff },
    ], [isStaff]);

    const weddingNav = useMemo(() => [
        { href: "/dashboard/design", label: "រចនា & ការកំណត់", icon: Palette, hidden: isStaff },
        { href: "/dashboard/schedule", label: "កាលវិភាគកម្មវិធី", icon: Clock, hidden: isStaff },
        { href: "/dashboard/notes", label: "កំណត់ត្រា", icon: BookOpen, hidden: isStaff },
        { href: "/dashboard/staff", label: "បុគ្គលិក", icon: UserCog, hidden: isStaff },
    ], [isStaff]);

    const adminNav = useMemo(() => [
        { href: "/dashboard/reports", label: "របាយការណ៍", icon: FileText, hidden: isStaff },
        { href: "/dashboard/support", label: "ជំនួយ & ការគាំទ្រ", icon: HelpCircle, hidden: isStaff, badge: "NEW" },
        { href: "/dashboard/upgrade", label: "ដំឡើងកញ្ចប់", icon: Crown, hidden: isStaff },
    ], [isStaff]);

    return (
        <div className="flex flex-col h-full bg-card relative">
            {/* Minimal Decorative Elements (No Blur) */}
            <div className="absolute top-0 -left-20 w-40 h-40 bg-red-50/10 dark:bg-red-950/20 rounded-full pointer-events-none" />

            <div className="p-6 pb-6 flex items-center relative">
                <Link href="/" className="flex items-center gap-4">
                    <MoneaLogo showText size="sm" />
                </Link>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-none relative">
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-black font-kantumruy text-muted-foreground uppercase tracking-widest mb-3">ទូទៅ</p>
                    {mainNav.map(item => !item.hidden && (
                        <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onCloseMobile} />
                    ))}
                </div>

                {!isStaff && (
                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-black font-kantumruy text-muted-foreground uppercase tracking-widest mb-3">រៀបចំពិធី</p>
                        {weddingNav.map(item => !item.hidden && (
                            <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onCloseMobile} />
                        ))}
                    </div>
                )}

                {!isStaff && (
                    <div className="space-y-1">
                        <p className="px-4 text-[10px] font-black font-kantumruy text-muted-foreground uppercase tracking-widest mb-3">ផ្សេងៗ</p>
                        {adminNav.map(item => !item.hidden && (
                            <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onCloseMobile} />
                        ))}
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-border relative">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent h-10 rounded-xl transition-all"
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
}
