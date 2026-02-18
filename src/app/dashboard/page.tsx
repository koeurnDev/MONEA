import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, DollarSign, ArrowRight, Sparkles, Plus, LayoutDashboard, Clock, FileText, Crown } from "lucide-react";
import { QRCodeCard } from "@/components/QRCodeCard";
import { InvitationLinkCard } from "@/components/dashboard/InvitationLinkCard";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const token = cookies().get("token")?.value;
    let userId = "";
    let userName = "";

    if (token) {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded === 'object') {
            userId = (decoded as any).userId;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true }
            });
            userName = user?.name || "";
        }
    }

    // Fetch wedding for current user
    let wedding = null;
    if (userId) {
        wedding = await prisma.wedding.findFirst({ where: { userId } });
    }

    // Parallelize dependent queries
    const [guestCount, guestsOpened, giftSumUSD, giftSumKHR] = wedding ? await Promise.all([
        prisma.guest.count({ where: { weddingId: wedding.id } }),
        prisma.guest.count({ where: { weddingId: wedding.id, views: { gt: 0 } } }),
        prisma.gift.aggregate({
            _sum: { amount: true },
            where: { currency: "USD", weddingId: wedding.id },
        }),
        prisma.gift.aggregate({
            _sum: { amount: true },
            where: { currency: "KHR", weddingId: wedding.id },
        })
    ]) : [0, 0, { _sum: { amount: 0 } }, { _sum: { amount: 0 } }];

    // ----------------------------------------------------------------------
    // NEW USER VIEW: No Wedding Created Yet
    // ----------------------------------------------------------------------
    if (!wedding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-100 blur-2xl rounded-full scale-150 opacity-50 animate-pulse" />
                    <div className="relative w-28 h-28 bg-white border border-red-50 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-red-100/50 rotate-3">
                        <Sparkles className="w-14 h-14 text-red-600" />
                    </div>
                </div>
                <div className="max-w-xl space-y-4 relative">
                    <h2 className="text-4xl font-black font-kantumruy text-slate-900 tracking-tight">
                        ស្វាគមន៍មកកាន់ MONEA!
                    </h2>
                    <p className="text-lg text-slate-500 font-medium font-kantumruy leading-relaxed">
                        ចាប់ផ្តើមបង្កើតកម្មវិធីមង្គលការរបស់អ្នកឥឡូវនេះ ដើម្បីទទួលបានធៀបឌីជីថល និងមុខងារគ្រប់គ្រងដ៏ទំនើប។
                    </p>
                </div>

                <Link href="/dashboard/create">
                    <Button size="lg" className="h-16 px-10 text-lg gap-3 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-6 h-6" />
                        បង្កើតកម្មវិធីមង្គលការ (Create Wedding)
                    </Button>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16 text-left">
                    {[
                        { icon: Users, title: "គ្រប់គ្រងភ្ញៀវ", desc: "បង្កើតបញ្ជីភ្ញៀវ និងតាមដានអ្នកចូលរួមយ៉ាងងាយស្រួល។", color: "text-blue-600", bg: "bg-blue-50" },
                        { icon: DollarSign, title: "គ្រប់គ្រងចំណងដៃ", desc: "កត់ត្រាចំណងដៃ និងមើលរបាយការណ៍ហិរញ្ញវត្ថុ។", color: "text-red-600", bg: "bg-red-50" },
                        { icon: Sparkles, title: "ធៀបឌីជីថល", desc: "ធៀបការដ៏ស្រស់ស្អាត ជាមួយ QR Code ផ្ទាល់ខ្លួន។", color: "text-slate-900", bg: "bg-slate-50" }
                    ].map((feature, i) => (
                        <Card key={i} className="border-none bg-white shadow-sm hover:shadow-md transition-shadow rounded-3xl p-2 group">
                            <CardHeader className="p-6">
                                <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-lg font-bold font-kantumruy text-slate-900">{feature.title}</CardTitle>
                                <CardContent className="p-0 mt-2 text-sm text-slate-500 font-medium leading-relaxed font-kantumruy">
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
                    <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-500 bg-slate-100 w-fit px-4 py-1.5 rounded-full">
                        <LayoutDashboard size={14} />
                        CONTROL PANEL
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-kantumruy leading-relaxed">
                        {userName ? `សួស្តី, ${userName}` : 'ផ្ទាំងគ្រប់គ្រង'}
                    </h2>
                    <p className="text-slate-600 font-medium font-kantumruy text-lg">
                        {userName ? 'តើអ្នកមានអ្វីថ្មីសម្រាប់ថ្ងៃនេះ?' : 'មើលទិន្នន័យសង្ខេបនៃពិធីមង្គលការរបស់អ្នក។'}
                    </p>
                </div>
                <Link href="/dashboard/guests">
                    <Button className="h-12 px-8 gap-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-5 h-5" />
                        <span className="font-bold font-kantumruy text-base">បន្ថែមភ្ញៀវ</span>
                    </Button>
                </Link>
            </div >

            {/* Stats Overview */}
            < div className="grid gap-6 md:grid-cols-3" >
                {
                    [
                        { label: "ភ្ញៀវសរុប", value: guestCount, sub: "បានឆ្លើយតប", icon: Users, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100" },
                        { label: "ចំណងដៃ USD", value: `$${(giftSumUSD._sum.amount || 0).toLocaleString()}`, sub: "សាច់ប្រាក់ និង ធនាគារ", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100" },
                        { label: "ចំណងដៃ Riel", value: `${(giftSumKHR._sum.amount || 0).toLocaleString()} ៛`, sub: "សាច់ប្រាក់ និង ធនាគារ", icon: (props: any) => <span className="font-bold text-lg">៛</span>, color: "text-slate-900", bg: "bg-slate-50/50", border: "border-slate-100" }
                    ].map((stat, i) => (
                        <Card key={i} className={`border ${stat.border} shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group relative bg-white`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-bl-[4rem] -mr-6 -mt-6 transition-transform group-hover:scale-110 opacity-50`} />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-slate-600 font-kantumruy">{stat.label}</CardTitle>
                                <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-sm`}>
                                    {(() => {
                                        const Icon = stat.icon as any;
                                        return <Icon size={20} />;
                                    })()}
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 pt-4">
                                <div className={`text-4xl font-bold font-kantumruy ${stat.color === 'text-emerald-600' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {stat.value}
                                </div>
                                <p className="text-sm font-medium text-slate-500 mt-2 font-kantumruy">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    ))
                }
            </div >

            <div className="grid gap-8 lg:grid-cols-7">
                <div className="lg:col-span-4 space-y-8">
                    {/* Invitation Link & QR */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-1">
                        <InvitationLinkCard weddingId={wedding.id} />
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-1">
                        <QRCodeCard weddingId={wedding.id} />
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    {/* Analytics & Exports */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-8 bg-white">
                        <CardHeader className="pb-8 p-0 mb-8 border-b border-slate-50">
                            <CardTitle className="text-xl font-bold font-kantumruy text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                </div>
                                ការវិភាគ និង នាំចេញទិន្នន័យ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 p-0">
                            {/* Engagement Mini Chart (Pure CSS/SVG) */}
                            <div className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                                        <circle
                                            cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 * (1 - (wedding ? (guestsOpened / Math.max(guestCount, 1)) : 0))}
                                            strokeLinecap="round"
                                            className="text-indigo-600 transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-black text-slate-900 leading-none">
                                            {guestCount > 0 ? Math.round((guestsOpened / guestCount) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-slate-900 font-kantumruy text-lg">អត្រាអ្នកបើកមើលសំបុត្រ</span>
                                    <span className="text-sm font-medium text-slate-500 font-kantumruy">
                                        {guestsOpened} នាក់ បានបើកមើល ក្នុងចំណោម {guestCount} នាក់
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href={`/api/admin/export/guests?weddingId=${wedding.id}`}
                                    className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-blue-50/50 hover:bg-blue-100 transition-all group border border-transparent hover:border-blue-100 text-center"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users size={24} />
                                    </div>
                                    <span className="font-bold text-blue-900 font-kantumruy text-sm">បញ្ជីភ្ញៀវ (CSV)</span>
                                </a>

                                <a
                                    href={`/api/admin/export/gifts?weddingId=${wedding.id}`}
                                    className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-emerald-50/50 hover:bg-emerald-100 transition-all group border border-transparent hover:border-emerald-100 text-center"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <DollarSign size={24} />
                                    </div>
                                    <span className="font-bold text-emerald-900 font-kantumruy text-sm">បញ្ជីចំណងដៃ (CSV)</span>
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] p-6 bg-white">
                        <CardHeader className="pb-6 p-0 mb-6">
                            <CardTitle className="text-lg font-bold font-kantumruy text-slate-900 tracking-tight flex items-center gap-2">
                                <Plus className="w-5 h-5 text-slate-400" />
                                ប្រតិបត្តិការរហ័ស
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 p-0">
                            {[
                                { href: "/dashboard/guests", label: "គ្រប់គ្រងភ្ញៀវ", sub: "បន្ថែម, កែប្រែ, លុប", icon: Users, color: "bg-blue-50 text-blue-600" },
                                { href: "/dashboard/schedule", label: "កាលវិភាគកម្មវិធី", sub: "ម៉ោង និង សកម្មភាព", icon: Clock, color: "bg-slate-50 text-slate-600" },
                                { href: "/dashboard/reports", label: "របាយការណ៍ហិរញ្ញវត្ថុ", sub: "សរុប និង នាំចេញ (Export)", icon: FileText, color: "bg-emerald-50 text-emerald-600" }
                            ].map((action, i) => (
                                <Link key={i} href={action.href} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 hover:bg-slate-100 transition-all group border border-transparent hover:border-slate-200">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                            <action.icon size={24} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-900 font-kantumruy text-base">{action.label}</span>
                                            <span className="text-xs font-medium text-slate-400 font-kantumruy">{action.sub}</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Pro Tip/Banner */}
                    <Link href="/dashboard/upgrade">
                        <div className="relative group overflow-hidden rounded-[2.5rem] p-8 bg-white border border-amber-100 text-slate-900 shadow-xl shadow-amber-100/20 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-amber-100/40">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-50 to-amber-100/50 blur-[60px] rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="relative z-10 flex flex-col gap-5">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                                    <Crown size={24} className="text-amber-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold font-kantumruy tracking-tight text-slate-800">ចង់បានមុខងារច្រើនជាងនេះ?</h4>
                                    <p className="text-slate-500 text-sm font-medium font-kantumruy leading-relaxed">ដំឡើងកញ្ចប់ Premium ដើម្បីទទួលបាន Themes ស្រស់ស្អាតជាងមុន និងគ្មានពាណិជ្ជកម្ម។</p>
                                </div>
                                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mt-2 bg-amber-50 w-fit px-4 py-2 rounded-xl border border-amber-100 group-hover:bg-amber-100 transition-colors">
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
