"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { m, useScroll, useTransform } from 'framer-motion';
import { Star, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { AUTH_URLS } from "@/lib/constants";

export function Hero() {
    const { scrollY } = useScroll();
    const yParallax = useTransform(scrollY, [0, 1000], [0, 200]);
    const yMobileParallax = useTransform(scrollY, [0, 500], [0, 50]);
    const opacityParallax = useTransform(scrollY, [0, 500], [1, 0.2]);
    const { t } = useTranslation();

    // Use a state to check if we are on mobile to disable parallax
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    const y = isMobile ? yMobileParallax : yParallax;
    const opacity = isMobile ? 0.6 : opacityParallax;

    return (
        <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-black pb-20 pt-32">
            {/* Background Parallax */}
            <m.div style={{ y, opacity }} className="absolute inset-0 z-0">
                <Image
                    src="/images/bg_tunnel.webp"
                    alt="Wedding Tunnel"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 120vw, 150vw"
                    className="object-cover opacity-20 dark:opacity-40 scale-[1.1] will-change-transform"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-white/90 dark:from-black dark:via-black/70 dark:to-black/90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-90" />
            </m.div>

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center mt-10 md:mt-0">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/40 dark:bg-white/5 sm:backdrop-blur-xl border border-slate-200/50 dark:border-white/10 mb-12 group cursor-default shadow-sm hover:shadow-md transition-all duration-500">
                        <Star className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 fill-emerald-500 dark:fill-emerald-400 group-hover:rotate-180 transition-transform duration-1000" />
                        <span className="text-slate-900 dark:text-white/90 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mt-0.5 whitespace-nowrap font-kantumruy">
                            {t("hero.badge")}
                        </span>
                    </div>
                </m.div>

                <div className="relative mb-12 group">
                    {/* Masterpiece Glow */}
                    <div className="absolute -inset-x-20 -inset-y-10 bg-pink-500/10 dark:bg-pink-500/20 rounded-[5rem] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    
                    <m.h1
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center justify-center gap-y-2 mb-10 drop-shadow-2xl overflow-visible px-4 relative z-10"
                    >
                        <span className="text-4xl xs:text-5xl sm:text-6xl md:text-[5.5rem] lg:text-[7.5rem] font-black font-kantumruy text-slate-900 dark:text-white leading-[1.1] tracking-tighter drop-shadow-sm dark:drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] overflow-visible inline-block will-change-transform">
                            {t("hero.title1")}
                        </span>
                        <span className="text-2xl xs:text-3xl sm:text-4xl md:text-[4.5rem] lg:text-[6.5rem] text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 dark:from-pink-300 dark:via-white dark:to-pink-300 font-black font-kantumruy leading-[1.1] tracking-tight drop-shadow-sm dark:drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] overflow-visible inline-block will-change-transform pb-2">
                             {t("hero.title2")}
                        </span>
                    </m.h1>
                </div>

                <m.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-slate-600 dark:text-white/70 text-base sm:text-lg md:text-2xl font-kantumruy max-w-2xl mx-auto mb-16 leading-relaxed font-medium px-4 md:px-0"
                >
                    {t("hero.description")}
                </m.p>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 w-full px-6 md:px-0"
                >
                    <Link href={AUTH_URLS.SIGN_UP} className="group relative flex h-16 md:h-20 px-12 md:px-20 items-center justify-center overflow-hidden rounded-full bg-slate-950 dark:bg-white text-white dark:text-black transition-all duration-500 hover:scale-105 shadow-2xl shadow-pink-500/10 dark:shadow-white/10 hover:shadow-pink-500/20 active:scale-95">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-500 dark:from-pink-100 dark:via-white dark:to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x" />
                        <span className="font-kantumruy text-base sm:text-lg md:text-2xl font-black relative z-10 pt-1 flex items-center justify-center gap-3">
                            {t("hero.ctaRegister")}
                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-3 duration-500 stroke-[3]" />
                        </span>
                    </Link>
                    <Link href="#templates" className="flex h-16 md:h-20 px-12 md:px-16 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 sm:backdrop-blur-xl text-slate-900 dark:text-white/80 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 font-kantumruy font-black text-base md:text-xl transition-all duration-500 shadow-sm active:scale-95">
                        <span className="pt-1 flex items-center justify-center">{t("hero.ctaTemplates")}</span>
                    </Link>
                </m.div>
            </div>

            {/* Scroll Indicator */}
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-slate-500 dark:text-white/50 text-[10px] uppercase font-kantumruy tracking-widest">{t("hero.scrollDown")}</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-slate-500 dark:from-white to-transparent" />
            </m.div>
        </section>
    );
}
