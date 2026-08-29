import { MessageSquare, Heart, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GuestbookForm } from "./GuestbookForm";
import { HydratedDate } from "@/components/shared/HydratedDate";
import { useParams } from "react-router-dom";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GuestbookPage() {
    const { id } = useParams();
    const { data: messagesResponse, error, isLoading } = useSWR(id ? `/api/guestbook?weddingId=${id}` : null, fetcher);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (error) return <div>Failed to load guestbook</div>;

    const messages = messagesResponse?.data || [];

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
                {id && <GuestbookForm weddingId={id} />}

                {/* Messages List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            ពាក្យជូនពរថ្មីៗ <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full dark:bg-rose-900/30 dark:text-rose-300">{messages.length}</span>
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {messages.map((msg: any) => (
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
                                            <HydratedDate date={msg.createdAt} />
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
                            <p className="text-gray-300 text-sm"> Be the first to send a wish!</p>
                        </div>
                    )}
                </div>

                <div className="text-center pb-8 pt-4">
                    <a href={`/w/${id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 shadow-xs border border-slate-200/60 dark:border-white/10 text-xs font-bold font-kantumruy text-rose-600 hover:text-rose-700 transition-colors">
                        ← ត្រឡប់ទៅកាន់ធៀបការ
                    </a>
                </div>
            </div>
        </div>
    );
}
