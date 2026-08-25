import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { MapPin, Navigation, QrCode } from 'lucide-react';
import { getMapEmbedUrl, getDirectMapUrl } from "../shared/mapUtils";

export const LocationSection = ({ wedding }: { wedding: WeddingData }) => {
    const venueName = wedding.location || "មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍កោះពេជ្រ (អគារ A)";
    const embedUrl = getMapEmbedUrl(wedding.themeSettings?.mapLink, venueName);
    const directMapUrl = getDirectMapUrl(wedding.themeSettings?.mapLink, venueName);

    return (
        <section className="py-20 md:py-28 bg-[#F8FAFC] relative overflow-hidden" id="location-modern">
            <div className="max-w-4xl mx-auto px-6 text-center">
                {/* Section Header */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-10 space-y-3"
                >
                    <p className="font-kantumruy text-xs text-slate-500 font-bold tracking-normal">
                        — ទីតាំងនៃកម្មវិធី —
                    </p>
                    <h2 className="text-2xl md:text-4xl font-kantumruy font-bold text-slate-900 tracking-tight">
                        {wedding.locationName || 'ទីតាំងរៀបចំកម្មវិធី'}
                    </h2>
                    <div className="w-12 h-1 bg-slate-900/80 rounded-full mx-auto my-3" />
                </m.div>

                {/* Main Card */}
                <m.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200/80 flex flex-col items-center space-y-6"
                >
                    {/* Venue Pin & Name */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shadow-sm">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <p className="text-sm md:text-base text-slate-700 font-kantumruy font-medium leading-relaxed max-w-md">
                            {venueName}
                        </p>
                    </div>

                    {/* Google Maps Embed iframe */}
                    {embedUrl && (
                        <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100">
                            <iframe
                                title="Google Maps"
                                src={embedUrl}
                                className="w-full h-full border-0"
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    )}

                    {/* QR Code & Navigation Action */}
                    <div className="flex flex-col items-center space-y-4 pt-2">
                        {/* Auto-generated QR Code for Google Maps navigation */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(directMapUrl)}&color=0f172a`}
                                alt="Map QR Code"
                                width={120}
                                height={120}
                                loading="lazy"
                                className="rounded-lg" 
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 font-kantumruy font-bold tracking-wide">
                            ស្កេន ឬចុចប៊ូតុងខាងក្រោមដើម្បីបើកផែនទី
                        </p>

                        <a
                            href={directMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-bold font-kantumruy tracking-wide rounded-full shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                        >
                            <Navigation size={15} />
                            <span>មើលលើផែនទី (Google Maps)</span>
                        </a>
                    </div>
                </m.div>
            </div>
        </section>
    );
};
