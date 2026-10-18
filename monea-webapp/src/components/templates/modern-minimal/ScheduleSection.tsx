import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { CalendarDays, Clock } from 'lucide-react';

export const ScheduleSection = ({ wedding, title }: { wedding: WeddingData; title?: string }) => {
    const activities = wedding.activities || [];

    if (activities.length === 0) return null;

    return (
        <section className="relative bg-[#fbfaf7] px-4 py-12 sm:px-6 sm:py-16" id="schedule-modern">
            <div className="mx-auto max-w-3xl">
                <header className="mb-6 text-center sm:mb-8">
                    <CalendarDays aria-hidden="true" className="mx-auto mb-2.5 h-5 w-5 text-[#9b8055]" />
                    <h2 className="font-khmer-moul text-xl leading-relaxed text-slate-900 sm:text-2xl">
                        {title || (wedding.eventType === "anniversary" ? "កម្មវិធីពិធីភ្ជាប់ពាក្យ" : "កម្មវិធីអាពាហ៍ពិពាហ៍")}
                    </h2>
                    <div className="mx-auto mt-3 h-px w-12 bg-[#9b8055]/50" />
                </header>
                <div className="flex flex-col gap-2.5">
                    {activities.map((activity, idx) => {
                        let displayTime = activity.time || "";
                        displayTime = displayTime.replace(/^វេលាម៉ោង\s*/, '');
                        displayTime = displayTime.replace(/^ម៉ោង\s*/, '');

                        if (!displayTime) {
                            return (
                                <m.div
                                    key={`header-${idx}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: (idx % 5) * 0.04 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    className="px-2 pb-1 pt-4 text-center"
                                >
                                    <h3 className="break-words font-khmer-moul text-base text-slate-800 sm:text-lg">
                                        {activity.title}
                                    </h3>
                                    {activity.description && (
                                        <p className="mt-1.5 break-words font-kantumruy text-xs leading-6 text-slate-500 sm:text-sm">
                                            {activity.description}
                                        </p>
                                    )}
                                </m.div>
                            );
                        }

                        return (
                            <m.article
                                key={`activity-${idx}`}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: (idx % 5) * 0.04 }}
                                viewport={{ once: true, amount: 0.2 }}
                                className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-[#e8e4dc] bg-white/75 px-3 py-3 shadow-[0_2px_10px_rgba(55,53,47,0.04)] sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-4 sm:px-4 sm:py-3.5"
                            >
                                <div className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-[#f4efdf] px-2 py-2 font-kantumruy text-[10px] font-semibold leading-4 text-[#76674f] sm:text-xs">
                                    <Clock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                    <span className="min-w-0 break-words">{displayTime}</span>
                                </div>
                                <div className="min-w-0 border-l border-[#e8e4dc] pl-3 sm:pl-4">
                                    <h3 className="break-words font-suwannaphum text-sm font-medium leading-6 text-slate-900 sm:text-base">
                                        {activity.title}
                                    </h3>
                                    {activity.description && (
                                        <p className="mt-1 break-words font-suwannaphum text-xs leading-6 text-slate-500 sm:text-sm">
                                            {activity.description}
                                        </p>
                                    )}
                                </div>
                            </m.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
