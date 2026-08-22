"use client";
import React from 'react';
import Image from 'next/image';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from '../types';
import { useTranslation } from '@/i18n/LanguageProvider';

export function SacredBond({ wedding }: { wedding: WeddingData }) {
    const { t } = useTranslation();
    const certificate = wedding.galleryItems?.find(i => i.type === 'CERTIFICATE');
    if (!certificate) return null;

    return (
        <section id="sacred-bond" className="py-16 md:py-32 px-8 md:px-12 bg-white relative overflow-hidden">
            {/* Studio Atmosphere */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none premium-texture" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />

            <RevealSection>
                <div className="max-w-5xl mx-auto text-center space-y-12 relative">
                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4 text-gold-main/30">
                            <div className="w-12 h-[1px] bg-gold-main/20" />
                            <p className="font-playfair text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.8em] text-gold-main/80 uppercase font-black italic leading-relaxed">
                                {t("template.khmerLegacy.sacredBondBadge")}
                            </p>
                            <div className="w-12 h-[1px] bg-gold-main/20" />
                        </div>
                        <h3 className="font-khmer-moul text-3xl md:text-5xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                            {wedding.eventType === 'anniversary' 
                                ? t("template.khmerLegacy.sacredBondAnniversary") 
                                : t("template.khmerLegacy.sacredBondTitle")}
                        </h3>
                    </div>

                    <div className="relative group max-w-4xl mx-auto">
                        {/* Interactive Frame */}
                        <div className="absolute -inset-4 md:-inset-10 bg-gold-main/5 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="relative aspect-[1.4/1] w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] md:rounded-[5rem] overflow-hidden bg-white border-[12px] md:border-[32px] border-white ring-1 ring-gold-main/10">
                            <Image 
                                src={certificate.url} 
                                className="w-full h-full object-contain p-4 md:p-12 transition-transform duration-3000 group-hover:scale-[1.03]" 
                                alt="Marriage Certificate" 
                                fill
                                sizes="(max-w-1280px) 100vw, 1280px"
                            />
                            
                            {/* Glass overlay */}
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none rounded-[1.5rem] md:rounded-[3rem]" />
                        </div>

                        {/* Decorative Seals */}
                        <div className="absolute -bottom-6 -right-6 md:-bottom-12 md:-right-12 w-24 h-24 md:w-40 md:h-40 rotate-12 opacity-80 mix-blend-multiply filter contrast-125">
                            <Image src="/images/assets/user-red-heart.png" fill className="object-contain" alt="Seal" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-8 pt-12">
                         <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
                         <p className="font-khmer-content text-gold-main/60 text-sm md:text-base italic font-black tracking-[0.2em] md:tracking-widest uppercase leading-loose">
                            {t("template.khmerLegacy.eternalPromise")}
                         </p>
                    </div>
                </div>
            </RevealSection>
        </section>
    );
}
