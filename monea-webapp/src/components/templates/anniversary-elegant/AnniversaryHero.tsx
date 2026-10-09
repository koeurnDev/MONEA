import React from 'react';
import { m } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { km } from 'date-fns/locale';
import type { WeddingData } from '../types';
import { useImagePan } from '../shared/CinematicComponents';
import { getWeddingHeroImage } from "../shared/weddingPhotos";

export const AnniversaryHero = ({ wedding }: { wedding: WeddingData }) => {
    const { groomName, brideName, date, location } = wedding;

    // Convert to Khmer digits helper
    const toKhmerNum = (num: number | string) => {
        const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
        return String(num).split('').map(d => /\d/.test(d) ? khmerDigits[parseInt(d)] : d).join('');
    };

    const dDate = date ? new Date(date) : new Date();
    const day = toKhmerNum(format(dDate, 'dd', { locale: km }));
    const month = format(dDate, 'MMMM', { locale: km });
    const year = toKhmerNum(format(dDate, 'yyyy', { locale: km }));

    const heroImage = getWeddingHeroImage(wedding);

    const heroPan = useImagePan(
        wedding.themeSettings?.heroImageX || '50%',
        wedding.themeSettings?.heroImagePosition || '25%',
        'heroImageX',
        'heroImagePosition'
    );

    const isWedding = wedding.eventType === 'wedding';
    const eventHeader = isWedding 
        ? "— សិរីមង្គលអាពាហ៍ពិពាហ៍ —" 
        : "— សិរីមង្គលភ្ជាប់ពាក្យ —";

    const addToCalendar = () => {
        if (!date) return;
        const d = new Date(date);
        const startTime = d.toISOString().replace(/-|:|\.\d+/g, '');
        const endTime = new Date(d.getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
        const title = encodeURIComponent(`${groomName} & ${brideName} ${isWedding ? 'Wedding' : 'Celebration'}`);
        const loc = encodeURIComponent(location || '');
        const details = encodeURIComponent(`សូមគោរពអញ្ជើញចូលរួមកម្មវិធីរបស់ ${groomName} & ${brideName}`);
        
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&location=${loc}&details=${details}`;
        window.open(googleUrl, '_blank');
    };

    return (
        <section className="relative w-full h-screen min-h-[620px] max-h-[920px] overflow-hidden text-white flex flex-col justify-between items-center py-10 sm:py-14 px-4 text-center select-none bg-[#211A1B]">
            {/* Full Screen Cinematic Background Image */}
            <div 
                className="absolute inset-0 w-full h-full cursor-move"
                onMouseDown={heroPan.onStart}
                onTouchStart={heroPan.onStart}
                title="អូសដើម្បីតម្រឹមរូប (Drag to adjust)"
            >
                {heroImage && <img
                    src={heroImage}
                    alt="Couple Portrait"
                    className="w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition: `${heroPan.localX} ${heroPan.localY}` }}
                />}
                
                {/* Luxury Gradient Overlays for Crystal Clear Typography */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#171316]/75 via-transparent to-[#24191B]/95 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#24191B] via-[#24191B]/70 to-transparent pointer-events-none" />
            </div>

            {/* Top Event Header */}
            <m.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 space-y-1.5 pt-2"
            >
                <p className="text-xs sm:text-sm font-khmer-moul text-amber-200 tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {eventHeader}
                </p>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#E7C783] to-transparent mx-auto" />
            </m.div>

            {/* Bottom Content: Couple Names, Date, & Calendar Button */}
            <m.div 
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className="relative z-10 max-w-md w-full mx-auto flex flex-col items-center space-y-5 pb-2"
            >
                {/* Couple Names (Royal Gold Typography) */}
                <div className="space-y-1.5 w-full px-2">
                    <h1 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-[#F8E8C5] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-wide leading-relaxed">
                        {groomName}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3">
                        <span className="w-10 h-px bg-[#E7C783]/50" />
                        <span className="font-khmer-moul text-xs text-[#E7C783] drop-shadow-md">និង</span>
                        <span className="w-10 h-px bg-[#E7C783]/50" />
                    </div>

                    <h1 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-[#F8E8C5] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-wide leading-relaxed">
                        {brideName}
                    </h1>
                </div>

                {/* Date Heading */}
                <p className="text-[#F1DDAF]/90 font-kantumruy font-bold text-xs sm:text-sm drop-shadow-md">
                    — ថ្ងៃទី {day} ខែ {month} ឆ្នាំ {year} —
                </p>

                {/* Calendar Action Button */}
                <button
                    onClick={addToCalendar}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-[#E7C783]/60 text-[#F8E8C5] text-xs font-kantumruy font-bold shadow-2xl transition-all"
                >
                    <Calendar size={15} className="text-[#E7C783]" />
                    <span>កត់ត្រាទុកក្នុងប្រតិទិន</span>
                </button>
            </m.div>
        </section>
    );
};
