"use client";
import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import Image from 'next/image';
import { useImagePan } from "../shared/CinematicComponents";

export const LetterSection = ({ wedding }: { wedding: WeddingData }) => {
    // Try to find specific groom/bride photos, fallback to gallery items or hero image
    const groomPhoto = wedding.galleryItems?.find(img => img.type === 'groom')?.url 
        || wedding.galleryItems?.[1]?.url 
        || wedding.themeSettings?.heroImage 
        || "/images/templates/modern-minimal/hero.jpg";
        
    const bridePhoto = wedding.galleryItems?.find(img => img.type === 'bride')?.url 
        || wedding.galleryItems?.[2]?.url 
        || wedding.themeSettings?.heroImage 
        || "/images/templates/modern-minimal/hero.jpg";

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
        <section className="py-24 md:py-32 bg-white relative border-b border-slate-100">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-2xl md:text-3xl font-kantumruy font-black text-[#805C00] tracking-widest uppercase">
                        សំបុត្រអញ្ជើញ
                    </h2>
                    <div className="w-12 h-[1px] bg-[#805C00]/50 mt-6 mx-auto" />
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="space-y-12"
                >
                    {/* Parents Section */}
                    <div className="flex flex-row items-start justify-center gap-4 md:gap-16 w-full">
                        {/* Groom Parents */}
                        <div className="flex-1 text-right space-y-2 md:space-y-4">
                            <p className="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-widest font-kantumruy">បិតា និង មាតា <br className="md:hidden"/>ខាងកូនប្រុស</p>
                            <p className="font-kantumruy text-slate-800 leading-relaxed font-bold text-xs md:text-base">
                                {wedding.themeSettings?.parents?.groomFather || "លោក លីវ សុីផា"}<br />
                                {wedding.themeSettings?.parents?.groomMother || "អ្នកស្រី ឡុង មីន្នា"}
                            </p>
                        </div>
                        
                        <div className="w-px h-20 md:h-24 bg-slate-200 mt-2" />

                        {/* Bride Parents */}
                        <div className="flex-1 text-left space-y-2 md:space-y-4">
                            <p className="text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-widest font-kantumruy">បិតា និង មាតា <br className="md:hidden"/>ខាងកូនស្រី</p>
                            <p className="font-kantumruy text-slate-800 leading-relaxed font-bold text-xs md:text-base">
                                {wedding.themeSettings?.parents?.brideFather || "លោក លីវ មេសា"}<br />
                                {wedding.themeSettings?.parents?.brideMother || "អ្នកស្រី រាន់ សុលីតា"}
                            </p>
                        </div>
                    </div>

                    <div className="w-24 h-[1px] bg-slate-200 mx-auto" />

                    {/* Letter Body */}
                    <div className="max-w-3xl mx-auto space-y-8 font-kantumruy text-slate-700 leading-relaxed md:leading-loose text-sm md:text-base">
                        <p className="font-bold">មានកិត្តិយសសូមគោរពអញ្ជើញ</p>
                        
                        <p className="text-lg md:text-xl font-khmer-moul text-[#805C00] leading-normal px-4 py-6 bg-slate-50 rounded-2xl border border-slate-100">
                            {wedding.guestName || "ឯកឧត្តម លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា និង ប្រិយមិត្ត"}
                        </p>

                        <p className="text-slate-600 text-justify md:text-center">
                            អញ្ជើញចូលរួមជាអធិបតី ដើម្បីប្រសិទ្ធពរជ័យសិរីសួស្តី ជ័យមង្គល ពិធីរៀបអាពាហ៍ពិពាហ៍ កូនប្រុស-ស្រី របស់យើងខ្ញុំ
                        </p>

                        <div className="flex flex-row items-end justify-center gap-4 md:gap-16 font-black text-xl md:text-3xl text-slate-900 py-8 w-full">
                            <div className="flex-1 flex flex-col items-end text-right">
                                <div 
                                    className="w-20 h-24 md:w-32 md:h-40 rounded-tl-[40px] rounded-br-[40px] rounded-tr-md rounded-bl-md overflow-hidden shadow-lg border border-white/50 mb-4 relative ring-1 ring-slate-100 bg-slate-100 transition-transform duration-500 hover:scale-105 cursor-move"
                                    onMouseDown={groomPan.onStart}
                                    onTouchStart={groomPan.onStart}
                                >
                                    <Image src={groomPhoto} alt="Groom" fill className="object-cover scale-110 pointer-events-none" style={{ objectPosition: `${groomPan.localX} ${groomPan.localY}` }} />
                                </div>
                                <span className="text-xs md:text-sm font-bold text-slate-400 block mb-1 md:mb-2 font-kantumruy">កូនប្រុសនាម</span>
                                <span className="font-suwannaphum tracking-wide">{wedding.groomName}</span>
                            </div>
                            <div className="text-slate-300 font-light text-2xl md:text-4xl px-2 pb-2 md:pb-4">&amp;</div>
                            <div className="flex-1 flex flex-col items-start text-left">
                                <div 
                                    className="w-20 h-24 md:w-32 md:h-40 rounded-tr-[40px] rounded-bl-[40px] rounded-tl-md rounded-br-md overflow-hidden shadow-lg border border-white/50 mb-4 relative ring-1 ring-slate-100 bg-slate-100 transition-transform duration-500 hover:scale-105 cursor-move"
                                    onMouseDown={bridePan.onStart}
                                    onTouchStart={bridePan.onStart}
                                >
                                    <Image src={bridePhoto} alt="Bride" fill className="object-cover scale-110 pointer-events-none" style={{ objectPosition: `${bridePan.localX} ${bridePan.localY}` }} />
                                </div>
                                <span className="text-xs md:text-sm font-bold text-slate-400 block mb-1 md:mb-2 font-kantumruy">កូនស្រីនាម</span>
                                <span className="font-suwannaphum tracking-wide">{wedding.brideName}</span>
                            </div>
                        </div>

                        <div className="w-24 h-[1px] bg-slate-200 mx-auto" />

                        <p className="text-slate-600">
                            ពិសារភោជនាហារជ័យក្លែមាលាថ្ងៃព្រហស្បតិ៍ ៣កើត ខែផល្គុន ឆ្នាំខាល ចត្វាស័ក ព.ស. ២៥៦៥<br className="hidden md:block"/> 
                            <span className="font-bold text-slate-800">ត្រូវនឹងថ្ងៃទី២៤ ខែកុម្ភៈ ឆ្នាំ២០២៧ វេលាម៉ោង ៥:០០ នាទីល្ងាច</span>
                        </p>

                        <p className="text-slate-600">
                            <span className="font-bold text-slate-800">នៅគេហដ្ឋានខាងស្រី៖</span> ស្ថិតនៅភូមិមុន្នី ឃុំមេសាជ្រៃ ស្រុកទឹកផុស ខេត្តកំពង់ឆ្នាំង ជាទីមេត្រី។
                        </p>

                        <p className="font-khmer-moul text-lg text-[#805C00] pt-8">
                            សូមអរគុណ!
                        </p>
                    </div>
                </m.div>
            </div>
        </section>
    );
};
