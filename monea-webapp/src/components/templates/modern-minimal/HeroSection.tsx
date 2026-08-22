"use client";
import React from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { WeddingData } from "../types";
import Image from "next/image";
import { useImagePan } from '../shared/CinematicComponents';

export const HeroSection = ({ wedding }: { wedding: WeddingData }) => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 300]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    const heroImage = wedding.themeSettings?.heroImage || (wedding.galleryItems && wedding.galleryItems.length > 0 ? wedding.galleryItems[0].url : "");

    const heroPan = useImagePan(
        wedding.themeSettings?.heroImageX || '50%',
        wedding.themeSettings?.heroImagePosition || '50%',
        'heroImageX',
        'heroImagePosition'
    );

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white">
            <m.div 
                style={{ y, opacity }} 
                className="absolute inset-0 w-full h-full cursor-move"
                onMouseDown={heroPan.onStart}
                onTouchStart={heroPan.onStart}
            >
                {heroImage ? (
                    <>
                        <Image 
                            src={heroImage}
                            alt="Hero"
                            fill
                            className="object-cover scale-105 filter grayscale-[50%] pointer-events-none"
                            style={{ objectPosition: `${heroPan.localX} ${heroPan.localY}` }}
                            priority
                        />
                        <div className="absolute inset-0 bg-white/40 mix-blend-screen" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/20" />
                    </>
                ) : (
                    <div className="w-full h-full bg-slate-100" />
                )}
            </m.div>

            <div className="relative z-10 text-center px-8 flex flex-col items-center">
                <m.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="overflow-hidden mb-12"
                >
                    <p className="text-xs md:text-sm font-bold tracking-[0.6em] uppercase text-slate-800">
                        {wedding.eventType === 'anniversary' ? 'Anniversary Celebration' : 'Wedding Celebration'}
                    </p>
                </m.div>

                <m.h1 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-slate-900 uppercase"
                >
                    {wedding.groomName} <br/> <span className="text-slate-300 font-light">&amp;</span> <br/> {wedding.brideName}
                </m.h1>

                <m.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-16 flex flex-col items-center space-y-4"
                >
                    <div className="h-16 w-[1px] bg-slate-900" />
                    <p className="text-xs font-bold tracking-[0.4em] uppercase text-slate-900">
                        Scroll to Explore
                    </p>
                </m.div>
            </div>
        </section>
    );
};
