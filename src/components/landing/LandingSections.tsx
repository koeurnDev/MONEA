"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { m, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Check, Star, Heart, MapPin, UserPlus, Palette, Users, Send, Plus, Minus, Quote, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

// --- Minimalist Bento Box Features ---
function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
    return (
        <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: delay * 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="group relative p-8 md:p-10 rounded-[2.5rem] bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 overflow-hidden hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-500 shadow-sm hover:shadow-2xl dark:shadow-none backdrop-blur-xl hover:-translate-y-2 will-change-transform"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative z-10 w-16 h-16 mb-10 rounded-[1.5rem] bg-slate-50 dark:bg-white/10 flex items-center justify-center border border-slate-200/50 dark:border-white/10 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-pink-500/30">
                <Icon size={28} className="transition-transform duration-500 stroke-[2.5]" />
            </div>
            <div className="relative z-10 space-y-6">
                <h3 className="text-xl md:text-2xl font-black font-kantumruy text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors tracking-tight">
                    {title}
                </h3>
                <p className="text-slate-500 dark:text-white/40 text-base md:text-lg font-kantumruy leading-relaxed font-medium group-hover:text-slate-800 dark:group-hover:text-white/80 transition-colors">
                    {desc}
                </p>
            </div>
            <div className="absolute -bottom-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-out origin-center" />
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
        <section id="features" className="py-32 bg-white dark:bg-black relative border-b border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-900/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-pink-600 dark:text-pink-300 font-mono text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
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
    )
}

// --- How It Works Section ---
export function HowItWorks() {
    const { t } = useTranslation();
    const steps = [
        { icon: UserPlus, title: t("features.step1Title"), desc: t("features.step1Desc") },
        { icon: Palette, title: t("features.step2Title"), desc: t("features.step2Desc") },
        { icon: Users, title: t("features.step3Title"), desc: t("features.step3Desc") },
        { icon: Send, title: t("features.step4Title"), desc: t("features.step4Desc") },
    ];

    return (
        <section id="how-it-works" className="py-32 bg-slate-50 dark:bg-black relative border-y border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-pink-600 dark:text-pink-300 font-mono text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
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
                            <div className="absolute top-6 left-8 text-4xl font-bold font-mono text-slate-900/[0.05] dark:text-white/[0.08] group-hover:text-pink-500/20 transition-colors pointer-events-none italic">
                                0{idx + 1}
                            </div>
                            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:bg-pink-50 dark:group-hover:bg-white/10 group-hover:-translate-y-2 transition-all duration-300 shadow-sm dark:shadow-xl sm:backdrop-blur-sm will-change-transform">
                                <step.icon className="w-10 h-10 text-pink-600 dark:text-pink-300 group-hover:text-pink-500 dark:group-hover:text-pink-200 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold font-kantumruy text-slate-900 dark:text-white mb-3 group-hover:text-pink-600 dark:group-hover:text-pink-100 transition-colors">
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

function CountUp({ value }: { value: string }) {
    // Robust parsing: Handle Khmer numerals and strip suffixes
    const englishValue = value.replace(/[០-៩]/g, (d) =>
        (d.charCodeAt(0) - 6112).toString()
    );
    const numericPart = parseFloat(englishValue.replace(/[^0-9.]/g, '')) || 0;
    const suffix = value.replace(/[0-9.]/g, '');

    const spring = useSpring(0, { mass: 1, stiffness: 100, damping: 30 });
    const display = useTransform(spring, (latest) => {
        if (isNaN(latest)) return "0";
        return numericPart > 1000 ? (latest / 1000).toFixed(1) : Math.floor(latest);
    });

    const [current, setCurrent] = useState<string | number>("0");

    useEffect(() => {
        if (!isNaN(numericPart)) {
            spring.set(numericPart);
        }
    }, [numericPart, spring]);

    useEffect(() => {
        return display.on("change", (v) => {
            if (v !== undefined && v !== null && !isNaN(Number(v))) {
                setCurrent(v);
            }
        });
    }, [display]);

    return (
        <span translate="no" className="notranslate">
            {current}
            {suffix}
        </span>
    );
}

// --- Statistics Section ---
export function Statistics() {
    const [realStats, setRealStats] = useState({
        couples: "0",
        templates: "12",
        guests: "0",
        events: "0"
    });

    useEffect(() => {
        const fetchStats = () => {
            fetch('/api/public-stats')
                .then(async res => {
                    if (!res.ok) throw new Error("Stats error");
                    return await res.json();
                })
                .then(data => {
                    if (data && !data.error) {
                        setRealStats({
                            couples: data.couples > 999 ? `${(data.couples / 1000).toFixed(1)}K+` : `${data.couples}+`,
                            templates: data.templates > 99 ? `${data.templates}+` : `${data.templates}+`,
                            guests: data.guests > 999999 ? `${(data.guests / 1000000).toFixed(1)}M+` :
                                data.guests > 999 ? `${(data.guests / 1000).toFixed(1)}K+` : `${data.guests}+`,
                            events: data.events > 999 ? `${(data.events / 1000).toFixed(1)}K+` : `${data.events}+`
                        });
                    }
                })
                .catch(err => console.error("Failed to fetch stats:", err));
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const { t } = useTranslation();
    const stats = [
        { label: t("stats.couples"), value: realStats.couples },
        { label: t("stats.templates"), value: realStats.templates },
        { label: t("stats.guests"), value: realStats.guests },
        { label: t("stats.events"), value: realStats.events },
    ];

    return (
        <section className="py-24 bg-white dark:bg-black relative border-t border-slate-100 dark:border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-pink-500/5" />
            
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 * idx }}
                            className="group relative flex flex-col items-center justify-center p-10 py-12 rounded-[2.5rem] bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl transition-all duration-500 hover:bg-white dark:hover:bg-white/[0.08] hover:-translate-y-2 shadow-sm hover:shadow-2xl dark:shadow-none overflow-hidden"
                        >
                            <div className="absolute -inset-x-20 -inset-y-10 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                            
                            <h3 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-black font-mono text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 dark:from-white dark:via-white/90 dark:to-white mb-4 transition-transform group-hover:scale-110 duration-700 inline-block will-change-transform">
                                <CountUp value={stat.value} />
                            </h3>
                            
                            <div className="text-slate-500 dark:text-white/40 font-black font-kantumruy text-[11px] md:text-sm uppercase tracking-[0.2em] leading-tight text-center min-h-[40px] flex flex-col justify-start">
                                {stat.label.includes("(") ? (
                                    <>
                                        <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{stat.label.split("(")[0]}</span>
                                        <span className="text-[10px] text-pink-500/70 mt-1.5 font-bold uppercase tracking-wider italic">({stat.label.split("(")[1]}</span>
                                    </>
                                ) : (
                                    <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{stat.label}</span>
                                )}
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

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
        <section id="pricing" className="py-32 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center justify-center py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-pink-600 dark:text-pink-300 font-mono text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
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
                        <div key={i} className={cn("relative p-8 md:p-10 rounded-[2.5rem] border flex flex-col items-start justify-between min-h-0 md:min-h-[580px] transition-all duration-500 group hover:-translate-y-3", plan.highlight ? "bg-white dark:bg-white/10 border-pink-500/30 shadow-[0_20px_50px_rgba(236,72,153,0.1)] dark:shadow-[0_0_60px_rgba(236,72,153,0.15)]" : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-pink-200 dark:hover:border-white/30 shadow-sm backdrop-blur-sm")}>
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[10px] uppercase tracking-widest font-black px-6 py-2 rounded-full shadow-lg z-20 border border-white/20">
                                    {t("pricing.proHighlight")}
                                </div>
                            )}
                            <div className="w-full">
                                <h3 className={cn("text-xl md:text-2xl font-black font-kantumruy mb-6 tracking-tight", plan.highlight ? "text-pink-600 dark:text-white" : "text-slate-800 dark:text-white/80")}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1.5 mb-8">
                                    <span className={cn("text-6xl font-black font-mono tracking-tighter transition-transform group-hover:scale-110 duration-500", plan.highlight ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-white/60")}>{plan.price}</span>
                                    <span className="text-slate-400 dark:text-white/30 text-xs font-bold uppercase tracking-wider">/{t("pricing.priceSuffix")}</span>
                                </div>
                                <p className="text-sm md:text-base font-kantumruy text-slate-500 dark:text-white/40 mb-10 border-b border-slate-100 dark:border-white/10 pb-8 leading-relaxed">{plan.desc}</p>
                                <ul className="space-y-6 font-kantumruy text-sm md:text-base">
                                    {plan.features.map((f, fi) => (
                                        <li key={fi} className="flex items-center gap-4 transition-transform hover:translate-x-1 duration-300">
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm", plan.highlight ? "bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400" : "bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/30")}>
                                                <Check size={14} className="stroke-[3]" />
                                            </div>
                                            <span className="text-slate-600 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white transition-colors font-medium">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button className={cn("w-full py-6 md:py-8 mt-10 md:mt-12 text-base md:text-lg font-black font-kantumruy transition-all rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95", plan.highlight ? "bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-slate-200 shadow-slate-200 dark:shadow-none" : "bg-white dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 shadow-slate-100 dark:shadow-none")}>
                                {t("pricing.cta")}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function Testimonials() {
    const { t } = useTranslation();
    const reviews = [
        {
            name: t("testimonials.t1Name"),
            role: t("testimonials.t1Role"),
            text: t("testimonials.t1Text"),
        },
        {
            name: t("testimonials.t2Name"),
            role: t("testimonials.t2Role"),
            text: t("testimonials.t2Text"),
        },
        {
            name: t("testimonials.t3Name"),
            role: t("testimonials.t3Role"),
            text: t("testimonials.t3Text"),
        }
    ];

    return (
        <section className="py-32 bg-white dark:bg-black relative border-t border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-white/10 bg-white/5 text-pink-300 font-mono text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
                    >
                        {t("testimonials.badge")}
                    </m.span>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        {t("testimonials.title")}
                    </m.h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 * idx }}
                            className="group bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 sm:p-10 rounded-[2.5rem] relative hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-500 shadow-sm hover:shadow-2xl dark:shadow-none backdrop-blur-sm"
                        >
                            <Quote className="w-12 h-12 text-slate-200/50 dark:text-white/5 absolute top-8 right-8 transition-transform group-hover:rotate-12 duration-500" />
                            <div className="flex gap-1.5 mb-8">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400 transition-transform group-hover:scale-110" style={{ transitionDelay: `${i * 50}ms` }} />
                                ))}
                            </div>
                            <p className="text-slate-600 dark:text-white/70 font-kantumruy font-light leading-relaxed mb-10 text-base md:text-lg italic">
                                &quot;{review.text}&quot;
                            </p>
                            <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-white/5 pt-8">
                                <h4 className="text-slate-900 dark:text-white font-black font-kantumruy text-lg tracking-tight">{review.name}</h4>
                                <span className="text-pink-600 dark:text-pink-300 font-bold font-kantumruy text-xs uppercase tracking-wider opacity-80">{review.role}</span>
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FAQ() {
    const { t } = useTranslation();
    const faqs = [
        {
            q: t("faq.q1"),
            a: t("faq.a1")
        },
        {
            q: t("faq.q2"),
            a: t("faq.a2")
        },
        {
            q: t("faq.q3"),
            a: t("faq.a3")
        },
        {
            q: t("faq.q4"),
            a: t("faq.a4")
        }
    ];

    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
        <section className="py-32 bg-slate-50 dark:bg-black relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <div className="text-center mb-16 flex flex-col items-center">
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        {t("faq.title")}
                    </m.h2>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className={cn("border rounded-[2rem] transition-all duration-500 overflow-hidden", openIdx === idx ? "border-pink-500/30 bg-white dark:bg-white/5 shadow-2xl dark:shadow-none" : "border-slate-200 dark:border-white/10 hover:border-pink-200 dark:hover:border-white/20 bg-white/50 dark:bg-black/40 hover:bg-white dark:hover:bg-white/[0.03]")}
                        >
                            <button
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full px-8 py-7 text-left flex items-center justify-between gap-6 focus:outline-none group/faq"
                            >
                                <span className={cn("font-black font-kantumruy text-lg sm:text-xl transition-colors duration-300 tracking-tight", openIdx === idx ? "text-pink-600 dark:text-white" : "text-slate-800 dark:text-white/80 group-hover/faq:text-slate-950")}>{faq.q}</span>
                                <span className={cn("shrink-0 w-10 h-10 rounded-2xl border flex items-center justify-center transition-all duration-500", openIdx === idx ? "bg-pink-500 text-white border-pink-500 rotate-180" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 group-hover/faq:scale-110")}>
                                    {openIdx === idx ? <Minus size={18} /> : <Plus size={18} />}
                                </span>
                            </button>
                            <AnimatePresence>
                                {openIdx === idx && (
                                    <m.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <div className="px-8 pb-8 text-slate-500 dark:text-white/50 font-kantumruy text-base sm:text-lg leading-relaxed font-light border-t border-slate-100/50 dark:border-white/5 pt-6">
                                            {faq.a}
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FinalCTA() {
    const { t } = useTranslation();
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900 via-black to-blue-900" />
            <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none">
                <Image 
                    src="/images/bg_tunnel.jpg" 
                    alt="Background" 
                    fill 
                    className="object-cover"
                    sizes="100vw"
                />
            </div>
            <div className="absolute inset-0 bg-black/60 sm:backdrop-blur-[2px]" />
            <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center flex flex-col items-center">
                <m.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold font-kantumruy text-white mb-8 tracking-tight drop-shadow-2xl"
                >
                    {t("cta.title1")}<br className="max-md:hidden" /> {t("cta.title2")}
                </m.h2>
                <m.p
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                    className="text-white/80 text-lg md:text-xl font-kantumruy font-light leading-relaxed max-w-2xl mb-12"
                >
                    {t("cta.description")}
                </m.p>
                <m.div
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                    className="w-full flex justify-center"
                >
                    <Link href="/sign-up" className="group relative flex h-16 md:h-20 px-16 md:px-24 items-center justify-center overflow-hidden rounded-full bg-white text-black transition-all duration-500 hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] active:scale-95">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-100 via-white to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x" />
                        <span className="font-kantumruy text-base sm:text-lg md:text-2xl font-black relative z-10 pt-1 flex items-center justify-center gap-3">
                            {t("cta.button")}
                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-2 duration-500 stroke-[3]" />
                        </span>
                    </Link>
                </m.div>
            </div>
        </section>
    );
}
