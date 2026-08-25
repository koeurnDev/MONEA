import * as React from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import useSWR from "swr";
import { moneaClient } from "@/lib/api-client";

export const GuestbookSection = ({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) => {
    const [name, setName] = React.useState(guestName || "");
    const [message, setMessage] = React.useState("");
    const [website, setWebsite] = React.useState(""); // Honeypot
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { data: wishes = [], mutate } = useSWR(
        wedding.id ? `/api/guestbook?weddingId=${wedding.id}` : null,
        { refreshInterval: 30000 }
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
        <section className="py-24 md:py-32 bg-slate-50 border-t border-slate-200 relative overflow-hidden" id="wishes">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                
                {/* Header */}
                <m.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-2xl md:text-4xl font-kantumruy font-bold text-slate-900 tracking-normal mb-4">
                        សៀវភៅជូនពរ
                    </h2>
                    <div className="w-12 h-1 bg-[#805C00] mx-auto mb-6" />
                    <p className="text-slate-500 font-kantumruy">
                        សូមលោកអ្នកជួយផ្តល់ជាសារជូនពរ និងពាក្យពេចន៍ល្អៗដល់គូស្វាមីភរិយាថ្មី
                    </p>
                </m.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    
                    {/* Form Section */}
                    <m.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-5"
                    >
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            {/* Honeypot */}
                            <input 
                                type="url" 
                                name="website" 
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="hidden" 
                                tabIndex={-1} 
                                autoComplete="off" 
                            />

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">ឈ្មោះរបស់អ្នក</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="EX: ឯកឧត្តម លោកជំទាវ..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-kantumruy focus:outline-none focus:ring-2 focus:ring-[#805C00]/30 focus:border-[#805C00] transition-all placeholder:text-slate-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">សារជូនពរ</label>
                                    <textarea 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={4}
                                        placeholder="សរសេរសារជូនពរនៅទីនេះ..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-kantumruy resize-none focus:outline-none focus:ring-2 focus:ring-[#805C00]/30 focus:border-[#805C00] transition-all placeholder:text-slate-500"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !name || !message}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-slate-400 disabled:text-white disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            បញ្ជូនសារ
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </m.div>

                    {/* Wishes Display Section */}
                    <m.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-7 w-full overflow-hidden"
                    >
                        <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory custom-scrollbar -mx-6 px-6 md:mx-0 md:px-0 md:pb-4">
                            {Array.isArray(wishes) && wishes.length > 0 ? (
                                wishes.map((wish: any, idx: number) => (
                                    <m.div 
                                        key={wish.id || idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="min-w-[85vw] md:min-w-[320px] max-w-[85vw] md:max-w-[350px] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all snap-center flex-shrink-0 flex flex-col"
                                    >
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-[#805C00]/10 text-[#805C00] flex items-center justify-center flex-shrink-0">
                                                <span className="font-bold">{wish.guestName?.charAt(0) || "U"}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 font-kantumruy mb-1">{wish.guestName}</h4>
                                                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold tracking-widest uppercase">
                                                    <MessageSquare size={10} />
                                                    {new Date(wish.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-800 font-kantumruy text-[15px] leading-relaxed whitespace-pre-wrap flex-1">
                                            {wish.message}
                                        </p>
                                    </m.div>
                                ))
                            ) : (
                                <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500 space-y-4 bg-white/50 rounded-2xl border border-slate-100 border-dashed">
                                    <MessageSquare size={48} className="opacity-30" />
                                    <p className="font-kantumruy font-medium text-lg">មិនទាន់មានសារជូនពរនៅឡើយទេ</p>
                                </div>
                            )}
                        </div>
                    </m.div>
                </div>
            </div>
            
            {/* Custom Scrollbar CSS inline for quick styling */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 10px;
                }
            `}} />
        </section>
    );
};
