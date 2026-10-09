import React from 'react';
import { m } from 'framer-motion';
import { Calendar, ChevronDown, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { km } from 'date-fns/locale';
import { WeddingData } from "../types";
import { useImagePan } from '../shared/CinematicComponents';
import { getWeddingHeroImage } from "../shared/weddingPhotos";

export const HeroSection = ({ wedding }: { wedding: WeddingData }) => {
    const { date, groomName, brideName } = wedding;
    const heroImage = getWeddingHeroImage(wedding, "/images/bg_tunnel.webp");

    const heroPan = useImagePan(
        wedding.themeSettings?.heroImageX || '50%',
        wedding.themeSettings?.heroImagePosition || '50%',
        'heroImageX',
        'heroImagePosition'
    );

    // Convert to Khmer numbers
    const toKhmerNum = (num: number | string) => {
        const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
        return String(num).split('').map(d => /\d/.test(d) ? khmerDigits[parseInt(d)] : d).join('');
    };

    const dDate = date ? new Date(date) : new Date();
    const day = toKhmerNum(format(dDate, 'dd', { locale: km }));
    const month = format(dDate, 'MMMM', { locale: km });
    const year = toKhmerNum(format(dDate, 'yyyy', { locale: km }));

    const isWedding = wedding.eventType === 'wedding';

    const addToCalendar = () => {
        if (!date) return;
        const d = new Date(date);
        const startTime = d.toISOString().replace(/-|:|\.\d+/g, '');
        const endTime = new Date(d.getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
        const title = encodeURIComponent(`${groomName} & ${brideName} ${isWedding ? 'Wedding' : 'Celebration'}`);
        const loc = encodeURIComponent(wedding.location || '');
        const details = encodeURIComponent(`សូមគោរពអញ្ជើញចូលរួមកម្មវិធីរបស់ ${groomName} & ${brideName}`);
        
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${loc}`;
        window.open(googleUrl, '_blank');
    };

    return (
        <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-between items-center overflow-hidden bg-[#f7f1ea] text-slate-900 font-kantumruy select-none">
            {/* Full-bleed Pre-wedding Cover Photo with Interactive Pan */}
            <div 
                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
                onMouseDown={heroPan.onStart}
                onTouchStart={heroPan.onStart}
                title="អូសដើម្បីតម្រឹមរូប (Drag to adjust)"
            >
                <img 
                    src={heroImage}
                    alt="Cover" 
                    className="w-full h-full object-cover opacity-90 transform scale-[1.04] transition-transform duration-1000 pointer-events-none"
                    style={{ objectPosition: `${heroPan.localX} ${heroPan.localY}` }}
                />
                
                {/* Soft cream and blue overlay for the M3 look */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#f7f1ea]/70 via-[#f7f1ea]/35 to-[#f7f1ea]/80 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(59,130,246,0.08)_38%,rgba(247,241,234,0.80)_100%)] pointer-events-none" />
            </div>

            {/* Top: Event Subheader */}
            <div
                className="relative z-10 pt-10 sm:pt-14 text-center px-4"
            >
                <div className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/70 px-4 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                    <p className="text-[10px] sm:text-xs font-khmer-moul text-slate-700 tracking-[0.22em] uppercase">
                        {isWedding ? "សិរីមង្គលអាពាហ៍ពិពាហ៍" : "សិរីមង្គលពិធីភ្ជាប់ពាក្យ"}
                    </p>
                </div>
            </div>

            {/* Bottom Content Area: Names, Date, Calendar Action */}
            <div
                className="relative z-10 text-center px-4 pb-10 sm:pb-14 flex flex-col items-center space-y-5 max-w-lg mx-auto"
            >
                <div className="flex max-w-full flex-col items-center gap-2 text-slate-900 drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">
                    <h1 className="m05-font-name max-w-full break-words text-3xl sm:text-4xl">
                        {groomName}
                    </h1>
                    <Heart size={18} className="fill-[#9b8055] text-[#9b8055]" aria-hidden="true" />
                    <h1 className="m05-font-name max-w-full break-words text-3xl sm:text-4xl">
                        {brideName}
                    </h1>
                </div>

                {/* Wedding Date in Khmer Calligraphy */}
                {date && (
                    <p className="pt-1 text-[11px] sm:text-sm font-khmer-moul tracking-[0.12em] text-slate-700">
                        ថ្ងៃទី {day} ខែ {month} ឆ្នាំ {year}
                    </p>
                )}

                {/* Add to Calendar Action Button */}
                <div className="pt-2">
                    <button
                        onClick={addToCalendar}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-[11px] font-kantumruy font-bold text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition-all hover:bg-white active:scale-95"
                    >
                        <Calendar size={15} className="text-slate-700" />
                        <span>កត់ត្រាទុកក្នុងប្រតិទិន</span>
                    </button>
                </div>

                {/* Scroll Indicator */}
                <div className="pt-3 flex flex-col items-center opacity-80 animate-bounce text-slate-700">
                    <ChevronDown size={18} />
                </div>
            </div>
        </section>
    );
};
