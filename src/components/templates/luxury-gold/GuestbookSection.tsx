import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GuestbookSectionProps {
    weddingId: string;
}

export default function GuestbookSection({ weddingId }: GuestbookSectionProps) {
    const [guestName, setGuestName] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        try {
            const res = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guestName, message, weddingId }),
            });
            if (res.ok) {
                setSubmitStatus('success');
                setGuestName('');
                setMessage('');
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error(error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: "easeOut" as any }
    };

    return (
        <motion.section id="rsvp-section" className="py-24 px-6 bg-[#0a0a0a] relative" {...fadeInUp}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>

            <h3 className="text-center text-3xl mb-12 font-header text-[#D4AF37]">សៀវភៅជូនពរ</h3>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="ឈ្មោះរបស់អ្នក"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full p-4 border-b border-[#D4AF37]/50 bg-transparent text-white text-sm font-khmer placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        required
                    />
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-focus-within:w-full"></span>
                </div>

                <div className="relative group">
                    <textarea
                        placeholder="សរសេរពាក្យជូនពរ..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-4 border-b border-[#D4AF37]/50 bg-transparent text-white text-sm h-32 font-khmer placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                        required
                    ></textarea>
                    <span className="absolute bottom-2 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-focus-within:w-full"></span>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#D4AF37] text-black py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-all disabled:opacity-50 font-header shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
                >
                    {isSubmitting ? 'កំពុងផ្ញើ...' : 'ផ្ញើពាក្យជូនពរ'}
                </button>
                {submitStatus === 'success' && <p className="text-center text-[#D4AF37] text-xs mt-4 font-khmer">✨ អរគុណសម្រាប់ការជូនពរ! ✨</p>}
                {submitStatus === 'error' && <p className="text-center text-red-500 text-xs mt-4 font-khmer">មានបញ្ហាបន្តិចបន្តួច សូមព្យាយាមម្តងទៀត។</p>}
            </form>
        </motion.section>
    );
}
