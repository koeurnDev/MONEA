"use client";
import React from 'react';
import { Phone, Map, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactSection({ wedding }: { wedding: any }) {
    // Default Phone Numbers if not in wedding data (using reference image numbers as placeholders if needed, but better to genericize)
    const phone1 = "012 345 678";
    const phone2 = "010 345 678";

    return (
        <section className="py-10 px-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
            >
                {/* Title */}
                <h3 className="text-xl md:text-2xl font-kantumruy text-pink-300 mb-8 drop-shadow-md font-bold">ទំនាក់ទំនងម្ចាស់កម្មវិធី</h3>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">

                    {/* 1. Phone Numbers */}
                    <div className="flex flex-col items-center md:items-start gap-4 flex-1">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-300 animate-pulse">
                                <Phone size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-khmer text-lg tracking-wider">{phone1}</p>
                                <p className="text-white font-khmer text-lg tracking-wider">{phone2}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Map Preview (Center) */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="relative w-48 h-32 bg-gray-300 rounded-lg overflow-hidden shadow-lg border-2 border-white/20 mb-4 group cursor-pointer">
                            {/* Dynamic Map Image */}
                            <img
                                src={wedding.themeSettings?.mapImage || "/images/map.jpg"}
                                alt="Map Preview"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition-all">
                                <Map className="text-white opacity-80" size={32} />
                            </div>
                        </div>
                        <a href={wedding.themeSettings?.mapLink} target="_blank" className="flex items-center gap-2 text-pink-300 font-bold hover:text-white transition-colors border-b border-pink-300/50 pb-1 font-kantumruy">
                            មើលផែនទី <ArrowRight size={16} />
                        </a>

                        {/* Curator Arrow (Decorative) */}
                        <svg className="absolute hidden md:block w-24 h-24 text-pink-300/50 -left-12 bottom-0 rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10,50 Q50,90 90,50" />
                            <path d="M80,45 L90,50 L85,60" />
                        </svg>
                    </div>

                    {/* 3. QR Code */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="bg-white p-2 rounded-xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform">
                            {/* Dynamic Location QR */}
                            <img
                                src={wedding.themeSettings?.locationQr || "/images/qr.jpg"}
                                alt="Map QR"
                                className="w-32 h-32 object-contain"
                            />
                        </div>
                        <p className="mt-3 text-xs text-white/70 font-khmer">ស្កេនទីនេះដើម្បី<br />រកទីតាំងផ្ទះការ</p>
                    </div>

                </div>

                {/* Footer Text */}
                <div className="mt-12 flex items-center justify-center gap-4">
                    <span className="text-3xl text-pink-300/80">♥</span>
                    <p className="font-kantumruy text-xl md:text-2xl text-white/90">សូមអរគុណសម្រាប់ការចូលរួមជាកិត្តិយសក្នុងពិធីរបស់យើងខ្ញុំ!</p>
                    <span className="text-3xl text-pink-300/80">♥</span>
                </div>

            </motion.div>
        </section>
    );
}
