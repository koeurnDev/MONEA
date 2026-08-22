"use client";

import { m } from 'framer-motion';
import { Star, Check, Heart, MapPin } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
    return (
        <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: delay * 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="group relative p-8 md:p-10 rounded-[2.5rem] bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 overflow-hidden hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-500 shadow-sm hover:shadow-2xl dark:shadow-none backdrop-blur-md hover:-translate-y-2"
        >
            <div className="absolute inset-0 bg-slate-50/50 dark:bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative z-10 w-16 h-16 mb-10 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/10 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all duration-500 shadow-sm">
                <Icon size={28} className="transition-transform duration-500 stroke-[2.5]" />
            </div>
            <div className="relative z-10 space-y-6">
                <h3 className="text-xl md:text-2xl font-bold font-kantumruy text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors tracking-tight">
                    {title}
                </h3>
                <p className="text-slate-500 dark:text-white/50 text-base md:text-lg font-kantumruy leading-relaxed font-light group-hover:text-slate-700 dark:group-hover:text-white/80 transition-colors">
                    {desc}
                </p>
            </div>
        </m.div>
    );
}

export function Features() {
    const { t } = useTranslation();
    const features = [
        {
            icon: Star,
            title: t("features.card1Title"),
            desc: t("features.card1Desc"),
        },
        {
            icon: Check,
            title: t("features.card2Title"),
            desc: t("features.card2Desc"),
        },
        {
            icon: Heart,
            title: t("features.card3Title"),
            desc: t("features.card3Desc"),
        },
        {
            icon: MapPin,
            title: t("features.card4Title"),
            desc: t("features.card4Desc"),
        },
    ];

    return (
        <section id="features" className="py-32 bg-white dark:bg-[#0A0A0A] relative border-b border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/80 font-bold text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
                    >
                        <Star className="w-3 h-3" />
                        {t("features.badge")}
                    </m.span>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        {t("features.title")}
                    </m.h2>
                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-slate-600 dark:text-white/60 text-lg md:text-xl font-kantumruy font-light leading-[1.8]"
                    >
                        {t("features.subtitle")}
                    </m.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {features.map((feature, idx) => (
                        <FeatureCard
                            key={idx}
                            icon={feature.icon}
                            title={feature.title}
                            desc={feature.desc}
                            delay={0.1 * (idx + 1)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
