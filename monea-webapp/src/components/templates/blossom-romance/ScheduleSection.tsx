import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Calendar } from 'lucide-react';
import { WeddingData } from '../types';

interface ScheduleSectionProps {
    wedding: WeddingData;
    primaryColor: string;
    title?: string;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ wedding, primaryColor }) => {
    const rawActivities = wedding.activities || [];
    if (rawActivities.length === 0) return null;

    return (
        <section className="py-14 px-4 sm:px-6 bg-[#FDFBF7] font-kantumruy relative overflow-hidden">
            <div className="max-w-md mx-auto relative z-10">
                {/* Activities List */}
                <div className="relative space-y-3 before:pointer-events-none before:absolute before:bottom-7 before:left-[12px] before:top-7 before:w-0.5 before:bg-amber-300/80">
                    {rawActivities.map((item, idx) => {
                        const isHeader = item.icon === "header" || (!item.time && !item.description);

                        if (isHeader) {
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="pt-6 pb-2 text-center relative"
                                >
                                    <div                                     className="inline-flex max-w-full items-center gap-2 border-y border-rose-200/80 py-2.5 text-[#881337] dark:text-rose-200">
                                        <Calendar size={14} className="text-rose-600" />
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
                                className="group relative ml-3 min-w-0 pl-6 sm:ml-4 sm:pl-7"
                            >
                                {/* Golden Node Icon */}
                                <div className="absolute -left-[13px] top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-amber-400 bg-[#FDFBF7] text-[10px] text-amber-900">
                                    <Sparkles size={11} className="fill-amber-900 text-amber-900" />
                                </div>

                                {/* Content Card */}
                                <div className="py-1 space-y-1">
                                    {item.time && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
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
