import { Link, useNavigate } from 'react-router-dom';
import { useEffect, Suspense } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, ArrowRight, Sparkles, Plus, LayoutDashboard, Clock, FileText, Crown, TrendingUp, ShieldCheck, Palette, Heart, Calendar } from "lucide-react";
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
    const coupleName = wedding ? `${wedding.groomName || 'កូនកំលោះ'} & ${wedding.brideName || 'កូនក្រមុំ'}` : '';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 sm:space-y-8 pb-16"
        >
            {/* Top Welcome / Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 text-center sm:text-left items-center sm:items-start">
                <div className="space-y-1 flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider font-kantumruy">
                            {wedding?.eventType === 'anniversary' ? 'កម្មវិធីភ្ជាប់ពាក្យ' : 'កម្មវិធីមង្គលការ'}
                        </span>
                        {wedding?.packageType === "PREMIUM" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase font-kantumruy border border-amber-500/20">
                                <Crown size={11} className="fill-amber-600" />
                                {t("common.labels.premium", { defaultValue: "Premium" })}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground font-kantumruy tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
                        {coupleName ? (
                            <>
                                <span>{coupleName}</span>
                                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 inline-block animate-pulse" />
                            </>
                        ) : (
                            t("dashboard.nav.overview", { defaultValue: "ផ្ទាំងគ្រប់គ្រង" })
                        )}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link to="/dashboard/design">
                        <Button className="h-11 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold font-kantumruy text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all active:scale-95">
                            <Palette className="w-4 h-4" />
                            <span>{t("dashboard.actions.designNow", { defaultValue: "កែសម្រួលការរចនា" })}</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {!wedding ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6 bg-muted/20 rounded-[2.5rem] p-10 border border-dashed border-border/60">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                        <Plus className="w-10 h-10 text-rose-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black font-kantumruy tracking-tight">{t("common.loading.preparing")}</h3>
                        <p className="text-muted-foreground font-bold font-kantumruy max-w-sm leading-relaxed">{t("dashboard.empty.message")}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Main Hero Card: Invitation Center (No redundant double nesting) */}
                    {isTemplateReady ? (
                        <InvitationCenter weddingId={wedding.id} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-6 space-y-6 text-center bg-white dark:bg-[#121217] rounded-[2.5rem] border-2 border-dashed border-border shadow-sm">
                            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-black font-kantumruy text-2xl tracking-tight text-foreground">
                                    {t("dashboard.empty.noTemplateTitle", { defaultValue: "តំណភ្ជាប់អញ្ជើញមិនទាន់រួចរាល់ទេ" })}
                                </h4>
                                <p className="text-sm text-muted-foreground font-kantumruy max-w-md mx-auto leading-relaxed">
                                    {t("dashboard.empty.noTemplateDesc", { defaultValue: "សូមធ្វើការរចនា និងរក្សាទុកសំបុត្ររបស់អ្នកជាមុនសិន ទើបប្រព័ន្ធអាចបង្កើតតំណភ្ជាប់ និង QR Code សម្រាប់ចែករំលែកបាន។" })}
                                </p>
                            </div>
                            <Link to="/dashboard/design">
                                <Button className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-2xl shadow-xl shadow-rose-500/20 font-black font-kantumruy px-8 h-12">
                                    {t("dashboard.actions.designNow", { defaultValue: "រៀបចំការរចនាឥឡូវនេះ" })}
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Secondary Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick Action 1: Manage Guests */}
                        <Link to="/dashboard/guests" className="group">
                            <Card className="h-full border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md rounded-3xl bg-white dark:bg-[#141419] transition-all duration-300 group-hover:-translate-y-1">
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 text-blue-600 transition-transform" />
                                    </div>
                                    <CardTitle className="text-lg font-black font-kantumruy pt-4">
                                        {t("dashboard.nav.guests", { defaultValue: "គ្រប់គ្រងភ្ញៀវ" })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                        {t("dashboard.cards.guestsDesc", { defaultValue: "បញ្ចូលឈ្មោះភ្ញៀវ បង្កើតតំណភ្ជាប់ផ្ទាល់ខ្លួន និងត្រួតពិនិត្យការចូលរួម។" })}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Quick Action 2: Timeline Schedule */}
                        <Link to="/dashboard/timeline" className="group">
                            <Card className="h-full border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md rounded-3xl bg-white dark:bg-[#141419] transition-all duration-300 group-hover:-translate-y-1">
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 text-amber-600 transition-transform" />
                                    </div>
                                    <CardTitle className="text-lg font-black font-kantumruy pt-4">
                                        {t("dashboard.nav.timeline", { defaultValue: "កាលវិភាគកម្មវិធី" })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                        {t("dashboard.cards.timelineDesc", { defaultValue: "កំណត់កម្មវិធីពេលព្រឹក និងពិធីជប់លៀងពេលល្ងាចយ៉ាងច្បាស់លាស់។" })}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Quick Action 3: Upgrade / Package Status */}
                        <Link to="/dashboard/upgrade" className="group">
                            <Card className="h-full border border-amber-500/20 shadow-sm hover:shadow-md rounded-3xl bg-gradient-to-br from-amber-500/5 to-rose-500/5 dark:from-amber-950/20 dark:to-rose-950/10 transition-all duration-300 group-hover:-translate-y-1">
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
                                            ? t("dashboard.upgrade.promo.premiumActive", { defaultValue: "អ្នកកំពុងប្រើប្រាស់កញ្ចប់ Premium ពេញលេញគ្រប់មុខងារ។" })
                                            : t("dashboard.upgrade.promo.description", { defaultValue: "ដំឡើងទៅកញ្ចប់ Pro/Premium ដើម្បីដក Logo MONEA និងមុខងារពិសេសៗ។" })
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
