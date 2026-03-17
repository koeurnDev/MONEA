import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, ArrowRight, Sparkles, Plus, LayoutDashboard, Clock, FileText, Crown, TrendingUp } from "lucide-react";
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
    // getServerUser is memoized, so these calls are efficient
    const user = await getServerUser();
    const userName = user?.name || (user?.email ? user.email.split('@')[0] : "");

    // Fetch wedding here to show badge in header
    const wedding = await prisma.wedding.findFirst({
        where: { userId: user?.userId },
        select: { id: true, packageType: true }
    });

    return (
        <div className="space-y-10 pb-10">
            {/* Header Area - Renders immediately with User data */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-muted-foreground bg-muted w-fit px-3 py-1 rounded-full uppercase">
                        <LayoutDashboard size={12} />
                        CONTROL PANEL
                    </div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-kantumruy">
                            {userName ? `សួស្តី, ${userName}` : 'ផ្ទាំងគ្រប់គ្រង'}
                        </h2>
                        {wedding?.packageType === "PREMIUM" && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20 shadow-sm animate-in fade-in slide-in-from-left-4 duration-1000">
                                <Crown size={12} className="fill-amber-600" />
                                <span className="text-[10px] font-black tracking-wider uppercase">Premium</span>
                            </div>
                        )}
                    </div>
                    <p className="text-muted-foreground font-bold font-kantumruy text-sm md:text-lg opacity-60">
                        {userName ? 'តើអ្នកមានអ្វីថ្មីសម្រាប់ថ្ងៃនេះ?' : 'មើលទិន្នន័យសង្ខេបនៃពិធីមង្គលការរបស់អ្នក។'}
                    </p>
                </div>
                <Link href="/dashboard/guests" className="w-fit">
                    <Button variant="outline" className="h-9 px-6 gap-2 border-primary/20 hover:border-primary/50 text-primary rounded-xl transition-all hover:bg-primary/5 active:scale-95 shadow-sm">
                        <Plus className="w-4 h-4" />
                        <span className="font-bold font-kantumruy text-xs">បន្ថែមភ្ញៀវ</span>
                    </Button>
                </Link>
            </div >

            <Suspense fallback={<DashboardDataSkeleton />}>
                <DashboardUserView wedding={wedding} />
            </Suspense>
        </div >
    );
}

async function DashboardUserView({ wedding }: { wedding: any }) {
    // ----------------------------------------------------------------------
    // NEW USER VIEW: No Wedding Created Yet
    // ----------------------------------------------------------------------
    if (!wedding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center animate-pulse">
                    <Plus className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold font-kantumruy">កំពុងរៀបចំ...</h3>
                    <p className="text-sm text-muted-foreground font-kantumruy">សូមរង់ចាំបន្តិច ដើម្បីចាប់ផ្តើមបង្កើតកម្មវិធីមង្គលការរបស់អ្នក។</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Suspense fallback={<div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-[120px] rounded-[2rem]" /><Skeleton className="h-[120px] rounded-[2rem]" /><Skeleton className="h-[120px] rounded-[2rem]" /></div>}>
                <SafeBoundary name="Dashboard Stats">
                    <DashboardDataView weddingId={wedding.id} />
                </SafeBoundary>
            </Suspense>

            {/* Smart Analytics & Insights */}
            <div className="space-y-6 mt-10">
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-muted-foreground bg-muted w-fit px-3 py-1 rounded-full uppercase">
                    <TrendingUp size={12} className="text-emerald-500" />
                    SMART INSIGHTS
                </div>
                <SafeBoundary name="Analytics Charts">
                    <AnalyticsDashboard weddingId={wedding.id} />
                </SafeBoundary>
            </div>

            <div className="grid gap-8 lg:grid-cols-7 mt-10">
                <div className="lg:col-span-4 space-y-8">
                    <QuickInviteCard weddingId={wedding.id} />
                    <QRCodeCard weddingId={wedding.id} />
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.07)] rounded-[2rem] p-5 md:p-8 bg-card">
                        <CardHeader className="pb-8 p-0 mb-8 border-b border-border">
                            <CardTitle className="text-xl font-bold font-kantumruy text-foreground tracking-tight flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                ការវិភាគ និង នាំចេញទិន្នន័យ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 p-0">
                            <QuickExportCards weddingId={wedding.id} />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.07)] rounded-[2rem] p-5 md:p-6 bg-card">
                        <CardHeader className="pb-6 p-0 mb-6 font-bold font-kantumruy">ប្រតិបត្តិការរហ័ស</CardHeader>
                        <CardContent className="grid gap-4 p-0">
                            {[
                                { href: "/dashboard/guests", label: "គ្រប់គ្រងភ្ញៀវ", icon: Users, color: "bg-blue-50 text-blue-600" },
                                { href: "/dashboard/schedule", label: "កាលវិភាគកម្មវិធី", icon: Clock, color: "bg-muted text-muted-foreground" },
                                { href: "/dashboard/reports", label: "របាយការណ៍ហិរញ្ញវត្ថុ", icon: FileText, color: "bg-emerald-50 text-emerald-600" }
                            ].map((action, i) => (
                                <Link key={i} href={action.href} className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 hover:bg-muted/80 transition-all border border-transparent hover:border-border">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center shadow-sm`}>
                                            <action.icon size={20} />
                                        </div>
                                        <span className="font-bold text-foreground font-kantumruy text-sm">{action.label}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {wedding.packageType !== "PREMIUM" && (
                        <Link href="/dashboard/upgrade">
                            <div className="rounded-[2.5rem] p-8 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden relative">
                                <Crown className="absolute -right-4 -top-4 w-24 h-24 text-amber-500/10 rotate-12" />
                                <div className="relative z-10 space-y-4">
                                    <Crown size={32} className="text-amber-500" />
                                    <h4 className="text-lg font-bold font-kantumruy">
                                        {wedding.packageType === "PRO" ? "ចង់ដក Logo MONEA ចេញមែនទេ?" : "ចង់បានមុខងារច្រើនជាងនេះ?"}
                                    </h4>
                                    <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                                        {wedding.packageType === "PRO" ? "ដំឡើងទៅគម្រោងកម្រិតខ្ពស់" : "ដំឡើងឥឡូវនេះ"}
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
