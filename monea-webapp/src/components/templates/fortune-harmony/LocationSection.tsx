import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { WeddingData } from '../types';
import { getDirectMapUrl } from '../shared/mapUtils';

interface LocationSectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ wedding, primaryColor }) => {
    const location = wedding.location?.trim() || "";
    const mapLink = wedding.themeSettings?.mapLink?.trim() || wedding.mapUrl?.trim() || "";
    if (!location && !mapLink) return null;

    const directUrl = getDirectMapUrl(mapLink, location);

    return (
        <section className="py-12 px-4 sm:px-6 bg-transparent text-[#2d352b] font-kantumruy relative overflow-hidden text-center">
            <div className="max-w-md mx-auto space-y-6 relative z-10">
                <div className="space-y-1">
                    <span className="fh-khmer-safe block px-2 font-khmer-moul text-lg text-[#4d5649] sm:text-2xl">
                        ទីតាំងប្រារព្ធពិធី
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#8ea07a] to-transparent mx-auto" />
                </div>

                <div className="relative z-10 rounded-2xl border border-[#d9d1bf] bg-white/75 p-4 shadow-[0_6px_20px_rgba(45,53,43,0.06)] sm:p-5">
                    <div className="flex min-w-0 items-center gap-3 text-left">
                        <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f0e8]"
                            style={{ color: primaryColor }}
                        >
                            <MapPin aria-hidden="true" size={19} />
                        </span>
                        <span className="fh-khmer-safe min-w-0 break-words font-kantumruy text-sm font-semibold leading-6 text-[#4d5649] [overflow-wrap:anywhere]">
                            {location || "សូមបើក Google Maps ដើម្បីមើលទីតាំង"}
                        </span>
                    </div>
                    <a
                        href={directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fh-khmer-safe mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99]"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <Navigation aria-hidden="true" className="shrink-0" size={14} />
                        <span className="fh-khmer-safe min-w-0 text-center">បើកមើលផ្លូវតាម Google Maps</span>
                    </a>
                </div>
            </div>
        </section>
    );
};
