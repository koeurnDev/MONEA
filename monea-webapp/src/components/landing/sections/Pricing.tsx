import { useState, useEffect } from "react";
import { m } from 'framer-motion';
import { Check, Sparkles } from "lucide-react";
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
        <section id="pricing" className="py-24 md:py-32 bg-[#FDFDFD] dark:bg-[#050505] border-t border-slate-200/50 dark:border-white/5 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
            <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-50/40 dark:bg-emerald-900/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-50/40 dark:bg-blue-900/10 blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 max-w-6xl">
                <div className="text-center mb-24 flex flex-col items-center">
                    <m.div
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 mb-6"
                    >
                        <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <span className="text-slate-700 dark:text-white/90 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] font-kantumruy">
                                {t("pricing.badge")}
                            </span>
                        </div>
                    </m.div>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black font-kantumruy text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.2]"
                    >
                        {t("pricing.title")}
                    </m.h2>
                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-slate-600 dark:text-white/60 text-lg md:text-xl font-kantumruy font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        {t("pricing.subtitle")}
                    </m.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: t("pricing.freeName"), price: "0$", desc: t("pricing.freeDesc"), features: [t("pricing.freeF1"), t("pricing.freeF2"), t("pricing.freeF3")] },
                        { name: t("pricing.proName"), price: `${pricing.standard}$`, desc: t("pricing.proDesc"), features: [t("pricing.proF1"), t("pricing.proF2"), t("pricing.proF3")], highlight: true },
                        { name: t("pricing.bizName"), price: "16$", desc: t("pricing.bizDesc"), features: [t("pricing.bizF1"), t("pricing.bizF2"), t("pricing.bizF3"), t("pricing.bizF4")] }
                    ].map((plan, i) => (
                        <m.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.1 * (i + 1) }}
                            key={i} 
                            className={cn(
                                "relative p-8 md:p-10 rounded-[2.5rem] flex flex-col items-start justify-between min-h-0 md:min-h-[600px] transition-all duration-700 group hover:-translate-y-3",
                                plan.highlight 
                                    ? "bg-white dark:bg-white/[0.08] border border-rose-200 dark:border-rose-500/30 shadow-xl shadow-rose-900/5 dark:shadow-rose-900/20 backdrop-blur-xl" 
                                    : "bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-sm backdrop-blur-xl hover:shadow-2xl hover:bg-white dark:hover:bg-white/10"
                            )}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] uppercase tracking-widest font-bold px-6 py-2 rounded-full shadow-lg shadow-pink-500/20 z-20 border border-white/20 whitespace-nowrap">
                                    {t("pricing.proHighlight")}
                                </div>
                            )}
                            
                            {/* Glow for highlighted plan */}
                            {plan.highlight && (
                                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                            )}
                            
                            <div className="w-full relative z-10">
                                <h3 className={cn("text-xl md:text-2xl font-bold font-kantumruy mb-6 tracking-tight text-slate-800 dark:text-white/90")}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1.5 mb-8">
                                    <span className={cn(
                                        "text-6xl font-bold font-mono tracking-tighter transition-transform group-hover:scale-105 duration-500",
                                        plan.highlight ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 dark:from-pink-400 dark:to-rose-400" : "text-slate-900 dark:text-white"
                                    )}>{plan.price}</span>
                                    <span className="text-slate-400 dark:text-white/40 text-xs font-bold uppercase tracking-wider">/{t("pricing.priceSuffix")}</span>
                                </div>
                                <p className="text-sm md:text-base font-kantumruy text-slate-500 dark:text-white/60 mb-10 border-b border-slate-100 dark:border-white/10 pb-8 leading-relaxed font-light">{plan.desc}</p>
                                <ul className="space-y-6 font-kantumruy text-sm md:text-base">
                                    {plan.features.map((f, fi) => (
                                        <li key={fi} className="flex items-start gap-4 transition-transform group-hover:translate-x-1 duration-300">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0 mt-0.5",
                                                plan.highlight 
                                                    ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" 
                                                    : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60"
                                            )}>
                                                <Check size={14} className="stroke-[2.5]" />
                                            </div>
                                            <span className="text-slate-600 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors font-medium leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {plan.highlight ? (
                                <div className="w-full relative mt-10 md:mt-12 z-10 group/btn">
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-500 rounded-2xl opacity-100 transition-opacity duration-500 animate-gradient-x shadow-lg shadow-pink-500/30" />
                                    <Button className="w-full py-6 md:py-8 text-base md:text-lg font-bold font-kantumruy bg-transparent hover:bg-transparent text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-95 relative z-10 border border-white/20">
                                        {t("pricing.cta")}
                                    </Button>
                                </div>
                            ) : (
                                <Button className="w-full relative z-10 py-6 md:py-8 mt-10 md:mt-12 text-base md:text-lg font-bold font-kantumruy transition-all rounded-2xl shadow-sm hover:scale-[1.02] active:scale-95 bg-slate-900/5 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10">
                                    {t("pricing.cta")}
                                </Button>
                            )}
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
