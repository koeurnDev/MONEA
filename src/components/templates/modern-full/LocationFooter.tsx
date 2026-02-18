import React from 'react';
import { MapPin } from 'lucide-react';
import { WeddingData } from "../types";

interface LocationFooterProps {
    wedding: WeddingData;
    labels: any;
    primaryColor: string;
    mapLink: string;
}

export default function LocationFooter({ wedding, labels, primaryColor, mapLink }: LocationFooterProps) {
    return (
        <footer className="p-12 text-center text-white pb-32 md:p-12" style={{ backgroundColor: primaryColor }}>
            <MapPin className="mx-auto mb-4 animate-bounce" size={32} />
            <h4 className="text-xl font-kantumruy mb-2 font-bold">{labels.location_title}</h4>
            <p className="mb-6 opacity-90">{wedding.location || "សាលមហោស្រពកោះពេជ្រ (អាគារ A)"}</p>
            <p className="text-sm opacity-75 mb-4">{labels.thanks_label}</p>
            <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-white/40 bg-white/10 backdrop-blur-sm px-8 py-2 rounded-full hover:bg-white transition-all duration-300"
                style={{ color: 'white' }}
            >
                មើលផែនទី
            </a>
            <p className="mt-10 text-[10px] opacity-30 tracking-widest font-kantumruy">រក្សាសិទ្ធិគ្រប់យ៉ាងដោយ Focus Solution</p>
        </footer>
    );
}
