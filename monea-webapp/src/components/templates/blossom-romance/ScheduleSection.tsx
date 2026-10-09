import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Heart, Calendar } from 'lucide-react';
import { WeddingData } from '../types';

interface ScheduleSectionProps {
    wedding: WeddingData;
    primaryColor: string;
    title?: string;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ wedding, primaryColor, title }) => {
    const isEngagement = wedding.eventType === 'anniversary';

    const rawActivities = wedding.activities || [];
    if (rawActivities.length === 0) return null;

    return (
        <section className="py-14 px-4 sm:px-6 bg-[#FDFBF7] font-kantumruy relative overflow-hidden">
            <div className="max-w-md mx-auto relative z-10">
                {/* Title */}
                <div className="text-center space-y-2 mb-10">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#B45309] block">
                        {isEngagement 
                            ? (title || "កម្មវិធីសិរីមង្គលភ្ជាប់ពាក្យ")
                            : (title || "កម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍")}
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
                </div>

                {/* Activities List */}
                <div className="space-y-6">
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
                                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-200/80 shadow-sm text-[#881337] dark:text-rose-200">
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

                        // Regular Timeline Card
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="relative pl-6 sm:pl-7 border-l-2 border-amber-300/80 ml-3 sm:ml-4 group"
                            >
                                {/* Golden Node Icon */}
                                <div className="absolute -left-[14px] top-4 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-900 border-2 border-white shadow-md flex items-center justify-center text-[10px]">
                                    <Sparkles size={11} className="fill-amber-900 text-amber-900" />
                                </div>

                                {/* Content Card */}
                                <div className="bg-white/95 border border-rose-200/70 rounded-2xl p-4 shadow-sm group-hover:shadow-md transition-shadow space-y-1">
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
