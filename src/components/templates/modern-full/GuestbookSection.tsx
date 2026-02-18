import React, { useState } from 'react';
import { Send, Heart, User, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { WeddingData } from "../types";

interface GuestbookSectionProps {
    wedding?: WeddingData;
    guestName?: string;
    primaryColor?: string;
    onNewWish?: () => void;
}

export default function GuestbookSection({ wedding, guestName, primaryColor, onNewWish }: GuestbookSectionProps) {
    const [name, setName] = useState(guestName || "");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wishes, setWishes] = useState<any[]>([]);

    // Fetch wishes
    React.useEffect(() => {
        if (wedding?.id) {
            fetch(`/api/guestbook?weddingId=${wedding.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setWishes(data);
                })
                .catch(err => console.error("Failed to fetch wishes:", err));
        }
    }, [wedding?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim() || !wedding?.id) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId: wedding.id,
                    guestName: name,
                    message: message
                })
            });

            if (res.ok) {
                const newWish = await res.json();
                setWishes([newWish, ...wishes]);
                setMessage("");
                if (!guestName) setName(""); // Keep name if it was pre-filled
                if (onNewWish) onNewWish();
                alert("Thank you for your warm wishes! 💖");
            }
        } catch (error) {
            console.error("Failed to submit wish:", error);
            alert("Sorry, failed to send wish. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 relative overflow-hidden" id="wishes">
            <div className="container mx-auto px-4 relative z-10 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles className="text-pink-300 w-5 h-5 animate-pulse" />
                            <p className="font-vibes text-[#D4AF37] text-3xl md:text-4xl">Guestbook</p>
                            <Sparkles className="text-pink-300 w-5 h-5 animate-pulse" />
                        </div>
                        <h3 className="text-3xl md:text-5xl text-white mt-2 drop-shadow-md font-kantumruy font-bold">ផ្ញើសារជូនពរ</h3>
                        <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto mt-4 font-kantumruy leading-relaxed">
                            សូមសរសេរពាក្យជូនពររបស់អ្នកនៅទីនេះ ដើម្បីជាការចងចាំដ៏ល្អសម្រាប់យើងខ្ញុំ។
                        </p>
                    </motion.div>
                </div>

                {/* Input Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-16 max-w-2xl mx-auto relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="space-y-6 relative z-10">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-200 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="ឈ្មោះរបស់អ្នក"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-pink-300/50 focus:bg-black/40 transition-all font-kantumruy"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <MessageSquare className="absolute left-4 top-6 text-pink-200 group-focus-within:text-white transition-colors" size={20} />
                            <textarea
                                placeholder="សរសេរពាក្យជូនពររបស់អ្នក..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-pink-300/50 focus:bg-black/40 transition-all h-32 resize-none font-kantumruy leading-relaxed"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white font-bold font-kantumruy shadow-lg hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative flex items-center gap-2">
                                {isSubmitting ? (
                                    <>កំពុងផ្ញើ...</>
                                ) : (
                                    <>
                                        ផ្ញើជូនពរ <Send size={18} />
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </motion.form>

                {/* Wishes Grid */}
                <div className="columns-1 md:columns-2 gap-6 space-y-6">
                    {wishes.map((wish: any, idx: number) => (
                        <motion.div
                            key={wish.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="break-inside-avoid bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group shadow-lg relative"
                        >
                            <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Heart size={20} className="text-pink-500 fill-pink-500 animate-pulse" />
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-white/20">
                                        {wish.guestName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold font-kantumruy text-sm tracking-wide">{wish.guestName}</h4>
                                        <span className="text-xs text-white/40">
                                            {new Date(wish.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-2 -top-2 text-4xl text-white/5 font-serif">"</span>
                                <p className="text-white/80 text-sm leading-relaxed font-kantumruy relative z-10 pl-2">
                                    {wish.message}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {wishes.length === 0 && (
                        <div className="col-span-full text-center text-white/50 py-10 font-kantumruy">
                            មិនទាន់មានពាក្យជូនពរនៅឡើយ។ អ្នកអាចជាអ្នកដំបូង!
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
