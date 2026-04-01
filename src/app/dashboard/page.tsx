import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, ArrowRight, Sparkles, Plus, LayoutDashboard, Clock, FileText, Crown, TrendingUp, ShieldCheck } from "lucide-react";
import { QRCodeCard } from "@/components/QRCodeCard";
import { QuickInviteCard } from "@/components/dashboard/QuickInviteCard";
import { getServerUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { DashboardDataView } from "./_components/DashboardDataView";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsDashboard } from "./_components/AnalyticsDashboard";
import { SafeBoundary } from "@/components/ui/SafeBoundary";
import { QuickExportCards } from "./_components/QuickExportCards";
import { getTranslations } from "@/i18n/server";
import { redirect } from "next/navigation";

// Re-compilation trigger: 2026-03-12T19:42:00
export const dynamic = 'force-dynamic';

function DashboardDataSkeleton() {
    return (
        <div className="space-y-10">
            <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-[120px] rounded-[2rem] w-full" />
                <Skeleton className="h-[120px] rounded-[2rem] w-full" />
                <Skeleton className="h-[120px] rounded-[2rem] w-full" />
            </div>
            <Skeleton className="h-[300px] rounded-[2rem] w-full" />
        </div>
    );
}

export default function DashboardPage() {
    return <DashboardContent />;
}

async function DashboardContent() {
    const t = getTranslations();
    const user = await getServerUser();
    
    if (!user) {
        redirect("/sign-in");
    }
    
    const userName = user?.name || (user?.email ? user.email.split('@')[0] : "");

    // Fetch wedding using standard Prisma client
    let wedding = null;
    let fetchError = false;
    try {
        wedding = await prisma.wedding.findFirst({
            where: { userId: user.userId },
            select: { id: true, packageType: true }
        });
    } catch (e: any) {
        fetchError = true;
    }

    // Redirect regular users to creation flow if NO wedding exists AND fetch succeeded
    if (!wedding && !fetchError && user.type === "user") {
        redirect("/dashboard/create");
    }

    const isPlatformAdmin = user.role === 'ADMIN' || user.role === 'STAFF';
    const welcomeText = isPlatformAdmin 
        ? t("dashboard.adminWelcome") 
        : (userName ? t("dashboard.welcome", { name: userName }) : t("dashboard.title"));
    const subtitleText = isPlatformAdmin 
        ? t("dashboard.adminSubtitle") 
        : (userName ? t("dashboard.greeting") : t("dashboard.summary"));

    if (fetchError && !wedding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <p className="text-amber-600 font-bold font-kantumruy">{t("common.errors.dbBusy") || "ប្រព័ន្ធកំពុងមមាញឹក សូមព្យាយាមម្តងទៀត (System Busy, retry)"}</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()} className="font-kantumruy">{t("common.actions.retry") || "ព្យាយាមម្តងទៀត"}</Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header Area - Renders immediately with User data */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2.5 text-[9px] font-black tracking-[0.2em] text-muted-foreground/60 bg-muted/50 w-fit px-3.5 py-1.5 rounded-xl uppercase border border-border/50">
                        <LayoutDashboard size={12} className="text-rose-600" />
                        {t("dashboard.controlPanel")}
                    </div>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground font-kantumruy leading-none">
                            {welcomeText}
                        </h2>
                        {wedding?.packageType === "PREMIUM" && (
                            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20 shadow-sm animate-in fade-in slide-in-from-left-4 duration-1000">
                                <Crown size={14} className="fill-amber-600" />
                                <span className="text-[10px] font-black tracking-widest uppercase">{t("common.labels.premium")}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-muted-foreground/60 font-black font-kantumruy text-sm md:text-lg tracking-tight">
                        {subtitleText}
                    </p>
                </div>
                {!isPlatformAdmin && (
                    <Link href="/dashboard/guests" className="w-full md:w-auto">
                        <Button className="h-12 w-full md:w-auto px-8 gap-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl transition-all shadow-md hover:scale-[1.02] active:scale-95">
                            <Plus className="w-5 h-5" />
                            <span className="font-extrabold font-kantumruy text-sm">{t("dashboard.actions.addGuest")}</span>
                        </Button>
                    </Link>
                )}
            </div >

            <Suspense fallback={<DashboardDataSkeleton />}>
                <DashboardUserView wedding={wedding} isPlatformAdmin={isPlatformAdmin} />
            </Suspense>
        </div >
    );
}

async function DashboardUserView({ wedding, isPlatformAdmin }: { wedding: any, isPlatformAdmin: boolean }) {
    const t = getTranslations();
    if (!wedding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-8">
                <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center animate-pulse border border-rose-500/20">
                    <Plus className="w-12 h-12 text-rose-600" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black font-kantumruy tracking-tight">{t("common.loading.preparing")}</h3>
                    <p className="text-muted-foreground/60 font-bold font-kantumruy max-w-xs leading-relaxed">{t("dashboard.empty.message")}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Suspense fallback={<div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-[120px] rounded-3xl" /><Skeleton className="h-[120px] rounded-3xl" /><Skeleton className="h-[120px] rounded-3xl" /></div>}>
                <SafeBoundary name="Dashboard Stats">
                    <DashboardDataView weddingId={wedding.id} />
                </SafeBoundary>
            </Suspense>

            {/* Smart Analytics & Insights */}
            <div className="space-y-6 mt-12">
                <div className="flex items-center gap-2.5 text-[9px] font-black tracking-[0.2em] text-muted-foreground/60 bg-muted/50 w-fit px-3.5 py-1.5 rounded-xl uppercase border border-border/50">
                    <TrendingUp size={12} className="text-emerald-500" />
                    {t("dashboard.smartInsights")}
                </div>
                <SafeBoundary name="Analytics Charts">
                    <AnalyticsDashboard weddingId={wedding.id} />
                </SafeBoundary>
            </div>

            <div className="grid gap-8 lg:grid-cols-7 mt-12">
                <div className="lg:col-span-4 space-y-8">
                    {/* Invitation Access Section */}
                    <Card className="border-none shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none rounded-[2.5rem] bg-card/50 backdrop-blur-sm overflow-hidden border border-white/5">
                        <CardHeader className="p-6 border-b border-border/50 bg-slate-50/50 dark:bg-white/5">
                            <CardTitle className="text-xl md:text-2xl font-black font-kantumruy text-foreground tracking-tight flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500/10 rounded-2xl">
                                    <Sparkles className="w-5 h-5 text-rose-600" />
                                </div>
                                {t("dashboard.cards.inviteCenter")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <QuickInviteCard weddingId={wedding.id} />
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                                <QRCodeCard weddingId={wedding.id} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <Card className="border border-border shadow-sm rounded-2xl bg-card overflow-hidden">
                        <CardHeader className="p-6 border-b border-border/50 bg-slate-50/50 dark:bg-white/5">
                            <CardTitle className="text-xl md:text-2xl font-black font-kantumruy text-foreground tracking-tight flex items-center gap-3">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                {t("dashboard.cards.dataExport")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <QuickExportCards weddingId={wedding.id} />
                        </CardContent>
                    </Card>

                    {!isPlatformAdmin && (
                        <Card className="border border-border shadow-sm rounded-2xl bg-card overflow-hidden">
                            <CardHeader className="p-6 border-b border-border/50 bg-slate-50/50 dark:bg-white/5">
                                <CardTitle className="text-xl md:text-2xl font-black font-kantumruy text-foreground tracking-tight flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    {t("dashboard.cards.billingStatus") || "គម្រោង និងការបង់ប្រាក់"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-emerald-600/70 tracking-widest">{t("dashboard.upgrade.currentPlan") || "គម្រោងបច្ចុប្បន្ន"}</p>
                                        <p className="font-black font-kantumruy text-lg text-emerald-700">
                                            {wedding.packageType === "PREMIUM" ? (t("common.labels.premium") || "Premium Master") : 
                                             wedding.packageType === "PRO" ? (t("common.labels.pro") || "Standard Pro") : 
                                             (t("common.labels.free") || "Free Plan")}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        {t("common.labels.active") || "ដំណើការ"}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-bold font-kantumruy">{t("dashboard.upgrade.paymentStatus") || "ស្ថានភាពបង់ប្រាក់"}</span>
                                        <span className="text-foreground font-black font-kantumruy text-emerald-600">
                                            {wedding.packageType !== "FREE" ? (t("dashboard.upgrade.messages.success") || "បង់រួចរាល់") : (t("dashboard.upgrade.labels.notPaid") || "មិនទាន់បង់")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-bold font-kantumruy">{t("dashboard.upgrade.support") || "ជំនួយបច្ចេកទេស"}</span>
                                        <span className="text-foreground font-black font-kantumruy">24/7 Priority</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!isPlatformAdmin && wedding.packageType !== "PREMIUM" && (
                        <Link href="/dashboard/upgrade">
                            <div className="group rounded-[2.5rem] p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-500/20 shadow-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer overflow-hidden relative">
                                <Crown className="absolute -right-8 -top-8 w-32 h-32 text-amber-500/5 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-[20deg] duration-700" />
                                <div className="relative z-10 space-y-5">
                                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-500/20">
                                        <Crown size={28} className="fill-current" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black font-kantumruy tracking-tight">
                                            {wedding.packageType === "PRO" ? t("dashboard.upgrade.promo.removeLogo") : t("dashboard.upgrade.promo.moreFeatures")}
                                        </h4>
                                        <p className="text-xs font-bold text-muted-foreground/70 font-kantumruy leading-relaxed">
                                            {t("dashboard.upgrade.promo.description")}
                                        </p>
                                    </div>
                                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black font-kantumruy h-11 text-sm shadow-md shadow-amber-200 dark:shadow-none">
                                        {wedding.packageType === "PRO" ? t("dashboard.upgrade.promo.toUpperPlan") : t("dashboard.upgrade.promo.cta")}
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            {/* Sticky Mobile Bottom Action Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-50">
                <Link href="/dashboard/guests">
                    <Button className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                        <Plus size={24} />
                        <span className="font-black font-kantumruy">{t("dashboard.actions.addGuest")}</span>
                    </Button>
                </Link>
            </div>
        </>
    );
}
