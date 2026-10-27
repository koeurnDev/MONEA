import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Calendar } from 'lucide-react';
import { WeddingData } from '../types';

interface ScheduleSectionProps {
    wedding: WeddingData;
    primaryColor: string;
    title?: string;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ wedding, primaryColor, title }) => {
    const rawActivities = wedding.activities || [];
    if (rawActivities.length === 0) return null;

    return (
        <section id="schedule-fortune-harmony" className="relative overflow-hidden bg-transparent px-4 py-12 font-kantumruy text-[#2d352b] sm:px-6 sm:py-14">
            <div className="max-w-md mx-auto relative z-10">
                <header className="mb-7 text-center">
                    <Calendar aria-hidden="true" className="mx-auto mb-2 h-5 w-5 text-[#67805f]" />
                    <h2 className="fh-khmer-safe font-khmer-moul text-xl leading-relaxed text-[#2d352b] sm:text-2xl">
                        {title || "កម្មវិធី"}
                    </h2>
                    <div className="mx-auto mt-3 h-px w-12 bg-[#8ea07a]/70" />
                </header>
                {/* Activities List */}
                <div className="relative space-y-3 before:pointer-events-none before:absolute before:bottom-7 before:left-[12px] before:top-7 before:w-0.5 before:bg-[#8ea07a]/80">
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
                                    <div className="inline-flex max-w-full items-center justify-center gap-2 py-2.5 text-center text-[#4d5649]">
                                        <Calendar size={14} className="text-[#67805f]" />
                                        <span className="fh-khmer-safe break-words font-khmer-moul text-sm sm:text-base">
                                            {item.title}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="fh-khmer-safe mt-2 break-words font-kantumruy text-sm text-[#485547] italic">
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
                                <div className="absolute -left-[13px] top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#8ea07a] bg-[#fdfbf7] text-[10px] text-[#4d5649]">
                                    <Sparkles size={11} className="fill-[#4d5649] text-[#4d5649]" />
                                </div>

                                <div className="py-1 space-y-1">
                                    {item.time && (
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#4d5649]">
                                            <Clock size={14} />
                                            <span className="fh-khmer-safe">{item.time}</span>
                                        </div>
                                    )}
                                    <h4 className="fh-khmer-safe break-words font-khmer-moul text-base text-[#2d352b]">
                                        {item.title}
                                    </h4>
                                    {item.description && (
                                        <p className="fh-khmer-safe break-words pt-0.5 font-kantumruy text-sm text-[#485547]">
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
