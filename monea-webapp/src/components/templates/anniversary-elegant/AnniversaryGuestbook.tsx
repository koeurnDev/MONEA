"use client";
import React, { useState } from 'react';
import type { WeddingData } from '../types';
import { Send, BookHeart } from 'lucide-react';

export default function AnniversaryGuestbook({ wedding }: { wedding: WeddingData }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<null | 'success' | 'error'>(null);
    const settings = wedding.themeSettings as any;
    const title = settings?.customLabels?.guestbookTitle || "សៀវភៅភ្ញៀវ";
    const subtitle = settings?.customLabels?.wishesSubtitle || "សូមបន្សល់ទុកនូវពាក្យជូនពរដ៏មានន័យ";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call for now (can hook up to real API later if needed)
        setTimeout(() => {
            setIsSubmitting(false);
            setStatus('success');
            (e.target as HTMLFormElement).reset();
            setTimeout(() => setStatus(null), 3000);
        }, 1500);
    };

    return (
        <div className="py-20 px-6 bg-purple-50/30 flex flex-col items-center justify-center font-kantumruy" id="guestbook">
            <div className="max-w-xl mx-auto w-full space-y-12">
                
                <div className="flex flex-col items-center gap-3 text-center">
                    <BookHeart className="w-8 h-8 text-purple-400" />
                    <h2 className="text-2xl md:text-3xl font-black text-purple-900 tracking-wider font-khmer-moul">
                        {title}
                    </h2>
                    <p className="text-sm text-purple-900/60 font-medium">{subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 space-y-6">
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            name="name" 
                            required 
                            placeholder="ឈ្មោះរបស់អ្នក" 
                            className="w-full bg-slate-50 border-transparent focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                        />
                        <textarea 
                            name="message" 
                            required 
                            placeholder="សរសេរសារជូនពរនៅទីនេះ..." 
                            rows={4}
                            className="w-full bg-slate-50 border-transparent focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white rounded-2xl py-4 font-bold tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-200"
                    >
                        {isSubmitting ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនសារ'}
                        {!isSubmitting && <Send size={18} />}
                    </button>
                    
                    {status === 'success' && (
                        <p className="text-center text-sm text-green-600 font-bold bg-green-50 py-3 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-2">
                            អរគុណសម្រាប់សារជូនពរ!
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
