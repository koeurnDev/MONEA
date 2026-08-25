import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Calendar } from 'lucide-react';
import { WeddingData } from '../types';

interface ScheduleSectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ wedding, primaryColor }) => {
    const isEngagement = wedding.eventType === 'anniversary';

    const defaultWeddingActivities = [
        { time: "ម៉ោង ០៦:០០ នាទីព្រឹក", title: "ពិធីហែជំនូនចូលរោងជ័យ (កាត់ខ្សែចិន-ខ្មែរ)", description: "ក្បួនហែជំនូនកូនកំលោះ និងពិធីកាត់ខ្សែចូលគេហដ្ឋានកូនក្រមុំ", icon: "🧧" },
        { time: "ម៉ោង ០៧:១៥ នាទីព្រឹក", title: "ពិធីសំពះសែនលើកតែ (敬茶)", description: "ពិធីសំពះសែន និងលើកតែគោរពមាតាបិតា ជីដូនជីតា", icon: "🍵" },
        { time: "ម៉ោង ០៨:៣០ នាទីព្រឹក", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", description: "ព្រះសង្ឃចម្រើនព្រះបរិត្តប្រោះព្រំសិរីសួស្តី ជ័យមង្គល", icon: "🪷" },
        { time: "ម៉ោង ០៩:៤៥ នាទីព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី & បង្វិលពពិល", description: "កាត់សក់សិរីមង្គល និងបង្វិលពពិលប្រសិទ្ធពរជ័យ", icon: "✂️" },
        { time: "ម៉ោង ១០:៤៥ នាទីព្រឹក", title: "ពិធីសំពះផ្ទឹម ចងដៃ & បាចផ្កាស្លា", description: "សែនចងដៃកូនប្រុស-កូនស្រី និងជូនពរជ័យសិរីមង្គល", icon: "💍" },
        { time: "ម៉ោង ០៥:០០ នាទីល្ងាច", title: "ពិធីពិសាភោជនាហារមង្គលការ (宴会)", description: "ទទួលទានអាហារពេលល្ងាច និងរាំកម្សាន្តអបអរសាទរ", icon: "🥂" },
    ];

    const defaultEngagementActivities = [
        { time: "ម៉ោង ០៧:០០ នាទីព្រឹក", title: "ពិធីហែជំនូនភ្ជាប់ពាក្យ (កាត់ខ្សែហុងស៊ុយ)", description: "ក្បួនហែជំនូនភ្ជាប់ពាក្យចូលគេហដ្ឋានខាងស្រី", icon: "🧧" },
        { time: "ម៉ោង ០៧:៤៥ នាទីព្រឹក", title: "ពិធីរាប់ជំនូនផ្លែឈើ & គ្រឿងអលង្ការបណ្ណាការ", description: "ពិធីរាប់ផ្លែឈើ និងគ្រឿងអលង្ការបណ្ណាការមង្គល", icon: "💍" },
        { time: "ម៉ោង ០៨:៣០ នាទីព្រឹក", title: "ពិធីសំពះលើកតែ & បំពាក់ចិញ្ចៀនភ្ជាប់ពាក្យ", description: "កូនកំលោះ និងកូនក្រមុំបំពាក់ចិញ្ចៀន និងលើកតែជូនមាតាបិតា", icon: "🍵" },
        { time: "ម៉ោង ០៩:៣០ នាទីព្រឹក", title: "ពិធីសែនព្រេន និងចងដៃជូនពរជ័យ", description: "មាតាបិតា ញាតិមិត្តសែនព្រេន និងចងដៃជូនពរ", icon: "🪷" },
        { time: "ម៉ោង ១១:៣០ នាទីព្រឹក", title: "ពិធីពិសាអាហារសាមគ្គីអបអរសាទរ", description: "ទទួលទានអាហារសាមគ្គីអបអរសាទរពិធីភ្ជាប់ពាក្យ", icon: "🥂" },
    ];

    const defaultList = isEngagement ? defaultEngagementActivities : defaultWeddingActivities;
    const rawActivities = wedding.activities && wedding.activities.length > 0 ? wedding.activities : defaultList;

    return (
        <section className="py-14 px-4 sm:px-6 bg-[#610C17] text-white font-kantumruy relative overflow-hidden">
            <div className="max-w-md mx-auto relative z-10">
                {/* Title */}
                <div className="text-center space-y-2 mb-10">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-amber-300 block">
                        {isEngagement 
                            ? (wedding.themeSettings?.customLabels?.schedule_title || "កម្មវិធីសិរីមង្គលពិធីភ្ជាប់ពាក្យ")
                            : (wedding.themeSettings?.customLabels?.schedule_title || "កម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍")}
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
                                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 border border-amber-400/60 shadow-md text-amber-300">
                                        <Calendar size={14} className="text-amber-400" />
                                        <span className="font-khmer-moul text-xs sm:text-sm tracking-wide">
                                            {item.title}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="text-xs text-amber-200/80 mt-2 italic">
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
                                className="relative pl-6 sm:pl-7 border-l-2 border-amber-400/60 ml-3 sm:ml-4 group"
                            >
                                <div className="absolute -left-[14px] top-4 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 text-red-950 border-2 border-amber-200 shadow-md flex items-center justify-center text-[10px]">
                                    <Sparkles size={11} className="fill-red-950 text-red-950" />
                                </div>

                                <div className="bg-black/35 border border-amber-400/40 rounded-2xl p-4 shadow-md group-hover:shadow-lg transition-shadow space-y-1">
                                    {item.time && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                                            <Clock size={12} />
                                            <span>{item.time}</span>
                                        </div>
                                    )}
                                    <h4 className="text-sm font-bold text-white leading-snug">
                                        {item.title}
                                    </h4>
                                    {item.description && (
                                        <p className="text-xs text-amber-100/70 leading-relaxed pt-0.5">
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
