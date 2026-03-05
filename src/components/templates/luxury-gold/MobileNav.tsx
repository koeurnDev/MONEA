import React from 'react';
import { MapPin, Heart, Sparkles } from 'lucide-react';

interface MobileNavProps {
    mapLink: string;
    addToCalendarUrl: string;
}

export default function MobileNav({ mapLink, addToCalendarUrl }: MobileNavProps) {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-sm border-t border-[#D4AF37]/30 px-6 py-4 flex justify-between items-center shadow-2xl safe-area-bottom will-change-transform">
            <a href={mapLink} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-[#D4AF37] hover:text-white transition-colors group">
                <MapPin size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Map</span>
            </a>
            <a href={addToCalendarUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center hover:scale-105 transition-transform">
                <div className="bg-[#D4AF37]/20 p-3 rounded-full -mt-10 border border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] backdrop-blur-sm shadow-gold/20 will-change-transform">
                    <Heart size={20} className="fill-[#D4AF37] text-[#D4AF37]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mt-1">Date</span>
            </a>
            <div onClick={() => document.getElementById('rsvp-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-[#D4AF37] hover:text-white transition-colors cursor-pointer group">
                <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Wishes</span>
            </div>
        </div>
    );
}
