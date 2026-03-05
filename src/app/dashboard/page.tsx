import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, ArrowRight, Sparkles, Plus, LayoutDashboard, Clock, FileText, Crown } from "lucide-react";
import { QRCodeCard } from "@/components/QRCodeCard";
import { InvitationLinkCard } from "@/components/dashboard/InvitationLinkCard";
import { getServerUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import DashboardLoading from "./loading";
import { DashboardDataView } from "./_components/DashboardDataView";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
        </Suspense>
    );
}

async function DashboardContent() {
    const user = await getServerUser();

    let userName = "";
    let userId = "";
    let wedding: any = null;

    if (user) {
        userId = user.userId;
        userName = user.name || "";

        // Fetch wedding
        wedding = await prisma.wedding.findFirst({ where: { userId } });
    }

    // Sequential batches to avoid connection pool exhaustion
    let guestCount = 0;
    let guestsOpened = 0;
    let giftSumUSD: { _sum: { amount: number | null } } = { _sum: { amount: 0 } };
    let giftSumKHR: { _sum: { amount: number | null } } = { _sum: { amount: 0 } };

    if (wedding) {
        const [gc, go] = await Promise.all([
            prisma.guest.count({ where: { weddingId: wedding.id } }),
            prisma.guest.count({ where: { weddingId: wedding.id, views: { gt: 0 } } }),
        ]);
        guestCount = gc;
        guestsOpened = go;
    }

    // ----------------------------------------------------------------------
    // NEW USER VIEW: No Wedding Created Yet
    // ----------------------------------------------------------------------
    if (!wedding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10">
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl mt-16 text-left">
                    {[
                        { icon: Users, title: "គ្រប់គ្រងភ្ញៀវ", desc: "បង្កើតបញ្ជីភ្ញៀវ និងតាមដានអ្នកចូលរួមយ៉ាងងាយស្រួល។", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
                        { icon: DollarSign, title: "គ្រប់គ្រងចំណងដៃ", desc: "កត់ត្រាចំណងដៃ និងមើលរបាយការណ៍ហិរញ្ញវត្ថុ។", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" },
                        { icon: Sparkles, title: "ធៀបឌីជីថល", desc: "ធៀបការដ៏ស្រស់ស្អាត ជាមួយ QR Code ផ្ទាល់ខ្លួន។", color: "text-foreground", bg: "bg-muted" }
                    ].map((feature, i) => (
                        <Card key={i} className="border-none bg-card shadow-sm hover:shadow-md transition-shadow rounded-3xl p-1 group">
                            <CardHeader className="p-4 md:p-6">
                                <div className={`w-10 h-10 md:w-12 md:h-12 ${feature.bg} rounded-xl md:rounded-2xl flex items-center justify-center ${feature.color} mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <CardTitle className="text-sm md:text-lg font-bold font-kantumruy text-foreground">{feature.title}</CardTitle>
                                <CardContent className="p-0 mt-1 md:mt-2 text-[10px] md:text-sm text-muted-foreground font-medium leading-relaxed font-kantumruy">
                                    {feature.desc}
                                </CardContent>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // EXISTING USER VIEW: Dashboard
    // ----------------------------------------------------------------------
    return (
        <div className="space-y-10 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-muted-foreground bg-muted w-fit px-4 py-1.5 rounded-full">
                        <LayoutDashboard size={14} />
                        CONTROL PANEL
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-kantumruy leading-relaxed">
                        {userName ? `សួស្តី, ${userName}` : 'ផ្ទាំងគ្រប់គ្រង'}
                    </h2>
                    <p className="text-muted-foreground font-medium font-kantumruy text-lg">
                        {userName ? 'តើអ្នកមានអ្វីថ្មីសម្រាប់ថ្ងៃនេះ?' : 'មើលទិន្នន័យសង្ខេបនៃពិធីមង្គលការរបស់អ្នក។'}
                    </p>
                </div>
                <Link href="/dashboard/guests">
                    <Button className="h-12 px-8 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-5 h-5" />
                        <span className="font-bold font-kantumruy text-base">បន្ថែមភ្ញៀវ</span>
                    </Button>
                </Link>
            </div >

            <Suspense fallback={
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-[120px] rounded-[2rem] w-full" />
                    <Skeleton className="h-[120px] rounded-[2rem] w-full" />
                    <Skeleton className="h-[120px] rounded-[2rem] w-full" />
                </div>
            }>
                <DashboardDataView weddingId={wedding.id} guestCount={guestCount} guestsOpened={guestsOpened} />
            </Suspense>

            {/* Stats Overview extracted to Streaming Suspense DashboardDataView */}

            <div className="grid gap-8 lg:grid-cols-7">
                <div className="lg:col-span-4 space-y-8">
                    {/* Invitation Link & QR */}
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden p-1">
                        <InvitationLinkCard weddingId={wedding.id} />
                    </div>
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden p-1">
                        <QRCodeCard weddingId={wedding.id} />
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    {/* Analytics & Exports */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-card">
                        <CardHeader className="pb-8 p-0 mb-8 border-b border-border">
                            <CardTitle className="text-xl font-bold font-kantumruy text-foreground tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                </div>
                                ការវិភាគ និង នាំចេញទិន្នន័យ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 p-0">

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <a
                                    href={`/api/admin/export/guests?weddingId=${wedding.id}`}
                                    className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-800 text-center"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <span className="font-bold text-blue-900 dark:text-blue-100 font-kantumruy text-[10px] md:text-sm">បញ្ជីភ្ញៀវ (CSV)</span>
                                </a>

                                <a
                                    href={`/api/admin/export/gifts?weddingId=${wedding.id}`}
                                    className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all group border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800 text-center"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <span className="font-bold text-emerald-900 dark:text-emerald-100 font-kantumruy text-[10px] md:text-sm">បញ្ជីចំណងដៃ (CSV)</span>
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-6 bg-card">
                        <CardHeader className="pb-6 p-0 mb-6">
                            <CardTitle className="text-lg font-bold font-kantumruy text-foreground tracking-tight flex items-center gap-2">
                                <Plus className="w-5 h-5 text-muted-foreground/50" />
                                ប្រតិបត្តិការរហ័ស
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 p-0">
                            {[
                                { href: "/dashboard/guests", label: "គ្រប់គ្រងភ្ញៀវ", sub: "បន្ថែម, កែប្រែ, លុប", icon: Users, color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600" },
                                { href: "/dashboard/schedule", label: "កាលវិភាគកម្មវិធី", sub: "ម៉ោង និង សកម្មភាព", icon: Clock, color: "bg-muted text-muted-foreground" },
                                { href: "/dashboard/reports", label: "របាយការណ៍ហិរញ្ញវត្ថុ", sub: "សរុប និង នាំចេញ (Export)", icon: FileText, color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" }
                            ].map((action, i) => (
                                <Link key={i} href={action.href} className="flex items-center justify-between p-5 rounded-3xl bg-muted/30 hover:bg-muted/80 transition-all group border border-transparent hover:border-border">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                            <action.icon size={24} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-foreground font-kantumruy text-base">{action.label}</span>
                                            <span className="text-xs font-medium text-muted-foreground font-kantumruy">{action.sub}</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Pro Tip/Banner */}
                    <Link href="/dashboard/upgrade">
                        <div className="relative group overflow-hidden rounded-[2.5rem] p-8 bg-card border border-amber-100 dark:border-amber-900/50 text-foreground shadow-xl dark:shadow-amber-900/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-50 dark:from-amber-900 to-amber-100/50 dark:to-transparent blur-[60px] rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="relative z-10 flex flex-col gap-5">
                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center border border-amber-100 dark:border-amber-800 shadow-sm">
                                    <Crown size={24} className="text-amber-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold font-kantumruy tracking-tight text-foreground">ចង់បានមុខងារច្រើនជាងនេះ?</h4>
                                    <p className="text-muted-foreground text-sm font-medium font-kantumruy leading-relaxed">ដំឡើងកញ្ចប់ Premium ដើម្បីទទួលបាន Themes ស្រស់ស្អាតជាងមុន និងគ្មានពាណិជ្ជកម្ម។</p>
                                </div>
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-widest mt-2 bg-amber-50 dark:bg-amber-900/30 w-fit px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                                    Upgrade Now <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div >
    );
}
