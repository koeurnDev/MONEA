import React from 'react';
import { m } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import type { WeddingData } from '../types';

export default function AnniversarySchedule({ wedding }: { wedding: WeddingData }) {
    const defaultActivities = [
        {
            title: "ពិធីហែជំនូន",
            time: "០៧:០០ ព្រឹក",
            description: "ជួបជុំសាច់ញាតិ និងភ្ញៀវកិត្តិយស ហែជំនូនចូលរោងជ័យ"
        },
        {
            title: "ពិធីសំពះផ្ទឹម និងចងដៃ",
            time: "០៨:៣០ ព្រឹក",
            description: "ពិធីសិរីសួស្តីកាត់សក់ និងចងដៃជូនពរជ័យដល់គូស្វាមីភរិយាថ្មី"
        },
        {
            title: "ពិសារភោជនាហារថ្ងៃត្រង់",
            time: "១១:០០ ថ្ងៃត្រង់",
            description: "ទទួលទានអាហារថ្ងៃត្រង់ជួបជុំបងប្អូន និងភ្ញៀវកិត្តិយស"
        },
        {
            title: "ពិធីជប់លៀង និងពិសារភោជនាហារពេលល្ងាច",
            time: "០៥:០០ ល្ងាច",
            description: "ទទួលស្វាគមន៍ភ្ញៀវកិត្តិយស និងពិសារភោជនាហារពេលល្ងាច"
        }
    ];

    const rawActivities = wedding.activities || [];
    const activities = rawActivities.length > 0 ? rawActivities : defaultActivities;

    const settings = wedding.themeSettings as any;
    const title = settings?.customLabels?.scheduleTitle || "កម្មវិធីសិរីមង្គល";

    return (
        <section className="py-14 px-4 bg-white font-kantumruy relative overflow-hidden" id="schedule">
            <div className="max-w-xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-1 shadow-sm">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#3B0764] leading-relaxed">
                        {title}
                    </h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
                </div>

                {/* Timeline Activities List */}
                <div className="space-y-3.5">
                    {activities.map((activity, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.08 }}
                            className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-purple-100/90 shadow-sm hover:shadow-md transition-all space-y-2 text-left"
                        >
                            {/* Top Time Badge */}
                            {activity.time && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-900 border border-purple-200/90 font-mono text-xs font-bold shadow-xs">
                                    <Clock size={12} className="text-purple-600" />
                                    <span>{activity.time}</span>
                                </div>
                            )}

                            {/* Activity Title */}
                            <h4 className="font-khmer-moul text-sm sm:text-base text-[#3B0764] leading-relaxed">
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
