import React from 'react';
import { m } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { km } from 'date-fns/locale';
import { WeddingData } from "../types";
import { useImagePan } from '../shared/CinematicComponents';

export const HeroSection = ({ wedding }: { wedding: WeddingData }) => {
    const { date, groomName, brideName } = wedding;
    const heroImage = wedding.themeSettings?.heroImage || 
                      (wedding.galleryItems && wedding.galleryItems.length > 0 && wedding.galleryItems[0].url ? wedding.galleryItems[0].url : "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg");

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
        <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-between items-center overflow-hidden bg-slate-950 text-white font-kantumruy select-none">
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
                    className="w-full h-full object-cover transform scale-100 transition-transform duration-1000 pointer-events-none"
                    style={{ objectPosition: `${heroPan.localX} ${heroPan.localY}` }}
                />
                
                {/* Modern Dark Gradient Overlays for High Contrast Typography */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/85 pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/70 pointer-events-none" />
            </div>

            {/* Top: Event Subheader */}
            <m.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 pt-10 sm:pt-14 text-center px-4"
            >
                <p className="text-xs sm:text-sm font-khmer-moul text-white/90 tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {isWedding ? "— សិរីមង្គលអាពាហ៍ពិពាហ៍ —" : "— សិរីមង្គលពិធីភ្ជាប់ពាក្យ —"}
                </p>
            </m.div>

            {/* Bottom Content Area: Names, Date, Calendar Action */}
            <m.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className="relative z-10 text-center px-4 pb-10 sm:pb-14 flex flex-col items-center space-y-4 max-w-md mx-auto"
            >
                {/* Couple Names */}
                <div className="space-y-0.5">
                    <h1 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] leading-relaxed">
                        {groomName}
                    </h1>
                    <p className="text-sm font-serif italic text-white/70 py-0.5">&amp;</p>
                    <h1 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] leading-relaxed">
                        {brideName}
                    </h1>
                </div>

                {/* Wedding Date in Khmer Calligraphy */}
                {date && (
                    <p className="text-xs sm:text-sm font-khmer-moul text-amber-200/95 tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] pt-1">
                        — ថ្ងៃទី {day} ខែ {month} ឆ្នាំ {year} —
                    </p>
                )}

                {/* Add to Calendar Action Button */}
                <div className="pt-2">
                    <button
                        onClick={addToCalendar}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-kantumruy font-bold shadow-2xl transition-all"
                    >
                        <Calendar size={15} className="text-white" />
                        <span>កត់ត្រាទុកក្នុងប្រតិទិន</span>
                    </button>
                </div>

                {/* Scroll Indicator */}
                <div className="pt-4 flex flex-col items-center opacity-70 animate-bounce">
                    <ChevronDown size={18} className="text-white" />
                </div>
            </m.div>
        </section>
    );
};
