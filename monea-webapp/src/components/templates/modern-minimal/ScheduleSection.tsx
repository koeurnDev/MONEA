import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";
import { clsx } from 'clsx';

export const ScheduleSection = ({ wedding }: { wedding: WeddingData }) => {
    const { t } = useTranslation();
    const activities = wedding.activities || [];

    if (activities.length === 0) return null;

    return (
        <section className="py-20 md:py-32 bg-white relative" id="schedule-modern">
            <div className="max-w-4xl mx-auto px-6 md:px-8">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-6 md:mb-10"
                >
                    <h2 className="text-[1.35rem] sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 uppercase font-kantumruy whitespace-nowrap">
                        {wedding.themeSettings?.customLabels?.scheduleTitle || "កម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍"}
                    </h2>
                    <div className="w-8 md:w-12 h-1 bg-slate-900 mt-4 md:mt-6" />
                </m.div>

                <div className="flex flex-col">
                    {activities.map((activity, idx) => {
                        const isLast = idx === activities.length - 1;
                        let displayTime = activity.time || "";
                        displayTime = displayTime.replace(/^វេលាម៉ោង\s*/, '');
                        displayTime = displayTime.replace(/^ម៉ោង\s*/, '');

                        if (!displayTime) {
                            return (
                                <m.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="w-full text-center py-8 md:py-12"
                                >
                                    <h3 className="text-sm sm:text-base md:text-2xl font-kantumruy font-black text-slate-800 tracking-normal whitespace-nowrap">
                                        {activity.title}
                                    </h3>
                                    {activity.description && (
                                        <p className="text-sm md:text-base text-slate-500 mt-3 font-suwannaphum">
                                            {activity.description}
                                        </p>
                                    )}
                                </m.div>
                            );
                        }

                        return (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-row items-start gap-4 md:gap-12 group"
                        >
                            <div className="w-[85px] md:w-32 flex-shrink-0 pt-1 text-right">
                                <p className="text-[11px] md:text-sm tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors font-suwannaphum leading-tight whitespace-nowrap">
                                    {displayTime}
                                </p>
                            </div>
                            <div className={clsx(
                                "flex-1 pl-5 md:pl-12 relative",
                                isLast ? "pb-2" : "border-l border-slate-200 pb-10 md:pb-12"
                            )}>
                                <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 bg-slate-200 rounded-full group-hover:bg-slate-900 transition-colors" />
                                <h3 className="text-[14px] md:text-xl font-suwannaphum text-slate-900 tracking-tight mb-1 md:mb-2 leading-snug">
                                    {activity.title}
                                </h3>
                                {activity.description && (
                                    <p className="text-[13px] md:text-base text-slate-500 font-suwannaphum leading-snug mt-1 md:mt-3 break-words">
                                        {activity.description}
                                    </p>
                                )}
                            </div>
                        </m.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
