"use client";
import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";

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
                    className="mb-16 md:mb-24"
                >
                    <h2 className="text-3xl md:text-6xl font-black tracking-tight text-slate-900 uppercase">
                        The Schedule
                    </h2>
                    <div className="w-8 md:w-12 h-1 bg-slate-900 mt-4 md:mt-6" />
                </m.div>

                <div className="space-y-12 md:space-y-16">
                    {activities.map((activity, idx) => {
                        // Clean up repetitive words to make it look cleaner and modern
                        let displayTime = activity.time || "";
                        displayTime = displayTime.replace(/^វេលាម៉ោង\s*/, '');
                        displayTime = displayTime.replace(/^ម៉ោង\s*/, '');

                        return (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-row items-start gap-4 md:gap-12 group"
                        >
                            <div className="w-20 md:w-32 flex-shrink-0 pt-1">
                                <p className="text-xs md:text-sm tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors font-suwannaphum leading-tight">
                                    {displayTime}
                                </p>
                            </div>
                            <div className="flex-1 border-l border-slate-200 pl-6 md:pl-12 relative pb-8">
                                <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 bg-slate-200 rounded-full group-hover:bg-slate-900 transition-colors" />
                                <h3 className="text-base md:text-xl font-suwannaphum text-slate-900 tracking-tight mb-2 leading-relaxed">
                                    {activity.title}
                                </h3>
                                {activity.description && (
                                    <p className="text-sm md:text-base text-slate-500 font-suwannaphum leading-relaxed mt-2 md:mt-3 break-words">
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
