"use client";

import React from "react";
import { m } from 'framer-motion';
import { Clock, Heart, GlassWater, Music, Utensils, PartyPopper, Camera } from "lucide-react";

interface TimelineItem {
    time: string;
    description: string;
}

const KhmerIcons: Record<string, React.ReactNode> = {
    "default": <Heart size={20} />,
    "breakfast": <Utensils size={20} />,
    "ceremony": <Clock size={20} />,
    "party": <PartyPopper size={20} />,
    "music": <Music size={20} />,
    "reception": <GlassWater size={20} />,
    "photo": <Camera size={20} />,
};

export const CinematicTimeline = ({ items }: { items: TimelineItem[] }) => {
    return (
        <div className="relative py-12">
            {/* Central Line */}
            <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#B8860B]/0 via-[#B8860B]/30 to-[#B8860B]/0 md:-translate-x-1/2" />

            <div className="space-y-16">
                {items.map((item, index) => {
                    const isEven = index % 2 === 0;

                    return (
                        <m.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            {/* Icon Node */}
                            <div className="absolute left-0 md:left-1/2 top-0 md:-translate-x-1/2 z-10">
                                <div className="w-12 h-12 bg-[#FDFBF7] border-2 border-[#B8860B]/40 rounded-full flex items-center justify-center text-[#B8860B] shadow-lg shadow-[#B8860B]/5">
                                    <div className="p-2 bg-[#B8860B]/5 rounded-full">
                                        {KhmerIcons[item.description.toLowerCase()] || KhmerIcons.default}
                                    </div>
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
                                <div className="bg-white/40 backdrop-blur-sm border border-[#B8860B]/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                    <span className="text-[#B8860B] font-black tracking-widest text-sm uppercase block mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {item.time}
                                    </span>
                                    <p className="font-khmer text-lg leading-relaxed text-stone-700">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            {/* Spacer for empty side */}
                            <div className="hidden md:block md:w-1/2" />
                        </m.div>
                    );
                })}
            </div>
        </div>
    );
};
