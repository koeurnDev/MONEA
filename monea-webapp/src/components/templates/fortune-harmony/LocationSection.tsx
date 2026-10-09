import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { WeddingData } from '../types';
import { getDirectMapUrl, getMapEmbedUrl } from '../shared/mapUtils';

interface LocationSectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ wedding, primaryColor }) => {
    const location = wedding.location?.trim() || "";
    const mapLink = wedding.themeSettings?.mapLink?.trim() || wedding.mapUrl?.trim() || "";
    const mapLocation = mapLink || location;
    if (!mapLocation) return null;

    const canEmbedMap = !mapLocation.startsWith("http")
        || mapLocation.includes("google.com/maps/embed")
        || (mapLocation.includes("google.com") && mapLocation.includes("q="));
    const embedUrl = canEmbedMap ? getMapEmbedUrl(mapLocation, location) : null;
    const directUrl = getDirectMapUrl(mapLocation, location);

    return (
        <section className="py-12 px-4 sm:px-6 bg-transparent text-[#2d352b] font-kantumruy relative overflow-hidden text-center">
            <div className="max-w-md mx-auto space-y-6 relative z-10">
                <div className="space-y-1">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#4d5649] block">
                        ទីតាំងប្រារព្ធពិធី
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#8ea07a] to-transparent mx-auto" />
                </div>

                <div className="bg-[#fffdf8]/85 border border-[#d9d1bf] rounded-3xl p-5 shadow-md space-y-4 relative z-10">
                    <div className="flex items-center justify-center gap-2 text-[#4d5649] font-bold text-sm">
                        <MapPin size={18} />
                        <span>{location || mapLink}</span>
                    </div>

                    {embedUrl && (
                        <div className="w-full h-56 rounded-2xl overflow-hidden border border-amber-400/30 shadow-inner">
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
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all"
                    >
                        <Navigation size={14} />
                        <span>បើកមើលផ្លូវតាម Google Maps</span>
                    </a>
                </div>
            </div>
        </section>
    );
};
