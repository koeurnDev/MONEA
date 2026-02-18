import React from 'react';
import { motion } from 'framer-motion';
import { WeddingData } from "../types";
import { Utensils, Music, Camera, Heart, Clock } from 'lucide-react';

export default function Timeline({ wedding }: { wedding: WeddingData }) {
    const activities = wedding?.activities || [];
    const timeline = activities.length > 0 ? activities : [
        { time: "07:30", description: "Ceremony Start" },
        { time: "11:00", description: "Lunch" },
        { time: "17:00", description: "Reception" },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <img src="/templates/enchanted/bg-stairs.jpg" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-20" />

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <p className="font-vibes text-[#D4AF37] text-3xl mb-2">Program</p>
                    <h3 className="font-cinzel text-4xl text-white">Wedding Schedule</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {timeline.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            className="bg-[#050A08]/80 backdrop-blur-md border border-[#D4AF37]/30 p-8 rounded-lg text-center hover:border-[#D4AF37] transition-colors group"
                        >
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1a2e25] flex items-center justify-center border border-[#D4AF37]/50 group-hover:scale-110 transition-transform">
                                <Clock className="text-[#D4AF37]" />
                            </div>
                            <h4 className="font-cinzel text-2xl text-[#D4AF37] mb-2">{item.time}</h4>
                            <p className="font-cormorant text-xl text-white font-khmer">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
