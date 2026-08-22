"use client";
import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { MapPin } from 'lucide-react';
import Image from 'next/image';

export const LocationSection = ({ wedding }: { wedding: WeddingData }) => {
    if (!wedding.location && !wedding.mapUrl) return null;

    return (
        <section className="py-24 bg-slate-100 relative overflow-hidden" id="location-modern">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-kantumruy font-black text-[#805C00] tracking-widest uppercase">
                        ទីតាំងកម្មវិធី
                    </h2>
                    <div className="w-12 h-1 bg-slate-900 mt-6 mx-auto" />
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-200/50 flex flex-col items-center"
                >
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <MapPin className="w-6 h-6 text-[#805C00]" />
                    </div>
                    
                    <h3 className="text-xl md:text-3xl font-kantumruy font-black text-slate-900 mb-4 uppercase">
                        {wedding.locationName || 'ទីតាំងរៀបចំកម្មវិធី'}
                    </h3>
                    
                    {wedding.location && (
                        <p className="text-sm md:text-base text-slate-500 font-kantumruy leading-relaxed max-w-md mb-8">
                            {wedding.location}
                        </p>
                    )}

                    {wedding.themeSettings?.mapLink && (
                        <div className="flex flex-col items-center space-y-6 mt-4">
                            {/* Auto-generated QR Code for the Map Link */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-md">
                                <Image 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(wedding.themeSettings.mapLink)}&color=0f172a`}
                                    alt="Map QR Code"
                                    width={120}
                                    height={120}
                                    className="rounded-lg opacity-90 hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <p className="text-xs text-slate-400 font-kantumruy uppercase tracking-widest font-bold">ស្កេនដើម្បីមើលផែនទី</p>

                            <a
                                href={wedding.themeSettings.mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex px-8 py-4 bg-[#805C00] text-white text-xs font-bold tracking-[0.1em] font-kantumruy uppercase rounded-full hover:bg-[#6b4c00] transition-colors shadow-lg shadow-[#805C00]/20"
                            >
                                មើលលើផែនទី (Google Maps)
                            </a>
                        </div>
                    )}
                </m.div>
            </div>
        </section>
    );
};
