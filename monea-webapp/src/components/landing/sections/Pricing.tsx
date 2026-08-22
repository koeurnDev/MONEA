"use client";

import { useState, useEffect } from "react";
import { m } from 'framer-motion';
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

export function Pricing() {
    const { t } = useTranslation();
    const [pricing, setPricing] = useState({ standard: 9, pro: 19 });

    useEffect(() => {
        fetch("/api/pricing")
            .then(res => res.json())
            .then(data => setPricing(data))
            .catch(err => console.error("Pricing fetch error:", err));
    }, []);

    return (
        <section id="pricing" className="py-32 bg-[#FDFBF7] dark:bg-[#0A0A0A] border-t border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center justify-center py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-white/80 font-bold text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
                    >
                        {t("pricing.badge")}
                    </m.span>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        {t("pricing.title")}
                    </m.h2>
                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-slate-500 dark:text-gray-400 font-kantumruy font-light text-lg md:text-xl"
                    >
                        {t("pricing.subtitle")}
                    </m.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        { name: t("pricing.freeName"), price: "0$", desc: t("pricing.freeDesc"), features: [t("pricing.freeF1"), t("pricing.freeF2"), t("pricing.freeF3")] },
                        { name: t("pricing.proName"), price: `${pricing.standard}$`, desc: t("pricing.proDesc"), features: [t("pricing.proF1"), t("pricing.proF2"), t("pricing.proF3"), t("pricing.proF4"), t("pricing.proF5")], highlight: true },
                        { name: t("pricing.bizName"), price: `${pricing.pro}$`, desc: t("pricing.bizDesc"), features: [t("pricing.bizF1"), t("pricing.bizF2"), t("pricing.bizF3")] }
                    ].map((plan, i) => (
                        <div key={i} className={cn("relative p-8 md:p-10 rounded-[2.5rem] border flex flex-col items-start justify-between min-h-0 md:min-h-[580px] transition-all duration-500 group hover:-translate-y-2", plan.highlight ? "bg-white dark:bg-white/10 border-slate-300 dark:border-white/30 shadow-md" : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm")}>
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] uppercase tracking-widest font-bold px-6 py-2 rounded-full shadow-sm z-20 border border-slate-800 dark:border-white/20">
                                    {t("pricing.proHighlight")}
                                </div>
                            )}
                            <div className="w-full">
                                <h3 className={cn("text-xl md:text-2xl font-bold font-kantumruy mb-6 tracking-tight text-slate-800 dark:text-white/90")}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1.5 mb-8">
                                    <span className={cn("text-6xl font-bold font-mono tracking-tighter transition-transform group-hover:scale-105 duration-500 text-slate-900 dark:text-white")}>{plan.price}</span>
                                    <span className="text-slate-400 dark:text-white/30 text-xs font-bold uppercase tracking-wider">/{t("pricing.priceSuffix")}</span>
                                </div>
                                <p className="text-sm md:text-base font-kantumruy text-slate-500 dark:text-white/50 mb-10 border-b border-slate-100 dark:border-white/10 pb-8 leading-relaxed font-light">{plan.desc}</p>
                                <ul className="space-y-6 font-kantumruy text-sm md:text-base">
                                    {plan.features.map((f, fi) => (
                                        <li key={fi} className="flex items-center gap-4 transition-transform hover:translate-x-1 duration-300">
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60")}>
                                                <Check size={14} className="stroke-[2.5]" />
                                            </div>
                                            <span className="text-slate-600 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white transition-colors font-medium">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button className={cn("w-full py-6 md:py-8 mt-10 md:mt-12 text-base md:text-lg font-bold font-kantumruy transition-all rounded-2xl shadow-sm hover:scale-[1.02] active:scale-95", plan.highlight ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-200" : "bg-white dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10")}>
                                {t("pricing.cta")}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
