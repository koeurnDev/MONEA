import React, { useState } from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { moneaClient } from "@/lib/api-client";
import { Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RSVPSection = ({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) => {
    const [name, setName] = useState(guestName || "");
    const [status, setStatus] = useState<'PENDING' | 'CONFIRMED' | 'DECLINED'>('PENDING');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || status === 'PENDING') return;

        setSubmitting(true);
        try {
            const res = await moneaClient.post('/api/rsvp/submit', {
                weddingId: wedding.id,
                name: name,
                status: status,
                adultsCount: status === 'CONFIRMED' ? 1 : 0
            });

            if (!res.error) {
                setSubmitted(true);
                if (status === 'CONFIRMED') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#000000', '#ffffff', '#64748b']
                    });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="py-32 bg-white relative">
            <div className="max-w-2xl mx-auto px-8 text-center">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-16 flex flex-col items-center"
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 uppercase">
                        RSVP
                    </h2>
                    <div className="w-12 h-1 bg-slate-900 mt-6" />
                </m.div>

                {submitted ? (
                    <m.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-50 p-12 text-center border border-slate-100"
                    >
                        <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 mb-4">Thank You</h3>
                        <p className="text-slate-500 font-medium">Your response has been recorded.</p>
                    </m.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <input
                                type="text"
                                placeholder="YOUR FULL NAME"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-slate-200 py-4 px-2 text-center text-xl font-bold uppercase tracking-widest text-slate-900 focus:outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-8">
                            <button
                                type="button"
                                onClick={() => setStatus('CONFIRMED')}
                                className={`flex flex-col items-center justify-center p-8 border-2 transition-all duration-300 ${status === 'CONFIRMED' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'}`}
                            >
                                <Check className="w-8 h-8 mb-4" />
                                <span className="text-sm font-black tracking-[0.2em] uppercase">Accept</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('DECLINED')}
                                className={`flex flex-col items-center justify-center p-8 border-2 transition-all duration-300 ${status === 'DECLINED' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'}`}
                            >
                                <X className="w-8 h-8 mb-4" />
                                <span className="text-sm font-black tracking-[0.2em] uppercase">Decline</span>
                            </button>
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={submitting || status === 'PENDING' || !name}
                                className="w-full bg-slate-900 text-white py-6 text-sm font-black tracking-[0.4em] uppercase hover:bg-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Submitting..." : "Send Reply"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};
