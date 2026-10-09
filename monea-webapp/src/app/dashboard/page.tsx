import { Link, useNavigate } from 'react-router-dom';
import { useEffect, Suspense } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, ArrowRight, Sparkles, Plus, LayoutDashboard, Clock, Crown, TrendingUp, ShieldCheck, Palette, Heart, Calendar, Globe, ExternalLink } from "lucide-react";
import { InvitationCenter } from "@/components/dashboard/InvitationCenter";
import { Button } from "@/components/ui/button";
import { DashboardDataView } from "./_components/DashboardDataView";
import { Skeleton } from "@/components/ui/skeleton";
import { SafeBoundary } from "@/components/ui/SafeBoundary";
import { useTranslation } from "@/i18n/LanguageProvider";
import { motion } from "framer-motion";
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from "./_components/PageHeader";

function DashboardDataSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-14 rounded-2xl bg-muted/40 w-1/3" />
            <div className="h-[380px] rounded-[2.5rem] bg-muted/30 w-full" />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="h-48 rounded-[2rem] bg-muted/30 w-full" />
                <div className="h-48 rounded-[2rem] bg-muted/30 w-full" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user: authUser, isLoading: authLoading } = useAuth();
    const wedding = (authUser as any)?.wedding ?? null;
    const loading = authLoading;

    let isTemplateReady = false;
    if (wedding?.templateId) {
        let parsedTheme = wedding.themeSettings;
        if (typeof parsedTheme === 'string') {
            try { parsedTheme = JSON.parse(parsedTheme); } catch (e) { parsedTheme = {}; }
        }
        if (parsedTheme && Object.keys(parsedTheme).length > 0) {
            isTemplateReady = true;
        } else {
            isTemplateReady = true; // has templateId
        }
    }

    useEffect(() => {
        if (authLoading) return;
        if (!authUser) return;
        if (authUser.type === 'user' && !authUser.weddingId) {
            navigate('/dashboard/create');
        }
    }, [authUser, authLoading, navigate]);

    if (loading) return <DashboardDataSkeleton />;

    const isPlatformAdmin = authUser?.role === 'ADMIN' || authUser?.role === 'STAFF';
    const coupleName = wedding
        ? `${wedding.groomName || t("dashboard.coupleGroomFallback")} & ${wedding.brideName || t("dashboard.coupleBrideFallback")}`
        : '';

    const calculateDaysLeft = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            const target = new Date(dateStr).getTime();
            if (isNaN(target)) return null;
            const today = new Date().setHours(0, 0, 0, 0);
            return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        } catch {
            return null;
        }
    };

    const daysLeft = calculateDaysLeft(wedding?.date);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 pb-14"
        >
            <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col items-start gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300 font-kantumruy">
                            {wedding?.eventType === 'anniversary'
                                ? t("dashboard.eventType.anniversary")
                                : t("dashboard.eventType.wedding")}
                        </span>
                        {wedding?.packageType === "PREMIUM" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-amber-600 dark:text-amber-300">
                                <Crown size={10} className="fill-amber-600" />
                                {t("common.labels.premium", { defaultValue: "Premium" })}
                            </span>
                        )}
                        {daysLeft !== null && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-600/20 bg-teal-600/10 px-2 py-0.5 text-[9px] font-bold text-teal-800 dark:text-teal-300">
                                <Clock size={10} />
                                {daysLeft > 0
                                    ? t("dashboard.daysLeft", { count: daysLeft })
                                    : daysLeft === 0
                                        ? t("dashboard.today")
                                        : t("dashboard.eventPassed")}
                            </span>
                        )}
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-foreground font-kantumruy sm:text-2xl">
                        {coupleName ? (
                            <span className="inline-flex items-center gap-2">
                                <span>{coupleName}</span>
                                <Heart className="h-4 w-4 text-teal-700 fill-teal-700" />
                            </span>
                        ) : (
                            t("dashboard.nav.overview", { defaultValue: "ផ្ទាំងគ្រប់គ្រង" })
                        )}
                    </h1>
                </div>

                <Link to="/dashboard/design" className="w-full sm:w-auto">
                    <Button className="h-10 w-full rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 px-4 text-[11px] font-black text-white shadow-sm shadow-teal-700/20 transition hover:from-teal-800 hover:to-teal-700 sm:w-auto">
                        <Palette className="mr-2 h-4 w-4" />
                        <span>{t("dashboard.actions.designNow", { defaultValue: "ធៀប" })}</span>
                    </Button>
                </Link>
            </div>

            {!wedding ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6 bg-muted/20 rounded-[2.5rem] p-10 border border-dashed border-border/60">
                    <div className="w-20 h-20 bg-teal-600/10 rounded-full flex items-center justify-center border border-teal-600/20">
                        <Plus className="w-10 h-10 text-teal-800 dark:text-teal-300" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black font-kantumruy tracking-tight">{t("common.loading.preparing")}</h3>
                        <p className="text-muted-foreground font-bold font-kantumruy max-w-sm leading-relaxed">{t("dashboard.empty.message")}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-5 sm:space-y-8">
                    {/* Main Hero Card: Invitation Center (No redundant double nesting) */}
                    {isTemplateReady ? (
                        <InvitationCenter weddingId={wedding.id} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-6 space-y-6 text-center bg-white dark:bg-[#121217] rounded-[2.5rem] border-2 border-dashed border-border shadow-sm">
                            <div className="w-20 h-20 bg-teal-600/10 text-teal-700 dark:text-teal-300 rounded-full flex items-center justify-center">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-black font-kantumruy text-2xl tracking-tight text-foreground">
                                    {t("dashboard.empty.noTemplateTitle")}
                                </h4>
                                <p className="text-sm text-muted-foreground font-kantumruy max-w-md mx-auto leading-relaxed">
                                    {t("dashboard.empty.noTemplateDesc")}
                                </p>
                            </div>
                            <Link to="/dashboard/design">
                                <Button className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white rounded-2xl shadow-xl shadow-teal-700/20 font-black font-kantumruy px-8 h-12">
                                    {t("dashboard.actions.designNow")}
                                </Button>
                            </Link>
                        </div>
                    )}

                    <DashboardDataView weddingId={wedding.id} canShareInvitation={isTemplateReady} />

                    {/* Mobile quick actions keep the next step obvious without a desktop-sized card wall. */}
                    <div className="grid grid-cols-2 gap-2 sm:hidden">
                        <Link
                            to="/dashboard/design"
                            aria-label={t("dashboard.nav.design", { defaultValue: "រចនាធៀបការ" })}
                            className="flex min-h-[64px] min-w-0 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-2xl border border-teal-600/30 bg-teal-600/[0.12] px-2 py-3 text-center shadow-sm shadow-teal-600/10 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                        >
                            <Palette aria-hidden="true" className="h-5 w-5 text-teal-800 dark:text-teal-300" />
                            <span className="truncate text-[11px] font-black font-kantumruy text-teal-800 dark:text-teal-300">
                                {t("dashboard.nav.designShort", { defaultValue: "រចនា" })}
                            </span>
                        </Link>
                        <Link
                            to="/dashboard/guests"
                            aria-label={t("dashboard.nav.guests", { defaultValue: "គ្រប់គ្រងភ្ញៀវ" })}
                            className="flex min-h-[64px] min-w-0 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-2xl border border-blue-500/20 bg-blue-500/[0.08] px-2 py-3 text-center transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            <Users aria-hidden="true" className="h-5 w-5 text-blue-500" />
                            <span className="truncate text-[11px] font-bold font-kantumruy">
                                {t("dashboard.nav.guestsShort", { defaultValue: "ភ្ញៀវ" })}
                            </span>
                        </Link>
                    </div>

                    <div className="hidden sm:grid grid-cols-1 gap-3 md:grid-cols-2">
                        <Link to="/dashboard/design" className="group">
                            <Card className="h-full rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#141419]">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-800 dark:text-teal-300">
                                        <Palette className="h-5 w-5" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                                </div>
                                <CardTitle className="text-base font-black font-kantumruy">
                                    {t("dashboard.actions.designNow", { defaultValue: "រចនា" })}
                                </CardTitle>
                                <p className="mt-2 text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                    {t("dashboard.cardDescriptions.design")}
                                </p>
                            </Card>
                        </Link>

                        <Link to="/dashboard/guests" className="group">
                            <Card className="h-full rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#141419]">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-blue-500" />
                                </div>
                                <CardTitle className="text-base font-black font-kantumruy">
                                    {t("dashboard.nav.guests", { defaultValue: "ភ្ញៀវ" })}
                                </CardTitle>
                                <p className="mt-2 text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                    {t("dashboard.cardDescriptions.guests")}
                                </p>
                            </Card>
                        </Link>

                        {/* Core Action 4: Live Invitation Preview */}
                        <a
                            href={`/w/${encodeURIComponent(wedding.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <Card className="h-full border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md rounded-3xl bg-white dark:bg-[#141419] transition-all duration-300 group-hover:-translate-y-1">
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-emerald-600 transition-transform" />
                                    </div>
                                    <CardTitle className="text-lg font-black font-kantumruy pt-4">
                                        {t("dashboard.invitationPreview.title")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                        {t("dashboard.invitationPreview.description")}
                                    </p>
                                </CardContent>
                            </Card>
                        </a>

                        {/* Core Action 5: Upgrade / Package Status */}
                        <Link to="/dashboard/upgrade" className="group">
                            <Card className="h-full border border-amber-500/20 shadow-sm hover:shadow-md rounded-3xl bg-gradient-to-br from-amber-500/5 to-teal-500/5 dark:from-amber-950/20 dark:to-teal-950/10 transition-all duration-300 group-hover:-translate-y-1">
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                                            <Crown className="w-6 h-6" />
                                        </div>
                                        <div className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase font-kantumruy">
                                            {wedding.packageType || "FREE"}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg font-black font-kantumruy pt-4">
                                        {t("dashboard.nav.upgrade", { defaultValue: "កញ្ចប់សេវាកម្ម" })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                        {wedding.packageType === "PREMIUM" 
                                            ? t("dashboard.upgrade.promo.premiumActive")
                                            : t("dashboard.upgrade.promo.description")
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
