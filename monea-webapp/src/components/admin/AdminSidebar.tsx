import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    PartyPopper,
    Users,
    DollarSign,
    Megaphone,
    ShieldAlert,
    FileText,
    Wrench,
    TrendingUp,
    Settings,
    LifeBuoy,
    LogOut,
    ExternalLink,
    ShieldCheck,
    ChevronRight,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
    onCloseMobile?: () => void;
}

interface NavItem {
    href: string;
    label: string;
    enLabel: string;
    icon: React.ElementType;
    exact?: boolean;
    badge?: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/admin/login";
        } catch (e) {
            window.location.href = "/admin/login";
        }
    };

    const navSections: NavSection[] = [
        {
            title: "គ្រប់គ្រងទូទៅ",
            items: [
                { href: "/admin/master", label: "ផ្ទាំងទូទៅ", enLabel: "Overview", icon: LayoutDashboard, exact: true },
                { href: "/admin/master/weddings", label: "កម្មវិធីមង្គលការ", enLabel: "Weddings", icon: PartyPopper },
                { href: "/admin/master/users", label: "អ្នកប្រើប្រាស់", enLabel: "Users", icon: Users },
                { href: "/admin/master/payments", label: "ការទូទាត់ប្រាក់", enLabel: "Payments", icon: DollarSign },
            ]
        },
        {
            title: "ប្រព័ន្ធ & សុវត្ថិភាព",
            items: [
                { href: "/admin/master/broadcast", label: "សារប្រកាស", enLabel: "Broadcast", icon: Megaphone },
                { href: "/admin/master/security", label: "សន្តិសុខ & IP", enLabel: "Security", icon: ShieldAlert },
                { href: "/admin/master/audit", label: "កំណត់ត្រាសវនកម្ម", enLabel: "Audit Logs", icon: FileText },
                { href: "/admin/master/maintenance", label: "ការថែទាំប្រព័ន្ធ", enLabel: "Maintenance", icon: Wrench },
                { href: "/admin/master/analytics", label: "ស្ថិតិទូទាំងប្រទេស", enLabel: "Analytics", icon: TrendingUp },
            ]
        },
        {
            title: "ជំនួយ & ការកំណត់",
            items: [
                { href: "/admin/master/support", label: "ផ្នែកជំនួយអតិថិជន", enLabel: "Support Desk", icon: LifeBuoy, badge: "LIVE" },
                { href: "/admin/master/settings", label: "ការកំណត់ប្រព័ន្ធ", enLabel: "Global Settings", icon: Settings },
            ]
        }
    ];

    return (
        <aside className="w-72 h-full bg-card text-card-foreground border-r border-border/70 flex flex-col justify-between font-kantumruy select-none relative z-30">
            {/* Top Brand Header */}
            <div>
                <div className="p-6 pb-4 border-b border-border/50 flex items-center justify-between">
                    <Link to="/admin/master" onClick={onCloseMobile} className="flex items-center gap-3 group">
                        <MoneaLogo showText size="sm" />
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Admin
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-none">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                            <p className="px-3 py-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                                {section.title}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = item.exact 
                                        ? pathname === item.href 
                                        : pathname.startsWith(item.href);

                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            onClick={onCloseMobile}
                                            className={cn(
                                                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all group",
                                                isActive
                                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20 shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Icon size={17} className={cn(
                                                    "shrink-0 transition-transform group-hover:scale-110",
                                                    isActive ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground group-hover:text-foreground"
                                                )} />
                                                <span className="truncate">{item.label}</span>
                                            </div>

                                            {item.badge ? (
                                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-600 text-white animate-pulse shrink-0">
                                                    {item.badge}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground/50 font-normal group-hover:text-muted-foreground shrink-0 hidden sm:inline">
                                                    {item.enLabel}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Profile & Actions */}
            <div className="p-4 border-t border-border/50 bg-muted/20 space-y-2">
                {/* Switch to Couple Dashboard */}
                <Link
                    to="/dashboard"
                    onClick={onCloseMobile}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <ExternalLink size={14} className="text-muted-foreground" />
                        <span>ផ្ទាំង User Dashboard</span>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground/60" />
                </Link>

                {/* Profile Card */}
                <div className="p-2.5 rounded-2xl bg-card border border-border/80 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 font-black text-xs uppercase">
                            {user?.name && user.name !== '-' ? user.name.replace(/[^a-zA-Z0-9\u1780-\u17FF]/g, '').charAt(0).toUpperCase() || 'A' : (user?.email?.charAt(0).toUpperCase() || 'A')}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                                {user?.name && user.name !== '-' ? user.name : (user?.email ? user.email.split('@')[0] : "Master Admin")}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate font-mono">
                                {user?.email || "kook74532@gmail.com"}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        title="ចាកចេញ (Logout)"
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                    >
                        <LogOut size={15} />
                    </Button>
                </div>
            </div>
        </aside>
    );
}
