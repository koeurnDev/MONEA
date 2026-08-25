import React from 'react';
import { m } from 'framer-motion';
import { Heart, Quote } from 'lucide-react';
import type { WeddingData } from '../types';

export default function AnniversaryVows({ wedding }: { wedding: WeddingData }) {
    const settings = wedding.themeSettings as any;
    
    // Fallbacks if not provided
    const vowsTitle = settings?.customLabels?.vowsTitleAnniv || "ពាក្យសន្យា & សម្រង់សម្តី";
    const groomVows = settings?.groomVows || "អរគុណដែលបានចូលមកក្នុងជីវិតបង និងតែងតែជាកម្លាំងចិត្តដ៏រឹងមាំសម្រាប់បងគ្រប់ពេលវេលា។";
    const brideVows = settings?.brideVows || "អរគុណសម្រាប់ការស្រលាញ់ ការមើលថែ និងភាពកក់ក្តៅដែលបងតែងតែផ្តល់ឱ្យអូនជារៀងរាល់ថ្ងៃ។";

    const groomPhoto = wedding.groomPhoto || (wedding.galleryItems?.[0]?.url || '/images/couple.webp');
    const bridePhoto = wedding.bridePhoto || (wedding.galleryItems?.[1]?.url || '/images/couple.webp');

    return (
        <section className="py-16 px-4 bg-[#FAF7F2] font-kantumruy relative overflow-hidden" id="vows">
            <div className="max-w-xl mx-auto space-y-10 relative z-10">
                
                {/* Section Header */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-1 shadow-sm">
                        <Heart className="w-5 h-5 fill-purple-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#3B0764] leading-relaxed">
                        {vowsTitle}
                    </h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
                </div>

                {/* Vows Grid Cards */}
                <div className="space-y-6">
                    {/* Groom Vows Card */}
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-white rounded-3xl p-6 border border-purple-200/70 shadow-md relative overflow-hidden"
                    >
                        <Quote className="absolute top-4 right-4 w-10 h-10 text-purple-100 -rotate-6 pointer-events-none" />
                        
                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shadow-sm shrink-0">
                                <img src={groomPhoto} alt={wedding.groomName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-khmer-moul text-[#3B0764]">
                                    {wedding.groomName}
                                </h4>
                                <span className="text-[11px] text-purple-600 font-bold">កូនកំលោះ</span>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic pl-1 border-l-2 border-purple-300">
                            &quot;{groomVows}&quot;
                        </p>
                    </m.div>

                    {/* Bride Vows Card */}
                    <m.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="bg-white rounded-3xl p-6 border border-purple-200/70 shadow-md relative overflow-hidden"
                    >
                        <Quote className="absolute top-4 right-4 w-10 h-10 text-purple-100 -rotate-6 pointer-events-none" />

                        <div className="flex items-center gap-3.5 mb-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shadow-sm shrink-0">
                                <img src={bridePhoto} alt={wedding.brideName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-khmer-moul text-[#3B0764]">
                                    {wedding.brideName}
                                </h4>
                                <span className="text-[11px] text-purple-600 font-bold">កូនក្រមុំ</span>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic pl-1 border-l-2 border-purple-300">
                            &quot;{brideVows}&quot;
                        </p>
                    </m.div>
                </div>
            </div>
        </section>
    );
}
