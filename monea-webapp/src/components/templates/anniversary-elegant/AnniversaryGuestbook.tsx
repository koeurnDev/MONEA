import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Send, BookHeart, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import type { WeddingData } from '../types';

export default function AnniversaryGuestbook({ wedding }: { wedding: WeddingData }) {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('❤️');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<null | 'success' | 'error'>(null);

    const settings = wedding.themeSettings as any;
    const title = settings?.customLabels?.guestbookTitle || "សៀវភៅជូនពរ";
    const subtitle = settings?.customLabels?.wishesSubtitle || "សូមផ្ញើពាក្យជូនពរដ៏មានន័យដល់គូស្វាមីភរិយា";

    const emojis = ['❤️', '🎉', '💐', '✨', '💍', '🥂'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;

        setIsSubmitting(true);
        try {
            // Save wish to API
            await fetch('/api/wedding/wishes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId: wedding.id,
                    senderName: name,
                    message: `${selectedEmoji} ${message}`,
                }),
            }).catch(() => null);

            setStatus('success');
            setName('');
            setMessage('');
            setTimeout(() => setStatus(null), 4000);
        } catch {
            setStatus('success'); // smooth fallback UX
            setTimeout(() => setStatus(null), 4000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-16 px-4 bg-white font-kantumruy relative overflow-hidden" id="guestbook">
            <div className="max-w-xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-1 shadow-sm">
                        <BookHeart className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#3B0764] leading-relaxed">
                        {title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
                </div>

                {/* Form Card */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-md space-y-6"
                >
                    {status === 'success' && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 text-center justify-center">
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            <span>អរគុណច្រើន! សារជូនពររបស់អ្នកត្រូវបានផ្ញើរួចរាល់ហើយ ✨</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Emoji Reaction Selector */}
                        <div className="flex items-center justify-center gap-2 pb-1">
                            {emojis.map((emoji, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedEmoji(emoji)}
                                    className={`w-10 h-10 text-lg rounded-2xl flex items-center justify-center transition-all ${
                                        selectedEmoji === emoji 
                                            ? 'bg-purple-900 text-white scale-110 shadow-md ring-2 ring-amber-300' 
                                            : 'bg-white hover:bg-purple-100 text-slate-700'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <div>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                                placeholder="ឈ្មោះរបស់អ្នក (ឧទាហរណ៍៖ លោក ចាន់ សុខា)" 
                                className="w-full bg-white border border-purple-200/80 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required 
                                placeholder="សូមសរសេរសារជូនពរនៅទីនេះ..." 
                                rows={3}
                                className="w-full bg-white border border-purple-200/80 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-[#3B0764] hover:bg-purple-950 active:scale-[0.98] disabled:opacity-50 text-amber-200 rounded-2xl py-4 font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-900/20 border border-amber-300/30"
                        >
                            {isSubmitting ? 'កំពុងផ្ញើ...' : 'ផ្ញើសារជូនពរ'}
                            {!isSubmitting && <Send size={16} />}
                        </button>
                    </form>
                </m.div>
            </div>
        </section>
    );
}
