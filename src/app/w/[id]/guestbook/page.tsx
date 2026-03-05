export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { submitGuestbookEntry } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, User, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";

async function getMessages(weddingId: string) {
    return await prisma.guestbookEntry.findMany({
        where: { weddingId },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function GuestbookPage({ params }: { params: { id: string } }) {
    const messages = await getMessages(params.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-gray-900 dark:via-black dark:to-gray-800 p-6 pb-28 font-siemreap">
            <div className="max-w-md mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2 pt-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm mb-4">
                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-moul bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400">
                        សៀវភៅជូនពរ
                    </h1>
                    <p className="text-muted-foreground text-sm">Sharing love & wishes</p>
                </div>

                {/* Form Section */}
                <GlassCard className="p-6" gradient>
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-bold font-moul text-gray-800 dark:text-gray-100">សរសេរពាក្យជូនពរ</h2>
                    </div>

                    <form action={submitGuestbookEntry} className="space-y-5">
                        <input type="hidden" name="weddingId" value={params.id} />

                        <div className="space-y-2 group">
                            <label className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ឈ្មោះរបស់អ្នក (Your Name)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                <Input
                                    name="guestName"
                                    placeholder="ឈ្មោះភ្ញៀវ"
                                    className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-rose-300 focus:ring-rose-200 dark:bg-black/20 dark:border-white/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ពាក្យជូនពរ (Wishes)</label>
                            {/* Honeypot field - hidden from users, filled by bots */}
                            <div className="hidden" aria-hidden="true">
                                <input name="website_url" type="text" tabIndex={-1} autoComplete="off" />
                            </div>
                            <Textarea
                                name="message"
                                placeholder="សូមជូនពរ..."
                                className="min-h-[120px] bg-white/50 border-gray-200 focus:border-rose-300 focus:ring-rose-200 resize-none dark:bg-black/20 dark:border-white/10"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:opacity-90 transition-opacity text-white h-12 rounded-xl text-lg font-medium shadow-lg shadow-rose-200 dark:shadow-rose-900/20">
                            ផ្ញើជូនពរ (Send Wishes)
                        </Button>
                    </form>
                </GlassCard>

                {/* Messages List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            ពាក្យជូនពរថ្មីៗ <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full dark:bg-rose-900/30 dark:text-rose-300">{messages.length}</span>
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {messages.map((msg) => (
                            <GlassCard key={msg.id} className="p-5 hover:scale-[1.02] transition-transform">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-rose-700 font-bold border border-white shadow-sm shrink-0 dark:from-rose-900 dark:to-orange-900 dark:text-rose-100 dark:border-white/10">
                                        {msg.guestName[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="font-bold text-gray-900 dark:text-gray-100 font-moul text-sm">
                                            {msg.guestName}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                            {msg.message}
                                        </p>
                                        <p className="text-xs text-gray-400 pt-2">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    {messages.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-gray-800">
                                <MessageSquare className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium">មិនទាន់មានពាក្យជូនពរទេ</p>
                            <p className="text-gray-300 text-sm"> jadilah yang pertama mengirim ucapan!</p>
                        </div>
                    )}
                </div>

                <div className="text-center pb-4">
                    <a href={`/w/${params.id}`} className="text-xs font-medium text-gray-400 hover:text-rose-500 transition-colors uppercase tracking-widest">
                        ← Back to Wedding
                    </a>
                </div>
            </div>

            {/* New Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
