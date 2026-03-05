"use client";

import Link from "next/link";
import Image from "next/image";
import { m, useScroll, useTransform } from 'framer-motion';
import { Star, ArrowRight } from "lucide-react";

export function Hero() {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 200]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0.2]);

    return (
        <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-black pb-20 pt-32">
            {/* Background Parallax */}
            <m.div style={{ y, opacity }} className="absolute inset-0 z-0">
                <Image
                    src="/images/bg_tunnel.jpg"
                    alt="Wedding Tunnel"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-20 dark:opacity-40 scale-[1.15] will-change-transform"
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
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 mb-10 group cursor-default">
                        <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-slate-800 dark:text-white/80 text-[11px] md:text-sm font-kantumruy font-medium tracking-widest uppercase mt-0.5">
                            MONEA Digital : ជំនាន់ថ្មីនៃសិរីមង្គល
                        </span>
                    </div>
                </m.div>

                <m.h1
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-row flex-wrap items-center justify-center gap-x-2 md:gap-x-4 mb-8 drop-shadow-2xl overflow-visible px-4"
                >
                    <span className="text-4xl md:text-[5rem] lg:text-[7rem] font-bold font-kantumruy text-slate-900 dark:text-white leading-normal tracking-tight drop-shadow-sm dark:drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] overflow-visible">
                        សិរីមង្គល
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 dark:from-pink-200 dark:via-white dark:to-pink-200 font-bold font-kantumruy text-3xl md:text-[4rem] lg:text-[6rem] leading-normal tracking-normal drop-shadow-sm dark:drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] overflow-visible">
                        ក្នុងដៃរបស់អ្នក
                    </span>
                </m.h1>

                <m.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-slate-700 dark:text-white/90 text-lg md:text-xl font-kantumruy max-w-2xl mx-auto mb-14 mt-4 leading-[1.8] font-medium px-4 md:px-0 drop-shadow-sm"
                >
                    បង្កើតធៀបអញ្ជើញឌីជីថលដ៏ប្រណីត គ្រប់គ្រងបញ្ជីឈ្មោះភ្ញៀវ និងទទួលពរជ័យ ព្រមទាំងចំណងដៃ ក្នុងវេទិកាតែមួយប្រកបដោយសុវត្ថិភាព។
                </m.p>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full px-6 md:px-0"
                >
                    <Link href="/register" className="group relative flex h-16 w-full sm:w-[280px] items-center justify-center overflow-hidden rounded-full bg-slate-900 dark:bg-white text-white dark:text-black transition-all duration-300 hover:scale-105 shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-2xl dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 to-rose-500 dark:from-pink-100 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="font-kantumruy text-lg font-bold relative z-10 pt-1">ចាប់ផ្តើមបង្កើតឥឡូវនេះ</span>
                        <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                    </Link>
                    <Link href="#templates" className="flex h-16 w-full sm:w-[200px] items-center justify-center rounded-full border border-slate-200 dark:border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-md text-slate-800 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-kantumruy text-lg transition-all duration-300 shadow-sm">
                        <span className="pt-1">មើលពុម្ពគំរូ</span>
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
                <span className="text-slate-500 dark:text-white/50 text-[10px] uppercase font-kantumruy tracking-widest">អូសចុះក្រោម</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-slate-500 dark:from-white to-transparent" />
            </m.div>
        </section>
    );
}
