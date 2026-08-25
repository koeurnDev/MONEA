import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { WeddingData } from '../types';

interface LocationSectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ wedding, primaryColor }) => {
    const location = wedding.location || "រាជធានីភ្នំពេញ";

    const getMapEmbedUrl = (loc?: string) => {
        if (!loc) return null;
        if (loc.includes("google.com/maps/embed")) return loc;
        return `https://maps.google.com/maps?q=${encodeURIComponent(loc)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    };

    const getDirectMapUrl = (loc?: string) => {
        if (!loc) return "https://maps.google.com";
        if (loc.startsWith("http")) return loc;
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
    };

    const embedUrl = getMapEmbedUrl(location);
    const directUrl = getDirectMapUrl(location);

    return (
        <section className="py-12 px-4 sm:px-6 bg-emerald-50/30 font-kantumruy relative overflow-hidden text-center">
            <div className="max-w-md mx-auto space-y-6 relative z-10">
                <div className="space-y-1">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#1B4332] block">
                        ទីតាំងប្រារព្ធពិធី
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent mx-auto" />
                </div>

                <div className="bg-white/90 border border-emerald-200/80 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                        <MapPin size={18} />
                        <span>{location}</span>
                    </div>

                    {embedUrl && (
                        <div className="w-full h-56 rounded-2xl overflow-hidden border border-emerald-200 shadow-inner">
                            <iframe
                                title="Wedding Map"
                                src={embedUrl}
                                className="w-full h-full border-0"
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    )}

                    <a
                        href={directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all"
                    >
                        <Navigation size={14} />
                        <span>បើកមើលផ្លូវតាម Google Maps</span>
                    </a>
                </div>
            </div>
        </section>
    );
};
