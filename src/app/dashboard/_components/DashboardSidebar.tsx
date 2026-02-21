"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Gift, LogOut, Palette, FileText, Clock, Crown, HelpCircle, Settings, Home, UserCog, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useState } from "react";

interface DashboardSidebarProps {
    onCloseMobile?: () => void;
    isStaff?: boolean;
    isAdmin?: boolean;
}

export function DashboardSidebar({ onCloseMobile, isStaff = false, isAdmin = false }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

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

    const mainNav = [
        // Staff Dashboard removed as per user request
        { href: "/dashboard/gifts", label: "ចំណងដៃ", icon: Gift, hidden: !isStaff }, // Staff specific
        { href: "/dashboard", label: "ទំព័រដើម", icon: Home, hidden: isStaff }, // Admin Home
        { href: "/dashboard/guests", label: "ភ្ញៀវ", icon: Users, hidden: isStaff },
        { href: "/dashboard/gifts", label: "ចំណងដៃ", icon: Gift, hidden: isStaff }, // Admin specific
    ];

    const weddingNav = [
        { href: "/dashboard/design", label: "រចនាធៀបការ", icon: Palette, hidden: isStaff },
        { href: "/dashboard/schedule", label: "កាលវិភាគកម្មវិធី", icon: Clock, hidden: isStaff },
        { href: "/dashboard/notes", label: "កំណត់ត្រា", icon: BookOpen, hidden: isStaff },
        { href: "/dashboard/staff", label: "បុគ្គលិក", icon: UserCog, hidden: isStaff },
    ];

    const adminNav = [
        { href: "/dashboard/reports", label: "របាយការណ៍", icon: FileText, hidden: isStaff },
        { href: "/dashboard/support", label: "ជំនួយ & ការគាំទ្រ", icon: HelpCircle, hidden: isStaff },
        { href: "/dashboard/upgrade", label: "ដំឡើងកញ្ចប់", icon: Crown, hidden: isStaff },
        { href: "/dashboard/settings", label: "ការកំណត់", icon: Settings, hidden: isStaff },
    ];

    const renderLink = (item: any) => {
        if (item.hidden) return null; // Hide if restricted
        const isActive = pathname === item.href;
        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 w-full px-4 h-11 text-[15px] font-kantumruy font-bold rounded-xl transition-all duration-300 ${isActive
                    ? "bg-red-500/15 text-red-700 backdrop-blur-md border border-red-200/50 shadow-sm"
                    : "text-slate-600 hover:text-red-600 hover:bg-red-50"
                    }`}
            >
                <item.icon className={`h-4 w-4 ${isActive ? "text-red-600" : "text-slate-500 group-hover:text-red-600"}`} />
                {item.label}
            </Link>
        )
    };

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            {/* Subtle Gradient Accents for Depth (Light) */}
            <div className="absolute top-0 -left-24 w-48 h-48 bg-red-100/30 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 -right-24 w-48 h-48 bg-blue-100/30 blur-[100px] rounded-full pointer-events-none" />

            <div className="p-6 md:p-8 pb-8 md:pb-10 flex items-center relative">
                <Link href="/" className="flex items-center gap-4 group">
                    <MoneaLogo showText size="md" variant="light" />
                </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-none relative">
                <div className="space-y-1.5">
                    <p className="px-4 text-xs font-bold font-kantumruy text-slate-400 uppercase tracking-widest mb-4">ទូទៅ</p>
                    {mainNav.map(renderLink)}
                </div>

                {!isStaff && (
                    <div className="space-y-1.5">
                        <p className="px-4 text-xs font-bold font-kantumruy text-slate-400 uppercase tracking-widest mb-4">រៀបចំពិធី</p>
                        {weddingNav.map(renderLink)}
                    </div>
                )}

                {!isStaff && (
                    <div className="space-y-1.5">
                        <p className="px-4 text-xs font-bold font-kantumruy text-slate-400 uppercase tracking-widest mb-4">ផ្សេងៗ</p>
                        {adminNav.map(renderLink)}
                    </div>
                )}
            </nav>

            <div className="p-6 border-t border-slate-50 relative">
                <ConfirmModal
                    open={logoutConfirm}
                    onClose={() => setLogoutConfirm(false)}
                    onConfirm={confirmLogout}
                    loading={logoutLoading}
                    title="ចាកចេញពីប្រព័ន្ធ"
                    description="តើអ្នកប្រាកដថាចង់ចាកចេញ? អ្នកនឹងត្រូវវិលត្រឡប់ទៅកាន់ទំព័រចូល (Login) ។"
                    confirmLabel="ចាកចេញ"
                    cancelLabel="បន្ត"
                    variant="warning"
                />
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 h-11 rounded-xl transition-all"
                    onClick={() => setLogoutConfirm(true)}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">ចាកចេញ</span>
                </Button>
            </div>
        </div>
    );
}
