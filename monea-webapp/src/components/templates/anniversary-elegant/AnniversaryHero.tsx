import React from 'react';
import { m } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { km } from 'date-fns/locale';
import type { WeddingData } from '../types';
import { useImagePan } from '../shared/CinematicComponents';

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

    const heroImage = wedding.themeSettings?.heroImage || 
                      (wedding.galleryItems && wedding.galleryItems.length > 0 && wedding.galleryItems[0].url 
                        ? wedding.galleryItems[0].url 
                        : '/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg');

    const heroPan = useImagePan(
        wedding.themeSettings?.heroImageX || '50%',
        wedding.themeSettings?.heroImagePosition || '50%',
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
        <section className="relative w-full h-screen min-h-[620px] max-h-[920px] overflow-hidden text-white flex flex-col justify-between items-center py-10 sm:py-14 px-4 text-center select-none bg-slate-950">
            {/* Full Screen Cinematic Background Image */}
            <div 
                className="absolute inset-0 w-full h-full cursor-move"
                onMouseDown={heroPan.onStart}
                onTouchStart={heroPan.onStart}
                title="អូសដើម្បីតម្រឹមរូប (Drag to adjust)"
            >
                <img
                    src={heroImage}
                    alt="Couple Portrait"
                    className="w-full h-full object-cover scale-105 pointer-events-none"
                    style={{ objectPosition: `${heroPan.localX} ${heroPan.localY}` }}
                />
                
                {/* Luxury Gradient Overlays for Crystal Clear Typography */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-[#19042B]/95 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#19042B] via-[#19042B]/75 to-transparent pointer-events-none" />
            </div>

            {/* Top Event Header */}
            <m.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 space-y-1.5 pt-2"
            >
                <p className="text-xs sm:text-sm font-khmer-moul text-amber-200 tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {eventHeader}
                </p>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto" />
            </m.div>

            {/* Bottom Content: Couple Names, Date, & Calendar Button */}
            <m.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className="relative z-10 max-w-md w-full mx-auto flex flex-col items-center space-y-5 pb-2"
            >
                {/* Couple Names (Royal Gold Typography) */}
                <div className="space-y-1.5 w-full px-2">
                    <h1 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-amber-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-wide leading-relaxed">
                        {groomName}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3">
                        <span className="w-10 h-px bg-amber-300/40" />
                        <span className="font-khmer-moul text-xs text-amber-300 drop-shadow-md">និង</span>
                        <span className="w-10 h-px bg-amber-300/40" />
                    </div>

                    <h1 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-amber-100 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] tracking-wide leading-relaxed">
                        {brideName}
                    </h1>
                </div>

                {/* Date Heading */}
                <p className="text-amber-200/90 font-kantumruy font-bold text-xs sm:text-sm drop-shadow-md">
                    — ថ្ងៃទី {day} ខែ {month} ឆ្នាំ {year} —
                </p>

                {/* Calendar Action Button */}
                <button
                    onClick={addToCalendar}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-amber-300/50 text-amber-100 text-xs font-kantumruy font-bold shadow-2xl transition-all"
                >
                    <Calendar size={15} className="text-amber-300" />
                    <span>កត់ត្រាទុកក្នុងប្រតិទិន</span>
                </button>
            </m.div>
        </section>
    );
};
