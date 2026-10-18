import React from 'react';
import { motion } from 'framer-motion';
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
        <section className="py-12 px-4 sm:px-6 bg-rose-50/30 font-kantumruy relative overflow-hidden text-center">
            <div className="max-w-md mx-auto space-y-6 relative z-10">
                <div className="space-y-1">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#B45309] block">
                        ទីតាំងប្រារព្ធពិធី
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
                </div>

                <div className="space-y-4">
                    <div className="flex min-w-0 items-start justify-center gap-2 border-y border-rose-200/80 py-3 text-left text-sm font-bold text-rose-700">
                        <MapPin size={18} />
                        <span className="min-w-0 break-words [overflow-wrap:anywhere]">{location || mapLink}</span>
                    </div>

                    {embedUrl && (
                        <div className="h-56 w-full overflow-hidden">
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
                        className="flex w-full items-center justify-center gap-2 border-y border-rose-500/70 px-4 py-3 text-xs font-bold text-rose-800 transition-colors hover:bg-rose-100/50 active:scale-98"
                    >
                        <Navigation size={14} />
                        <span>បើកមើលផ្លូវតាម Google Maps</span>
                    </a>
                </div>
            </div>
        </section>
    );
};
