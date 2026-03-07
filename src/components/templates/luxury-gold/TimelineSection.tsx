"use client";
import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";

interface TimelineSectionProps {
    wedding: WeddingData;
    labels: any;
}

export default function TimelineSection({ wedding, labels }: TimelineSectionProps) {
    const activities = wedding?.activities || [];
    const timeline = activities.length > 0 ? activities : [
        { time: "07:30 ព្រឹក", description: "ជួបជុំញាតិមិត្ត និងពិធីហែជំនូន" },
        { time: "09:00 ព្រឹក", description: "ពិធីកាត់សក់បង្កក់សិរី" },
        { time: "04:30 ល្ងាច", description: "អញ្ជើញពិសាភោជនាហារ" },
    ];

    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: "easeOut" as any }
    };

    return (
        <m.section className="py-24 px-4 relative" initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {/* Elegant Center Line */}
            {/* Elegant Center Line - Hidden on small mobile to allow grid flow */}
            <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent md:-translate-x-1/2 hidden sm:block"></div>

            <m.h3 variants={fadeInUp} className="text-center text-4xl mb-20 font-header text-[#D4AF37] relative z-10 drop-shadow-md">
                <span className="bg-[#0a0a0a] px-6 py-2 border-y border-[#D4AF37]/30">
                    {labels.timeline_title}
                </span>
            </m.h3>

            <div className="grid grid-cols-2 sm:block space-y-0 sm:space-y-16 gap-3">
                {timeline.map((item, idx) => (
                    <m.div
                        key={idx}
                        variants={{
                            initial: { opacity: 0, x: idx % 2 === 0 ? -30 : 30 },
                            whileInView: { opacity: 1, x: 0, transition: { duration: 0.6, delay: idx * 0.1 } }
                        }}
                        className={`flex flex-col sm:flex-row items-center sm:items-center gap-0 sm:gap-0 ${idx % 2 === 0 ? "sm:flex-row-reverse" : ""
                            }`}
                    >
                        {/* Time & Description Container - taking up 50% width on desktop */}
                        <div className="flex-1 w-full px-2 sm:px-12 text-center sm:text-right flex flex-col items-center sm:block">
                            {/* Desktop/Grid Alignment */}
                            <div className={`w-full ${idx % 2 === 0 ? "sm:text-left" : "sm:text-right"}`}>
                                <h4 className="text-[#D4AF37] text-lg sm:text-2xl font-bold font-mono tracking-widest mb-1 sm:mb-2 border-b border-[#D4AF37]/20 inline-block pb-0.5 sm:pb-1">
                                    {item.time}
                                </h4>
                                <p className="text-white/90 text-xs sm:text-xl font-khmer font-light leading-relaxed mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-none">
                                    {item.description}
                                </p>
                            </div>
                        </div>

                        {/* Center Icon Node - Only on tablet/desktop */}
                        <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-[#D4AF37] items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] z-20">
                            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
                        </div>

                        {/* Empty spacer for the other side to balance flex layout */}
                        <div className="flex-1 hidden sm:block"></div>
                    </m.div>
                ))}
            </div>
        </m.section>
    );
}
