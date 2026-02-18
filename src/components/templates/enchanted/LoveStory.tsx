import React from 'react';
import { motion } from 'framer-motion';
import { WeddingData } from "../types";
import { Heart } from 'lucide-react';
import { CldImage } from 'next-cloudinary';

export default function LoveStory({ wedding }: { wedding: WeddingData }) {
    // Placeholder story data - in a real app, this would come from wedding prop
    const story = [
        { year: "2018", title: "First Met", desc: "We met at a coffee shop...", image: wedding?.galleryItems?.[0]?.url },
        { year: "2020", title: "She Said Yes", desc: "Under the stars, he proposed...", image: wedding?.galleryItems?.[1]?.url },
        { year: "2024", title: "The Big Day", desc: "Starting our forever together.", image: wedding?.galleryItems?.[2]?.url },
    ];

    return (
        <section className="py-24 bg-[#0a110e] text-center relative">
            <h3 className="font-cinzel text-4xl text-[#D4AF37] mb-16 relative z-10">Our Love Story</h3>

            <div className="max-w-4xl mx-auto px-6 relative">
                {/* Central Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D4AF37]/30 -translate-x-1/2 hidden md:block"></div>

                <div className="space-y-20 relative z-10">
                    {story.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Image Side */}
                            <div className="flex-1 w-full">
                                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#D4AF37]/20 shadow-lg group">
                                    {item.image ? (
                                        <CldImage src={item.image} width={600} height={400} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-[#1a2e25] flex items-center justify-center text-[#D4AF37]/30">Photo</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                </div>
                            </div>

                            {/* Icon Center */}
                            <div className="hidden md:flex flex-col items-center justify-center w-12 z-20">
                                <div className="w-10 h-10 rounded-full bg-[#050A08] border border-[#D4AF37] flex items-center justify-center">
                                    <Heart size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className={`flex-1 w-full text-center ${idx % 2 !== 0 ? 'md:text-right' : 'md:text-left'}`}>
                                <h4 className="font-vibes text-3xl text-[#D4AF37] mb-2">{item.year}</h4>
                                <h5 className="font-cinzel text-xl text-white mb-2">{item.title}</h5>
                                <p className="font-cormorant text-gray-400 text-lg leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
