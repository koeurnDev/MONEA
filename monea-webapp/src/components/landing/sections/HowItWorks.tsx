"use client";

import { m } from 'framer-motion';
import { UserPlus, Palette, Users, Send } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

export function HowItWorks() {
    const { t } = useTranslation();
    const steps = [
        { icon: UserPlus, title: t("features.step1Title"), desc: t("features.step1Desc") },
        { icon: Palette, title: t("features.step2Title"), desc: t("features.step2Desc") },
        { icon: Users, title: t("features.step3Title"), desc: t("features.step3Desc") },
        { icon: Send, title: t("features.step4Title"), desc: t("features.step4Desc") },
    ];

    return (
        <section id="how-it-works" className="py-32 bg-[#FDFBF7] dark:bg-[#0A0A0A] relative border-y border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-white/80 font-bold text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
                    >
                        {t("features.howBadge")}
                    </m.span>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-2xl xs:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        {t("features.howTitle")}
                    </m.h2>
                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-slate-600 dark:text-white/60 text-lg md:text-xl font-kantumruy font-light leading-[1.8]"
                    >
                        {t("features.howSubtitle")}
                    </m.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-slate-200 dark:via-white/20 to-transparent" />
                    {steps.map((step, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 * (idx + 1) }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            <div className="absolute top-6 left-8 text-4xl font-bold font-mono text-slate-900/[0.03] dark:text-white/[0.05] group-hover:text-slate-900/[0.08] dark:group-hover:text-white/[0.1] transition-colors pointer-events-none italic">
                                0{idx + 1}
                            </div>
                            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 group-hover:-translate-y-2 transition-all duration-300 shadow-sm sm:backdrop-blur-sm will-change-transform">
                                <step.icon className="w-10 h-10 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold font-kantumruy text-slate-900 dark:text-white mb-3 transition-colors">
                                {step.title}
                            </h3>
                            <p className="text-slate-500 dark:text-white/50 font-kantumruy font-light leading-relaxed text-sm md:text-base px-2">
                                {step.desc}
                            </p>
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
