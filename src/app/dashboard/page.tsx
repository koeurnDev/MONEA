import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, ArrowRight, Sparkles, Plus, LayoutDashboard, Clock, FileText, Crown, TrendingUp } from "lucide-react";
import { QRCodeCard } from "@/components/QRCodeCard";
import { InvitationLinkCard } from "@/components/dashboard/InvitationLinkCard";
import { getServerUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import DashboardLoading from "./loading";
import { DashboardDataView } from "./_components/DashboardDataView";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsDashboard } from "./_components/AnalyticsDashboard";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
        </Suspense>
    );
}

async function DashboardContent() {
    // getServerUser is memoized, so these calls are efficient
    const user = await getServerUser();
    const userName = user?.name || (user?.email ? user.email.split('@')[0] : "");

    return (
        <div className="space-y-10 pb-10">
            {/* Header Area - Renders immediately with User data */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-muted-foreground bg-muted w-fit px-3 py-1 rounded-full uppercase">
                        <LayoutDashboard size={12} />
                        CONTROL PANEL
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-kantumruy">
                        {userName ? `សួស្តី, ${userName}` : 'ផ្ទាំងគ្រប់គ្រង'}
                    </h2>
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
                <DashboardUserView userId={user?.userId || ""} />
            </Suspense>
        </div >
    );
}

async function DashboardUserView({ userId }: { userId: string }) {
    if (!userId) return null;

    // Fetch wedding - This will Suspend DashboardUserView only
    const wedding = await prisma.wedding.findFirst({
        where: { userId },
        select: { id: true }
    });

    // ----------------------------------------------------------------------
    // NEW USER VIEW: No Wedding Created Yet
    // ----------------------------------------------------------------------
    if (!wedding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-950/20 blur-2xl rounded-full scale-150 opacity-50 animate-pulse" />
                    <div className="relative w-28 h-28 bg-card border border-border rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-red-100/50 dark:shadow-red-950/20 rotate-3">
                        <Sparkles className="w-14 h-14 text-red-600" />
                    </div>
                </div>
                <div className="max-w-xl space-y-4 relative">
                    <h2 className="text-4xl font-black font-kantumruy text-foreground tracking-tight">
                        ស្វាគមន៍មកកាន់ MONEA!
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium font-kantumruy leading-relaxed">
                        ចាប់ផ្តើមបង្កើតកម្មវិធីមង្គលការរបស់អ្នកឥឡូវនេះ ដើម្បីទទួលបានធៀបឌីជីថល និងមុខងារគ្រប់គ្រងដ៏ទំនើប។
                    </p>
                </div>

                <Link href="/dashboard/create">
                    <Button size="lg" className="h-16 px-10 text-lg gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-6 h-6" />
                        បង្កើតកម្មវិធីមង្គលការ (Create Wedding)
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <Suspense fallback={<div className="grid gap-6 md:grid-cols-3"><Skeleton className="h-[120px] rounded-[2rem]" /><Skeleton className="h-[120px] rounded-[2rem]" /><Skeleton className="h-[120px] rounded-[2rem]" /></div>}>
                <DashboardDataView weddingId={wedding.id} />
            </Suspense>

            {/* Smart Analytics & Insights */}
            <div className="space-y-6 mt-10">
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-muted-foreground bg-muted w-fit px-3 py-1 rounded-full uppercase">
                    <TrendingUp size={12} className="text-emerald-500" />
                    SMART INSIGHTS
                </div>
                <AnalyticsDashboard weddingId={wedding.id} />
            </div>

            <div className="grid gap-8 lg:grid-cols-7 mt-10">
                <div className="lg:col-span-4 space-y-8">
                    <InvitationLinkCard weddingId={wedding.id} />
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
                            <div className="grid grid-cols-2 gap-4">
                                <a href={`/api/admin/export/guests?weddingId=${wedding.id}`} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-100 transition-all border border-transparent hover:border-blue-100">
                                    <Users className="w-6 h-6 text-blue-600" />
                                    <span className="font-bold font-kantumruy text-sm">បញ្ជីភ្ញៀវ (CSV)</span>
                                </a>
                                <a href={`/api/admin/export/gifts?weddingId=${wedding.id}`} className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-100 transition-all border border-transparent hover:border-emerald-100">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                    <span className="font-bold font-kantumruy text-sm">បញ្ជីចំណងដៃ (CSV)</span>
                                </a>
                            </div>
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

                    <Link href="/dashboard/upgrade">
                        <div className="rounded-[2.5rem] p-8 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden relative">
                            <Crown className="absolute -right-4 -top-4 w-24 h-24 text-amber-500/10 rotate-12" />
                            <div className="relative z-10 space-y-4">
                                <Crown size={32} className="text-amber-500" />
                                <h4 className="text-lg font-bold font-kantumruy">ចង់បានមុខងារច្រើនជាងនេះ?</h4>
                                <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">Upgrade Now</Button>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}

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
