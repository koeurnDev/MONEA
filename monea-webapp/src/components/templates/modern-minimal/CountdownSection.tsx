import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { format, isValid } from 'date-fns';
import { km } from 'date-fns/locale';
import { WeddingData } from "../types";

export const CountdownSection = ({ wedding }: { wedding: WeddingData }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const target = new Date(wedding.date).getTime();
        const update = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, target - now);
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            });
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [wedding.date]);

    const eventDate = new Date(wedding.date);
    const formattedEventDate = isValid(eventDate)
        ? format(eventDate, "EEEE 'ទី' d 'ខែ' MMMM 'ឆ្នាំ' yyyy", { locale: km })
            .replace(/\d/g, (digit) => "០១២៣៤៥៦៧៨៩"[Number(digit)])
        : "";

    return (
        <section className="py-24 bg-slate-50 border-t border-b border-slate-100 flex flex-col items-center justify-center">
            <div className="grid grid-cols-4 gap-4 md:gap-12 max-w-3xl w-full px-6 text-center">
                {[
                    { label: 'Days', value: timeLeft.days },
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Minutes', value: timeLeft.minutes },
                    { label: 'Seconds', value: timeLeft.seconds }
                ].map((item, idx) => (
                    <m.div 
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center"
                    >
                        <div className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
                            {item.value.toString().padStart(2, '0')}
                        </div>
                        <div className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
                            {item.label}
                        </div>
                    </m.div>
                ))}
            </div>

            {formattedEventDate && (
                <p className="mt-8 px-4 text-center font-khmer-moul text-xs leading-relaxed text-[#77613a] sm:text-sm">
                    {formattedEventDate}
                </p>
            )}

            <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
                className="mt-16 text-center w-full"
            >
                <a 
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Wedding of ${wedding.groomName} and ${wedding.brideName}`)}&dates=${new Date(wedding.date).toISOString().replace(/-|:|\.\d\d\d/g, "")}/${new Date(new Date(wedding.date).getTime() + 6*60*60*1000).toISOString().replace(/-|:|\.\d\d\d/g, "")}&location=${encodeURIComponent(wedding.location || "Cambodia")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#9b8055]/30 bg-white/75 px-7 py-3 font-kantumruy text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 shadow-sm transition-colors hover:border-[#9b8055]/55 hover:bg-white hover:text-[#806744] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b8055] focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    រក្សាទុកក្នុងប្រតិទិន
                </a>
            </m.div>
        </section>
    );
};
