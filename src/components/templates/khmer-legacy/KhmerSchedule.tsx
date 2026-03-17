import * as React from "react";
import Image from 'next/image';
import { m } from 'framer-motion';
import { Heart, Clock, Scissors, Camera, Utensils, Music, Flower2, Users, GlassWater, Landmark } from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from "../types";

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
    const activities = wedding.activities || [];
    return (
        <section id="schedule-khmer" className="py-24 md:py-48 px-6 md:px-12 bg-white relative overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-16">
                <RevealSection>
                    <div className="text-center space-y-4">
                        <Heart size={24} className="text-gold/30 mx-auto" />
                        <h2 className="font-khmer-moul text-2xl md:text-4xl text-gold-gradient text-gold-embossed whitespace-nowrap">
                            {wedding.themeSettings?.customLabels?.scheduleTitle || (wedding.eventType === 'anniversary' ? 'កម្មវិធីខួបអាពាហ៍ពិពាហ៍' : 'កម្មវិធីវិវាហមង្គល')}
                        </h2>
                        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent mx-auto" />
                    </div>
                </RevealSection>

                <div className="relative">
                    {/* JOURNEY LINE */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold/30 to-transparent -translate-x-1/2 hidden md:block" />
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gold/10 -translate-x-1/2 md:hidden" />

                    <div className="space-y-12 md:space-y-16">
                        {activities.map((item, idx) => {
                            const isHeader = item.icon === "header";
                            
                            if (isHeader) {
                                return (
                                    <RevealSection key={idx} delay={0.1}>
                                        <div className="py-8 text-center relative">
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                <div className="w-full border-t border-gold/20"></div>
                                            </div>
                                            <div className="relative flex justify-center">
                                                <span className="bg-white px-8 py-2 font-khmer-moul-pali text-xl md:text-3xl text-gold-gradient tracking-widest uppercase">
                                                    {item.title}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <p className="mt-2 font-khmer-content text-sm text-gold/60 italic">{item.description}</p>
                                            )}
                                        </div>
                                    </RevealSection>
                                );
                            }

                            return (
                                <RevealSection key={idx} delay={idx * 0.05}>
                                    <div className={`relative flex items-center gap-8 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                        {/* TIMELINE NODE */}
                                        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-20">
                                            <m.div 
                                                whileInView={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-4 h-4 rounded-full bg-gold ring-4 ring-gold/10" 
                                            />
                                        </div>
    
                                        {/* CONTENT CARD */}
                                        <div className="w-full md:w-[45%] pl-16 md:pl-0">
                                            <div className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-lux bg-white/40 backdrop-blur-sm shadow-sm group hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                                                    {(() => {
                                                        const IconComp = item.icon ? KHMER_ICONS_MAP[item.icon] : Clock;
                                                        return IconComp ? <IconComp size={80} /> : <Clock size={80} />;
                                                    })()}
                                                </div>
                                                
                                                <div className="space-y-3 relative z-10">
                                                    <div className={`flex items-center gap-2 text-gold font-bold tracking-widest text-[10px] md:text-xs ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                                        <Clock size={12} className="opacity-50" />
                                                        <span>{item.time}</span>
                                                    </div>
                                                    <h4 className="font-khmer-moul-pali text-md md:text-xl text-gray-800 leading-relaxed drop-shadow-sm">{item.title}</h4>
                                                    {item.description && (
                                                        <p className="font-khmer-content text-[13px] md:text-sm text-gray-500 leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
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
