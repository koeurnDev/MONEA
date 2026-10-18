import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Calendar } from 'lucide-react';
import { WeddingData } from '../types';

interface ScheduleSectionProps {
    wedding: WeddingData;
    primaryColor: string;
    title?: string;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ wedding, title }) => {
    const rawActivities = wedding.activities || [];
    if (rawActivities.length === 0) return null;
    const hasHeader = rawActivities.some((item) => item.icon === "header" || (!item.time && !item.description));

    return (
        <section className="relative overflow-hidden bg-[#F4F9F6] px-4 py-12 font-kantumruy sm:px-6" style={{ backgroundColor: "var(--emerald-card-surface)" }}>
            <div className="relative z-10 mx-auto max-w-sm">
                {!hasHeader && (
                    <div className="mb-7 text-center">
                        <h2 className="font-khmer-moul text-xl leading-relaxed text-[#1B4332]">
                            {title || "កម្មវិធី"}
                        </h2>
                        <div className="mx-auto mt-2 h-0.5 w-12 bg-gradient-to-r from-transparent via-emerald-600 to-transparent" />
                    </div>
                )}
                <div className="space-y-4">
                    {rawActivities.map((item, idx) => {
                        const isHeader = item.icon === "header" || (!item.time && !item.description);

                        if (isHeader) {
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative pb-2 pt-4 text-center first:pt-0"
                                >
                                    <div className="inline-flex items-center gap-2 text-[#1B4332]">
                                        <Calendar size={14} className="text-emerald-700" />
                                        <span className="font-khmer-moul text-xs sm:text-sm tracking-wide">
                                            {item.title}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="text-xs text-muted-foreground mt-2 italic">
                                            {item.description}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        }

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="group relative ml-3 border-l-2 border-emerald-400/80 pl-6 sm:ml-4 sm:pl-7"
                            >
                                <div className="absolute -left-[14px] top-4 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                                    <Sparkles size={11} className="fill-white text-white" />
                                </div>

                                <div className="py-2 space-y-1">
                                    {item.time && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                                            <Clock size={12} />
                                            <span>{item.time}</span>
                                        </div>
                                    )}
                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                        {item.title}
                                    </h4>
                                    {item.description && (
                                        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
