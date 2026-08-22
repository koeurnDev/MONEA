import React from 'react';
import type { WeddingData } from '../types';
import { Clock } from 'lucide-react';

export default function AnniversarySchedule({ wedding }: { wedding: WeddingData }) {
    if (!wedding.activities || wedding.activities.length === 0) return null;
    const settings = wedding.themeSettings as any;
    const title = settings?.customLabels?.scheduleTitle || "កម្មវិធីពិធី";

    return (
        <div className="py-20 px-6 bg-white flex flex-col items-center justify-center font-kantumruy" id="schedule">
            <div className="max-w-2xl mx-auto w-full space-y-12">
                
                <div className="flex flex-col items-center gap-3 text-center">
                    <Clock className="w-8 h-8 text-purple-400" />
                    <h2 className="text-2xl md:text-3xl font-black text-purple-900 tracking-wider font-khmer-moul">
                        {title}
                    </h2>
                </div>

                <div className="relative border-l-2 border-purple-200 ml-4 md:ml-auto space-y-8 pl-6">
                    {wedding.activities.map((activity, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[31px] top-1 w-4 h-4 bg-purple-400 rounded-full border-4 border-white shadow-sm" />
                            <div className="space-y-1">
                                {activity.time && (
                                    <p className="text-sm font-bold text-purple-600">{activity.time}</p>
                                )}
                                <h4 className="text-lg font-bold text-purple-900">{activity.title}</h4>
                                {activity.description && (
                                    <p className="text-sm text-purple-900/60 leading-relaxed max-w-md">
                                        {activity.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
            </div>
        </div>
    );
}
