"use client";

import Link from "next/link";
import { m } from 'framer-motion';
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

export function FinalCTA() {
    const { t } = useTranslation();
    return (
        <section className="py-32 relative overflow-hidden bg-slate-950 dark:bg-[#0A0A0A]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center flex flex-col items-center">
                <m.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold font-kantumruy text-white mb-8 tracking-tight"
                >
                    {t("cta.title1")}<br className="max-md:hidden" /> {t("cta.title2")}
                </m.h2>
                <m.p
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                    className="text-white/70 text-lg md:text-xl font-kantumruy font-light leading-relaxed max-w-2xl mb-12"
                >
                    {t("cta.description")}
                </m.p>
                <m.div
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                    className="w-full flex justify-center"
                >
                    <Link href="/sign-up" className="group relative flex h-14 md:h-16 px-12 md:px-16 items-center justify-center rounded-full bg-white text-slate-900 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                        <span className="font-kantumruy text-sm sm:text-base font-bold relative z-10 flex items-center justify-center gap-3">
                            {t("cta.button")}
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Link>
                </m.div>
            </div>
        </section>
    );
}
