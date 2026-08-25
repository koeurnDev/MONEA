import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { useImagePan } from "../shared/CinematicComponents";

export const LetterSection = ({ wedding }: { wedding: WeddingData }) => {
    // Try to find specific groom/bride photos, fallback to gallery items or hero image
    const validGallery = (wedding.galleryItems || []).filter(img => typeof img?.url === 'string' && img.url.trim() !== '');

    const groomPhoto = 
        wedding.galleryItems?.find(img => img.type === 'groom' && img.url)?.url ||
        validGallery[0]?.url ||
        wedding.themeSettings?.heroImage || 
        "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg";
        
    const bridePhoto = 
        wedding.galleryItems?.find(img => img.type === 'bride' && img.url)?.url ||
        validGallery[1]?.url ||
        validGallery[0]?.url ||
        wedding.themeSettings?.heroImage || 
        "/assets/khmer-legacy/621811002_905396558712142_5126771807004187076_n.jpg";

    const groomPan = useImagePan(
        wedding.themeSettings?.groomImageX || '50%',
        wedding.themeSettings?.groomImageY || '50%',
        'groomImageX',
        'groomImageY'
    );

    const bridePan = useImagePan(
        wedding.themeSettings?.brideImageX || '50%',
        wedding.themeSettings?.brideImageY || '50%',
        'brideImageX',
        'brideImageY'
    );

    return (
        <section className="py-20 md:py-28 bg-white relative border-b border-slate-100">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    {/* Header Badge */}
                    <div className="space-y-2">
                        <p className="font-kantumruy text-xs text-slate-400 font-bold tracking-normal">
                            — សំបុត្រគោរពអញ្ជើញ —
                        </p>
                        <h3 className="font-khmer-moul text-xl md:text-3xl text-slate-900 leading-relaxed">
                            សិរីសួស្តី អាពាហ៍ពិពាហ៍
                        </h3>
                    </div>

                    <div className="w-20 h-[1px] bg-slate-200 mx-auto" />

                    {/* Letter Body */}
                    <div className="max-w-3xl mx-auto flex flex-col gap-6 md:gap-8 font-kantumruy text-slate-700 leading-relaxed md:leading-loose text-sm md:text-base">
                        <p className="font-bold text-slate-800 text-base md:text-lg">
                            មានកិត្តិយសសូមគោរពអញ្ជើញ
                        </p>
                        
                        <div className="px-5 py-6 md:py-8 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                            <h4 className="font-khmer-moul text-base md:text-lg text-slate-900 leading-relaxed">
                                {wedding.guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា"}
                            </h4>
                            <p className="text-[#A27A1E] text-center leading-relaxed md:leading-loose text-xs sm:text-sm font-medium">
                                អញ្ជើញចូលរួមជាអធិបតី ដើម្បីប្រសិទ្ធពរជ័យសិរីសួស្តី ជ័យមង្គល ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍កូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ
                            </p>
                        </div>

                        {/* Perfectly Aligned Couple Portraits Grid */}
                        <div className="grid grid-cols-[1fr_auto_1fr] items-start justify-center gap-2 sm:gap-4 md:gap-8 py-6 w-full max-w-lg mx-auto">
                            {/* Groom Column */}
                            <div className="flex flex-col items-center text-center space-y-1.5 min-w-0">
                                <div 
                                    className="w-24 h-32 sm:w-32 sm:h-40 md:w-36 md:h-48 rounded-tl-[36px] rounded-br-[36px] rounded-tr-lg rounded-bl-lg overflow-hidden shadow-md border-2 border-white ring-1 ring-slate-200/80 bg-slate-100 transition-transform duration-300 hover:scale-105 cursor-move relative"
                                    onMouseDown={groomPan.onStart}
                                    onTouchStart={groomPan.onStart}
                                    title="អូសដើម្បីតម្រឹមរូប (Drag to adjust)"
                                >
                                    <img 
                                        src={groomPhoto} 
                                        alt="Groom" 
                                        className="w-full h-full object-cover pointer-events-none" 
                                        style={{ objectPosition: `${groomPan.localX} ${groomPan.localY}` }} 
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-400 block font-kantumruy pt-1">
                                    កូនប្រុសនាម
                                </span>
                                <h4 className="font-suwannaphum text-sm sm:text-base md:text-xl text-slate-900 font-bold leading-normal whitespace-nowrap px-1 max-w-full">
                                    {wedding.groomName}
                                </h4>
                            </div>

                            {/* Center Ampersand */}
                            <div className="flex flex-col items-center justify-center pt-12 sm:pt-16 text-slate-300 font-light text-xl sm:text-3xl font-serif select-none px-1">
                                &amp;
                            </div>

                            {/* Bride Column */}
                            <div className="flex flex-col items-center text-center space-y-1.5 min-w-0">
                                <div 
                                    className="w-24 h-32 sm:w-32 sm:h-40 md:w-36 md:h-48 rounded-tr-[36px] rounded-bl-[36px] rounded-tl-lg rounded-br-lg overflow-hidden shadow-md border-2 border-white ring-1 ring-slate-200/80 bg-slate-100 transition-transform duration-300 hover:scale-105 cursor-move relative"
                                    onMouseDown={bridePan.onStart}
                                    onTouchStart={bridePan.onStart}
                                    title="អូសដើម្បីតម្រឹមរូប (Drag to adjust)"
                                >
                                    <img 
                                        src={bridePhoto} 
                                        alt="Bride" 
                                        className="w-full h-full object-cover pointer-events-none" 
                                        style={{ objectPosition: `${bridePan.localX} ${bridePan.localY}` }} 
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-400 block font-kantumruy pt-1">
                                    កូនស្រីនាម
                                </span>
                                <h4 className="font-suwannaphum text-sm sm:text-base md:text-xl text-slate-900 font-bold leading-normal whitespace-nowrap px-1 max-w-full">
                                    {wedding.brideName}
                                </h4>
                            </div>
                        </div>

                        <div className="w-20 h-[1px] bg-slate-200 mx-auto" />

                        <p className="text-slate-600 text-center leading-relaxed md:leading-loose text-xs sm:text-sm max-w-xl mx-auto">
                            {wedding.themeSettings?.invitationText || "យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅបំផុត ចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តមរបស់លោកអ្នក ដែលបានចំណាយពេលវេលាដ៏មានតម្លៃចូលរួមក្នុងថ្ងៃមង្គលរបស់យើងខ្ញុំ។"}
                        </p>

                        <p className="font-khmer-moul text-base md:text-lg text-[#A27A1E] pt-4">
                            សូមអរគុណ!
                        </p>
                    </div>
                </m.div>
            </div>
        </section>
    );
};
