"use client";

import { useState, useEffect } from "react";
import { m, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from "@/i18n/LanguageProvider";

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
        const interval = setInterval(fetchStats, 60000);
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
        <section className="py-24 bg-white dark:bg-[#0A0A0A] relative border-t border-slate-100 dark:border-white/10 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 * idx }}
                            className="group relative flex flex-col items-center justify-center p-10 py-12 rounded-[2.5rem] bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md transition-all duration-500 hover:bg-white dark:hover:bg-white/[0.08] hover:-translate-y-2 shadow-sm overflow-hidden"
                        >
                            <h3 className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-black font-mono text-slate-900 dark:text-white transition-transform group-hover:scale-105 duration-700 inline-block">
                                <CountUp value={stat.value} />
                            </h3>
                            
                            <div className="text-slate-500 dark:text-white/40 font-bold font-kantumruy text-[11px] md:text-sm uppercase tracking-[0.2em] leading-tight text-center min-h-[40px] flex flex-col justify-start">
                                {stat.label.includes("(") ? (
                                    <>
                                        <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{stat.label.split("(")[0]}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-white/30 mt-1.5 uppercase tracking-wider italic">({stat.label.split("(")[1]}</span>
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
