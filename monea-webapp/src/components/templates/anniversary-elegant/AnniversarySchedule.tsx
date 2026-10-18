import React from 'react';
import { m } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { WeddingData } from '../types';

export default function AnniversarySchedule({ wedding }: { wedding: WeddingData; title?: string }) {
    const activities = (wedding.activities || []).filter((activity) =>
        activity.title?.trim() || activity.time?.trim() || activity.description?.trim(),
    );
    if (activities.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-[#FBF9F5] font-kantumruy relative overflow-hidden" id="schedule">
            <div className="max-w-xl mx-auto space-y-8">
                
                {/* Timeline Activities List */}
                <div className="relative space-y-3.5 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-[#D8C2A0]">
                    {activities.map((activity, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.08 }}
                            className="relative ml-2 bg-[#F1ECE5] p-4 pl-12 sm:p-5 sm:pl-14 rounded-2xl border border-[#D9C6AA] shadow-sm hover:shadow-md transition-all space-y-2 text-left"
                        >
                            {/* Top Time Badge */}
                            {activity.time && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-900 border border-purple-200/90 font-mono text-xs font-bold shadow-xs">
                                    <Clock size={12} className="text-[#966B4E]" />
                                    <span>{activity.time}</span>
                                </div>
                            )}

                            {/* Activity Title */}
                            <h4 className="font-khmer-moul text-sm sm:text-base text-[#633E42] leading-relaxed">
                                {activity.title}
                            </h4>

                            {/* Description */}
                            {activity.description && (
                                <p className="text-xs sm:text-sm text-slate-600 font-kantumruy leading-relaxed">
                                    {activity.description}
                                </p>
                            )}
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
