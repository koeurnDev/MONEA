import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { WeddingData } from "../types";

interface TimelineSectionProps {
    wedding: WeddingData;
    labels: any;
    primaryColor: string;
}

export default function TimelineSection({ wedding, labels, primaryColor }: TimelineSectionProps) {
    const activities = wedding?.activities || [];
    const timeline = activities.length > 0 ? activities : [
        { time: "07:00 ព្រឹក", description: "ជួបជុំអញ្ជើញភ្ញៀវកិត្តិយស និងបង ប្អូន ញាតិមិត្តជិតឆ្ងាយដើម្បីចូលរួមហែជំនួន" },
        { time: "07:30 ព្រឹក", description: "ពិធីហែជំនួន(កំណត់)" },
        { time: "08:30 ព្រឹក", description: "ពិធីបំពាក់ចិញ្ចៀន" },
        { time: "09:00 ព្រឹក", description: "ពិធីកាត់សក់បង្កក់សិរី" },
        { time: "10:30 ព្រឹក", description: "ពិធីជូនផ្កាស្លា និងសំពះផ្ទឹម" },
        { time: "12:00 ថ្ងៃត្រង់", description: "អញ្ជើញភ្ញៀវកិត្តិយសពិសារអាហារថ្ងៃត្រង់" },
        { time: "05:00 ល្ងាច", description: "អញ្ជើញភ្ញៀវកិត្តិយសពិសារភោជនាហារ" },
        { time: "09:00 យប់", description: "ពិធីរាំលេងកំសាន្ត" },
    ];

    return (<section className="px-6 py-10">
        <h3 className="text-center text-3xl mb-16 font-bold font-header tracking-wide text-pink-300 drop-shadow-md">
            {labels.timeline_title}
        </h3>

        <div className="max-w-3xl mx-auto relative">
            {/* Center Line (White/Gold) */}
            <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 md:translate-x-0" style={{ background: `linear-gradient(to bottom, transparent, ${primaryColor}, transparent)` }}></div>

            <div className="space-y-12">
                {timeline.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative flex items-center justify-between md:justify-center`}
                    >
                        {/* Left Side (Desktop: Right Aligned Text or Empty) */}
                        <div className={`hidden md:flex w-5/12 justify-end ${idx % 2 === 0 ? "order-1" : "order-3"}`}>
                            {idx % 2 === 0 && (
                                <div className="text-right pr-8">
                                    <h4 className="text-2xl font-bold mb-2 font-mono text-pink-200 drop-shadow-md">{item.time}</h4>
                                    <p className="text-white/90 font-khmer text-lg leading-relaxed drop-shadow-md">{item.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Center Node */}
                        <div className="absolute left-[19px] md:left-1/2 -translate-x-1/2 z-10 md:static md:w-2/12 md:translate-x-0 md:flex md:justify-center order-2">
                            <div className="w-10 h-10 rounded-full bg-black/50 border-2 border-white/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                <Clock size={16} className="text-pink-300" />
                            </div>
                        </div>

                        {/* Right Side (Desktop: Left Aligned Text or Empty) */}
                        <div className={`w-full md:w-5/12 pl-12 md:pl-0 ${idx % 2 === 0 ? "order-3" : "order-1"}`}>
                            {/* Mobile View: Always show text here */}
                            <div className="md:hidden">
                                <h4 className="text-xl font-bold mb-1 font-mono text-pink-200 drop-shadow-md">{item.time}</h4>
                                <p className="text-white/90 font-khmer text-base leading-relaxed drop-shadow-md">{item.description}</p>
                            </div>

                            {/* Desktop View: Show text only if odd index */}
                            {idx % 2 !== 0 && (
                                <div className="hidden md:block text-left pl-8">
                                    <h4 className="text-2xl font-bold mb-2 font-mono text-pink-200 drop-shadow-md">{item.time}</h4>
                                    <p className="text-white/90 font-khmer text-lg leading-relaxed drop-shadow-md">{item.description}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
    );
}
