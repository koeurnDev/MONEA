import React from 'react';
import { MapPin } from 'lucide-react';
import { WeddingData } from "../types";

interface LocationFooterProps {
    wedding: WeddingData;
    labels: any;
    mapLink: string;
}

export default function LocationFooter({ wedding, labels, mapLink }: LocationFooterProps) {
    return (
        <footer className="bg-black py-20 px-8 text-center border-t border-[#D4AF37]/20 pb-32 md:pb-20">
            <MapPin className="text-[#D4AF37] mx-auto mb-6" size={24} />
            <h2 className="text-2xl font-header text-white mb-6 uppercase tracking-widest">{labels.location_title}</h2>
            <p className="text-gray-400 mb-10 leading-relaxed font-light font-khmer max-w-xs mx-auto">{wedding.location}</p>

            <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-12 py-4 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all uppercase text-xs tracking-[0.2em] font-header"
            >
                មើលទីតាំង
            </a>

            <div className="mt-20 pt-8 border-t border-[#D4AF37]/10 flex flex-col gap-2">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">{labels.thanks_label}</p>
                <p className="text-xs text-[#D4AF37] uppercase tracking-[0.2em]">{wedding.groomName} & {wedding.brideName}</p>
            </div>
        </footer>
    );
}
