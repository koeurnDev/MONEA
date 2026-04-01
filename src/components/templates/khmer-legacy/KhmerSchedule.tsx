import * as React from "react";
import Image from 'next/image';
import { m } from 'framer-motion';
import { Heart, Clock, Scissors, Camera, Utensils, Music, Flower2, Users, GlassWater, Landmark } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";

const KHMER_ICONS_MAP: Record<string, any> = {
    scissors: Scissors,
    heart: Heart,
    flower: Flower2,
    users: Users,
    utensils: Utensils,
    camera: Camera,
    music: Music,
    glass: GlassWater,
    landmark: Landmark,
};

export function KhmerSchedule({ wedding }: { wedding: WeddingData }) {
    const { t } = useTranslation();
    const activities = wedding.activities || [];
    return (
        <section id="schedule-khmer" className="py-16 md:py-32 px-6 md:px-12 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(177,147,86,0.02)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="max-w-5xl mx-auto space-y-16 md:space-y-20 relative z-10">
                <RevealSection>
                    <div className="text-center space-y-8">
                        <div className="flex flex-col items-center space-y-4">
                            <p className="font-playfair text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.8em] text-gold-main/80 uppercase font-black leading-relaxed">
                                {t("template.khmerLegacy.scheduleSubtitle")}
                            </p>
                            <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent" />
                        </div>
                        <h2 className="font-khmer-moul text-4xl md:text-6xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                            {wedding.themeSettings?.customLabels?.scheduleTitle || t("template.khmerLegacy.schedule")}
                        </h2>
                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent mx-auto" />
                    </div>
                </RevealSection>

                <div className="relative">
                    {/* JOURNEY LINE */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-transparent via-gold-main/20 to-transparent -translate-x-1/2" />
                    
                    <div className="space-y-12 md:space-y-16">
                        {activities.map((item, idx) => {
                            const isHeader = item.icon === "header";
                            
                            if (isHeader) {
                                return (
                                    <RevealSection key={idx} delay={0.1}>
                                        <div className="py-12 text-center relative group">
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                <div className="w-full border-t border-slate-100"></div>
                                            </div>
                                            <div className="relative flex justify-center">
                                                 <span className="bg-white px-6 md:px-10 py-3 font-khmer-moul text-lg md:text-4xl text-gold-gradient tracking-wider md:tracking-widest uppercase font-black leading-relaxed">
                                                    {item.title}
                                                </span>
                                            </div>
                                            {item.description && (
                                                 <p className="mt-4 font-khmer-content text-sm md:text-lg text-gold-main/80 italic font-black leading-relaxed">{item.description}</p>
                                            )}
                                        </div>
                                    </RevealSection>
                                );
                            }

                            return (
                                <RevealSection key={idx} delay={idx * 0.05}>
                                    <div className={`relative flex items-center gap-10 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                        {/* TIMELINE NODE */}
                                        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-20">
                                            <m.div 
                                                whileInView={{ scale: [1, 1.3, 1], backgroundColor: ["#B19356", "#E5D5B7", "#B19356"] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="w-5 h-5 rounded-full shadow-[0_0_15px_rgba(177,147,86,0.3)] border-2 border-white" 
                                            />
                                        </div>
    
                                        {/* CONTENT CARD */}
                                        <div className="w-full md:w-[45%] pl-20 md:pl-0">
                                            <m.div 
                                                whileHover={{ y: -6, scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}
                                            >
                                                <div className={`absolute top-0 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-1000 ${idx % 2 === 0 ? 'left-0' : 'right-0'}`}>
                                                    {(() => {
                                                        const IconComp = item.icon ? KHMER_ICONS_MAP[item.icon] : Clock;
                                                        return IconComp ? <IconComp size={120} /> : <Clock size={120} />;
                                                    })()}
                                                </div>
                                                
                                                <div className="space-y-4 relative z-10">
                                                    <div className={`flex items-center gap-3 text-gold-main font-black tracking-[0.2em] text-[10px] md:text-[13px] uppercase font-playfair ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                                        <Clock size={14} className="opacity-40" />
                                                        <span>{item.time}</span>
                                                    </div>
                                                     <h4 className="font-khmer-moul text-base md:text-2xl text-slate-800 leading-loose font-black tracking-wider md:tracking-widest">{item.title}</h4>
                                                    {item.description && (
                                                        <p className="font-khmer-content text-base md:text-lg text-slate-500 leading-relaxed font-black italic">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-main/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </m.div>
                                        </div>
    
                                        {/* SPACER FOR GRID FEEL */}
                                        <div className="hidden md:block w-[45%]" />
                                    </div>
                                </RevealSection>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
