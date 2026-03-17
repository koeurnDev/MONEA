"use client";
import * as React from 'react';
import { Send, Heart, User, MessageSquare, Sparkles } from 'lucide-react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import useSWR from "swr";
import { moneaClient } from "@/lib/api-client";

export default function GuestbookSection({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const [name, setName] = React.useState(guestName || "");
    const [message, setMessage] = React.useState("");
    const [website, setWebsite] = React.useState(""); // Honeypot field
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const { data: wishes = [], mutate } = useSWR(
        wedding.id ? `/api/guestbook?weddingId=${wedding.id}` : null,
        { refreshInterval: 5000 }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim() || !wedding.id) return;

        setIsSubmitting(true);
        try {
            const res = await moneaClient.post('/api/guestbook', {
                weddingId: wedding.id,
                guestName: name,
                message: message,
                website: website // Send honeypot field
            });

            if (!res.error) {
                setMessage("");
                mutate();
            }
        } catch (error) {
            console.error("Failed to submit wish:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-32 md:py-64 bg-white relative overflow-hidden" id="wishes">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.03)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                
                {/* Header */}
                <div className="text-center mb-20 md:mb-32 space-y-6">
                    <div className="flex flex-col items-center space-y-2">
                        <p className="font-khmer text-[10px] md:text-sm tracking-[0.4em] text-gold/60 uppercase font-bold">មតិ និងពរជ័យ</p>
                        <div className="w-12 h-[1px] bg-gold/20" />
                    </div>
                    
                    <div className="relative inline-block py-2 overflow-visible">
                        <h2 className="font-khmer-moul text-3xl md:text-6xl text-gold-gradient drop-shadow-[0_2px_20px_rgba(212,175,55,0.25)] leading-loose py-10 px-6 overflow-visible">សៀវភៅពរជ័យ</h2>
                        <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-20 hidden md:block">
                            <Sparkles size={40} className="text-gold" />
                        </div>
                        <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-20 hidden md:block">
                            <Sparkles size={40} className="text-gold" />
                        </div>
                    </div>

                    <div className="max-w-md mx-auto space-y-6">
                        <div className="h-[1px] w-12 bg-gold/20 mx-auto" />
                        <p className="font-serif-elegant italic text-gray-400 text-lg md:text-xl leading-relaxed">
                            សូមសរសេរពាក្យជូនពររបស់អ្នកនៅទីនេះ<br/>
                            <span className="text-sm md:text-base opacity-70">ដើម្បីជាការចងចាំដ៏ល្អសម្រាប់យើងខ្ញុំ</span>
                        </p>
                    </div>
                </div>

                {/* Form */}
                <m.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto bg-stone-50/40 p-10 md:p-16 rounded-[4rem] border border-gold/10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] mb-32 relative backdrop-blur-sm"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-[4rem] pointer-events-none" />
                    <div className="relative z-10 space-y-8">
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gold/40" size={18} />
                            <input
                                type="text"
                                placeholder="ឈ្មោះរបស់អ្នក"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-14 bg-white border border-stone-200 rounded-2xl pl-12 pr-4 font-khmer-content text-sm focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all"
                                required
                            />
                        </div>
                        {/* Honeypot field - Hidden from users */}
                        <div className="hidden" aria-hidden="true">
                            <input 
                                type="text" 
                                name="website" 
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                tabIndex={-1} 
                                autoComplete="off"
                            />
                        </div>
                        <div className="relative">
                            <MessageSquare className="absolute left-5 top-6 text-gold/40" size={18} />
                            <textarea
                                placeholder="សរសេរពាក្យជូនពររបស់អ្នក..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-40 bg-white border border-stone-200 rounded-2xl pl-12 pr-4 pt-5 font-khmer-content text-sm focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all resize-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gold font-khmer-moul text-sm md:text-base rounded-2xl shadow-2xl hover:shadow-gold/10 hover:-translate-y-0.5 transition-all duration-500 flex items-center justify-center gap-4 disabled:opacity-50 group"
                        >
                            <span className="tracking-widest">{isSubmitting ? "កំពុងផ្ញើ..." : "ផ្ញើសារជូនពរ"}</span>
                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </m.form>

                {/* Wishes Slider */}
                <div className="relative group/slider">
                    <div className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                        {wishes.map((wish: any, idx: number) => (
                            <m.div
                                key={wish.id || idx}
                                initial={{ opacity: 0, scale: 0.98 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: (idx % 2) * 0.1 }}
                                viewport={{ once: true }}
                                className="min-w-[85vw] md:min-w-[450px] bg-white p-10 md:p-12 rounded-[3rem] border border-stone-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative group overflow-hidden hover:shadow-gold/10 transition-all duration-700 snap-center"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/[0.02] rounded-bl-[100%] transition-all group-hover:bg-gold/[0.05]" />
                                <Heart className="absolute -right-4 -top-4 text-red-500/5 opacity-0 group-hover:opacity-100 transition-all scale-150 rotate-12" size={80} />
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-stone-100 border border-gold/10 flex items-center justify-center text-gold font-bold font-playfair">
                                        {wish.guestName?.charAt(0)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-khmer-moul text-xs text-gray-800 tracking-wide">{wish.guestName}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            {mounted ? new Date(wish.createdAt).toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Phnom_Penh' }) : '...'}
                                        </p>
                                    </div>
                                </div>
                                <p className="font-khmer-content text-sm text-gray-600 leading-relaxed italic">
                                    &ldquo;{wish.message}&rdquo;
                                </p>
                            </m.div>
                        ))}
                        {wishes.length === 0 && (
                            <div className="w-full text-center py-20 border-2 border-dashed border-stone-100 rounded-[3rem]">
                                <p className="font-khmer-content text-gray-400">មិនទាន់មានពាក្យជូនពរនៅឡើយទេ។ ជាអ្នកដំបូងដែលផ្ញើសារជូនពរ!</p>
                            </div>
                        )}
                    </div>

                    {/* Hint for mobile */}
                    <div className="flex justify-center mt-4 md:hidden">
                        <p className="font-khmer text-[8px] text-gold/40 tracking-[0.4em] uppercase font-bold animate-pulse">អូសដើម្បីមើលបន្ថែម &rarr;</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
