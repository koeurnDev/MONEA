import React from 'react';
import { motion } from 'framer-motion';
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
        <motion.section className="py-24 px-4 relative" initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {/* Elegant Center Line */}
            <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent md:-translate-x-1/2"></div>

            <motion.h3 variants={fadeInUp} className="text-center text-4xl mb-20 font-header text-[#D4AF37] relative z-10 drop-shadow-md">
                <span className="bg-[#0a0a0a] px-6 py-2 border-y border-[#D4AF37]/30">
                    {labels.timeline_title}
                </span>
            </motion.h3>

            <div className="space-y-16 max-w-4xl mx-auto relative z-10">
                {timeline.map((item, idx) => (
                    <motion.div
                        key={idx}
                        variants={{
                            initial: { opacity: 0, x: idx % 2 === 0 ? -30 : 30 },
                            whileInView: { opacity: 1, x: 0, transition: { duration: 0.6, delay: idx * 0.1 } }
                        }}
                        className={`flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""
                            }`}
                    >
                        {/* Time & Description Container - taking up 50% width on desktop */}
                        <div className="flex-1 w-full pl-16 md:pl-0 md:px-12 text-left md:text-right">
                            {/* On desktop, align based on side */}
                            <div className={`${idx % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                                <h4 className="text-[#D4AF37] text-2xl font-bold font-mono tracking-widest mb-2 border-b border-[#D4AF37]/20 inline-block pb-1">
                                    {item.time}
                                </h4>
                                <p className="text-white/90 text-xl font-khmer font-light leading-relaxed mt-2">
                                    {item.description}
                                </p>
                            </div>
                        </div>

                        {/* Center Icon Node */}
                        <div className="absolute left-[30px] md:left-1/2 -translate-x-[15px] md:-translate-x-1/2 w-8 h-8 rounded-full bg-[#0a0a0a] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] z-20">
                            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
                        </div>

                        {/* Empty spacer for the other side to balance flex layout */}
                        <div className="flex-1 hidden md:block"></div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
