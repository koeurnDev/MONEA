"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { m, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Check, Star, Heart, MapPin, UserPlus, Palette, Users, Send, Plus, Minus, Quote } from "lucide-react";

// --- Minimalist Bento Box Features ---
function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: delay * 0.8 }}
            className="group relative p-6 md:p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 w-14 h-14 mb-8 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:scale-110 group-hover:bg-pink-50 dark:group-hover:bg-white/10 transition-all duration-300 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                <Icon className="w-6 h-6 text-pink-600 dark:text-pink-300 group-hover:text-pink-500 dark:group-hover:text-pink-200 transition-colors" />
            </div>
            <div className="relative z-10 space-y-4">
                <h3 className="text-xl md:text-2xl font-bold font-kantumruy text-slate-900 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-100 transition-colors tracking-wide">
                    {title}
                </h3>
                <p className="text-slate-600 dark:text-white/60 text-base md:text-lg font-kantumruy leading-relaxed font-light group-hover:text-slate-900 dark:group-hover:text-white/80 transition-colors">
                    {desc}
                </p>
            </div>
            <div className="absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />
        </m.div>
    );
}

export function Features() {
    const features = [
        {
            icon: Star,
            title: "ការរចនាប្រណីតភាព",
            desc: "ពុម្ពគំរូដ៏ស្រស់ស្អាត ទាន់សម័យ និងអាចបត់បែនតាមចំណូលចិត្តរបស់អ្នក ដែលបង្កើតនូវចំណាប់អារម្មណ៍ដ៏អស្ចារ្យសម្រាប់ភ្ញៀវពន្លឺ។",
        },
        {
            icon: Check,
            title: "គ្រប់គ្រងភ្ញៀវ (RSVP)",
            desc: "តាមដានចំនួនអ្នកចូលរួម រៀបចំតុ និងគ្រប់គ្រងការឆ្លើយតបយ៉ាងងាយស្រួលនៅលើប្រព័ន្ធតែមួយ ដោយមិនមានការស្មុគស្មាញ។",
        },
        {
            icon: Heart,
            title: "ចំណងដៃឌីជីថល (QR កាដូ)",
            desc: "ភ្ជាប់ជាមួយគណនីធនាគាររបស់អ្នកផ្ទាល់ អនុញ្ញាតឲ្យភ្ញៀវអាចផ្ញើចំណងដៃ និងការជូនពរតាមរយៈការស្កេន QR កូដយ៉ាងរហ័ស និងសុវត្ថិភាព។",
        },
        {
            icon: MapPin,
            title: "ផែនទី និងទីតាំង",
            desc: "ភ្ជាប់ទីតាំង Google Maps ច្បាស់លាស់ទៅកាន់ធៀបឌីជីថល ជួយឲ្យភ្ញៀវងាយស្រួលធ្វើដំណើរមកកាន់កម្មវិធីបានយ៉ាងរលូន។",
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
                        លក្ខណៈពិសេស
                    </m.span>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        អ្វីដែល MONEA ផ្តល់ជូន
                    </m.h2>
                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-slate-600 dark:text-white/60 text-lg md:text-xl font-kantumruy font-light leading-[1.8]"
                    >
                        ប្រព័ន្ធឌីជីថលដ៏ពេញលេញ ដែលជួយសម្រួលដល់ការរៀបចំកម្មវិធីមង្គលការរបស់អ្នកឲ្យកាន់តែមានភាពងាយស្រួល និងទំនើប។
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
    const steps = [
        { icon: UserPlus, title: "បង្កើតគណនី", desc: "ចុះឈ្មោះដោយឥតគិតថ្លៃ និងបង្កើតកម្មវិធីមង្គលការរបស់អ្នកត្រឹមតែប៉ុន្មាននាទី។" },
        { icon: Palette, title: "ជ្រើសរើសពុម្ពគំរូ", desc: "ស្វែងរកពុម្ពគំរូដែលអ្នកស្រលាញ់ ហើយរចនាបន្ថែមតាមចំណូលចិត្ត។" },
        { icon: Users, title: "បញ្ចូលព័ត៌មាន", desc: "បន្ថែមទិន្នន័យភ្ញៀវ កាលវិភាគកម្មវិធី និងទីតាំង Google Maps ។" },
        { icon: Send, title: "ចែករំលែក", desc: "ផ្ញើធៀបទៅកាន់ភ្ញៀវតាមរយៈតំណរភ្ជាប់ (Link) ហើយរង់ចាំការឆ្លើយតប។" },
    ];

    return (
        <section id="how-it-works" className="py-32 bg-slate-50 dark:bg-black relative border-y border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-pink-600 dark:text-pink-300 font-mono text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
                    >
                        ជំហានងាយៗ
                    </m.span>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-2xl xs:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        របៀបប្រើប្រាស់
                    </m.h2>
                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-slate-600 dark:text-white/60 text-lg md:text-xl font-kantumruy font-light leading-[1.8]"
                    >
                        ត្រឹមតែ ៤ ជំហានប៉ុណ្ណោះ អ្នកនឹងទទួលបានធៀបអញ្ជើញឌីជីថលដ៏ប្រណីតមួយ។
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
    const numericPart = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    const suffix = value.replace(/[0-9.]/g, '');
    const spring = useSpring(0, { mass: 1, stiffness: 100, damping: 30 });
    const display = useTransform(spring, (latest) =>
        numericPart > 1000 ? (latest / 1000).toFixed(1) : Math.floor(latest)
    );

    const [current, setCurrent] = useState<string | number>("0");

    useEffect(() => {
        spring.set(numericPart);
    }, [numericPart, spring]);

    useEffect(() => {
        return display.on("change", (v) => setCurrent(v));
    }, [display]);

    return (
        <span>
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

    const stats = [
        { label: "គូស្វាមីភរិយា", value: realStats.couples },
        { label: "ពុម្ពគំរូ", value: realStats.templates },
        { label: "ភ្ញៀវចូលរួម", value: realStats.guests },
        { label: "ការរៀបចំកម្មវិធី (Real-time)", value: realStats.events },
    ];

    return (
        <section className="py-20 bg-white dark:bg-black relative border-t border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/10 via-transparent to-pink-900/10" />
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 * idx }}
                            className="text-center"
                        >
                            <h3 className="text-2xl xs:text-3xl md:text-5xl lg:text-6xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-white/50 mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                <CountUp value={stat.value} />
                            </h3>
                            <div className="text-slate-500 dark:text-white/40 font-kantumruy font-medium text-[10px] md:text-sm uppercase tracking-widest leading-tight min-h-[40px] flex flex-col justify-start">
                                {stat.label.includes("(") ? (
                                    <>
                                        <span>{stat.label.split("(")[0]}</span>
                                        <span className="text-xs text-pink-500/60 mt-1 whitespace-nowrap">({stat.label.split("(")[1]}</span>
                                    </>
                                ) : (
                                    <span>{stat.label}</span>
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
    return (
        <section id="pricing" className="py-32 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center justify-center py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-pink-600 dark:text-pink-300 font-mono text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
                    >
                        ជម្រើសតម្លៃ
                    </m.span>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        គម្រោងតម្លៃ
                    </m.h2>
                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-slate-500 dark:text-gray-400 font-kantumruy font-light text-lg md:text-xl"
                    >
                        ជ្រើសរើសគម្រោងដែលសាកសមបំផុតសម្រាប់អ្នក
                    </m.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        { name: "ឥតគិតថ្លៃ", price: "0$", desc: "សម្រាប់ការសាកល្បង", features: ["១ ពុម្ពគំរូ", "ភ្ញៀវ ៥០ នាក់", "ទុកបាន ២ សប្តាហ៍"] },
                        { name: "បរិបូរណ៍", price: "19$", desc: "ពេញនិយមបំផុត", features: ["ពុម្ពគំរូទាំងអស់", "ភ្ញៀវមិនកំណត់", "ទុកបានរហូត", "QR កាដូ", "ផែនទី Google"], highlight: true },
                        { name: "អាជីវកម្ម", price: "49$", desc: "សម្រាប់អ្នករៀបចំកម្មវិធី", features: ["ស្លាកយីហោផ្ទាល់ខ្លួន", "ការប្រើប្រាស់ API", "ជំនួយ ២៤/៧ - VIP"] }
                    ].map((plan, i) => (
                        <div key={i} className={cn("relative p-6 md:p-8 rounded-3xl border flex flex-col items-start justify-between min-h-0 md:min-h-[500px] transition-all duration-300 group hover:-translate-y-2", plan.highlight ? "bg-white dark:bg-white/10 border-pink-500/50 shadow-xl dark:shadow-[0_0_40px_rgba(236,72,153,0.15)]" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-pink-200 dark:hover:border-white/30 shadow-sm")}>
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                    ការណែនាំ
                                </div>
                            )}
                            <div className="w-full">
                                <h3 className={cn("text-xl font-bold font-kantumruy mb-4", plan.highlight ? "text-pink-600 dark:text-white" : "text-slate-700 dark:text-white/70")}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-5xl font-bold font-mono text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                                    <span className="text-slate-400 dark:text-white/40 text-sm">/មួយកម្មវិធី</span>
                                </div>
                                <p className="text-sm font-kantumruy text-slate-500 dark:text-gray-400 mb-8 border-b border-slate-100 dark:border-white/10 pb-8">{plan.desc}</p>
                                <ul className="space-y-5 font-kantumruy text-sm">
                                    {plan.features.map((f, fi) => (
                                        <li key={fi} className="flex items-center gap-3">
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", plan.highlight ? "bg-pink-100 dark:bg-white/10 text-pink-600 dark:text-pink-400" : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400")}>
                                                <Check size={12} />
                                            </div>
                                            <span className="text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button className={cn("w-full py-4 md:py-6 mt-6 md:mt-8 text-sm md:text-base font-bold font-kantumruy transition-all rounded-xl", plan.highlight ? "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200" : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20")}>
                                ជ្រើសរើស
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function Testimonials() {
    const reviews = [
        {
            name: "សុខា & ស្រីល័ក្ខ",
            role: "រៀបការខែ តុលា ២០២៥",
            text: "MONEA ពិតជាងាយស្រួលប្រើប្រាស់មែនទែន! ភ្ញៀវរបស់យើងសរសើរមិនដាច់ពីមាត់ថាធៀបឡូយ និងទាន់សម័យ។ ការគ្រប់គ្រងចំនួនភ្ញៀវកាន់តែងាយស្រួលជាងមុនឆ្ងាយ។",
        },
        {
            name: "ឧសភា & កញ្ញា",
            role: "រៀបការខែ ធ្នូ ២០២៥",
            text: "អ្វីដែលខ្ញុំចូលចិត្តបំផុតគឺមុខងារ QR កាដូ។ វាមានសុវត្ថិភាព និងងាយស្រួលសម្រាប់ភ្ញៀវដែលនៅឆ្ងាយមិនបានមកចូលរួម។ ពិតជាចំណេញពេលវេលា និងថវិកា។",
        },
        {
            name: "វិច្ឆិកា & ពេជ្រ",
            role: "រៀបការខែ មករា ២០២៦",
            text: "ពុម្ពគំរូមានច្រើនជម្រើស ហើយស្អាតៗខ្លាំងណាស់។ ការរៀបចំក៏លឿន មិនបាច់ចំណាយពេលយូរដូចមុន។ ខ្ញុំសូមណែនាំដល់គូស្នេហ៍ថ្មីៗអោយសាកល្បងវេបសាយនេះធានាថាមិនខកបំណងឡើយ។",
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
                        មតិអតិថិជន
                    </m.span>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold font-kantumruy text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        ចំណាប់អារម្មណ៍ពិតៗ
                    </m.h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 * idx }}
                            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 sm:p-8 rounded-3xl relative hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm"
                        >
                            <Quote className="w-10 h-10 text-slate-200 dark:text-white/10 absolute top-6 right-6" />
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                                ))}
                            </div>
                            <p className="text-slate-600 dark:text-white/80 font-kantumruy font-light leading-loose mb-8 text-sm md:text-base">
                                "{review.text}"
                            </p>
                            <div>
                                <h4 className="text-slate-900 dark:text-white font-bold font-kantumruy">{review.name}</h4>
                                <span className="text-pink-600 dark:text-pink-300/80 text-xs font-kantumruy">{review.role}</span>
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FAQ() {
    const faqs = [
        {
            q: "តើខ្ញុំអាចកែប្រែទិន្នន័យក្រោយពេលផ្ញើធៀបបានទេ?",
            a: "បាទ/ចាស៎ បាន! អ្នកអាចកែប្រែព័ត៌មានដូចជា កាលបរិច្ឆេទ ទីតាំង ឬម៉ោង ដោយទិន្នន័យនឹងផ្លាស់ប្តូរនៅលើធៀបភ្ញៀវដោយស្វ័យប្រវត្តិ។"
        },
        {
            q: "តើចំណងដៃឌីជីថល (QR កាដូ) មានសុវត្ថិភាពកម្រិតណា?",
            a: "វាមានសុវត្ថិភាពខ្ពស់បំផុត ព្រោះប្រព័ន្ធគ្រាន់តែបង្ហាញ QR Code របស់គណនីធនាគារអ្នកដោយផ្ទាល់។ ការវេរប្រាក់គឺធ្វើឡើងរវាងកម្មវិធីធនាគាររបស់ភ្ញៀវ និងធនាគាររបស់អ្នក មិនឆ្លងកាត់ប្រព័ន្ធ MONEA ឡើយ។"
        },
        {
            q: "តើកញ្ចប់ឥតគិតថ្លៃមានសុពលភាពប៉ុន្មានថ្ងៃ?",
            a: "កញ្ចប់ឥតគិតថ្លៃអនុញ្ញាតអោយអ្នកសាកល្បងប្រើប្រាស់មុខងារសំខាន់ៗបានរយៈពេល ២សប្តាហ៍ ជាមួយនឹងចំនួនភ្ញៀវកំណត់ចន្លោះពី ៥០នាក់ចុះ។"
        },
        {
            q: "តើខ្ញុំអាចបន្ថែមចម្រៀងចូលក្នុងធៀបបានដែរ ឬទេ?",
            a: "សម្រាប់កញ្ចប់បរិបូរណ៍ និងអាជីវកម្ម អ្នកអាចជ្រើសរើស ឬចាក់បញ្ចូលចម្រៀងដែលសាកសមសម្រាប់កម្មវិធីរបស់អ្នកបានយ៉ាងងាយស្រួលដើម្បីបង្កើតបរិយាកាសកាន់តែរ៉ូមែនទិច។"
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
                        សំណួរដែលសួរញឹកញាប់
                    </m.h2>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn("border rounded-2xl transition-all duration-300 overflow-hidden", openIdx === idx ? "border-pink-500/50 bg-white dark:bg-white/5 shadow-lg" : "border-slate-200 dark:border-white/10 hover:border-pink-200 dark:hover:border-white/20 bg-white dark:bg-black/50 hover:bg-slate-50 dark:hover:bg-white/[0.02]")}
                        >
                            <button
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full px-5 py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                            >
                                <span className="font-bold font-kantumruy text-slate-900 dark:text-white text-base sm:text-lg">{faq.q}</span>
                                <span className="shrink-0 w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-white/50 bg-slate-50 dark:bg-black/50">
                                    {openIdx === idx ? <Minus size={16} /> : <Plus size={16} />}
                                </span>
                            </button>
                            <AnimatePresence>
                                {openIdx === idx && (
                                    <m.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-slate-500 dark:text-white/60 font-kantumruy font-light leading-relaxed">
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
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900 via-black to-blue-900" />
            <div className="absolute inset-0 bg-[url('/images/bg_tunnel.jpg')] opacity-20 bg-cover bg-center mix-blend-overlay" />
            <div className="absolute inset-0 bg-black/60 sm:backdrop-blur-[2px]" />
            <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center flex flex-col items-center">
                <m.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold font-kantumruy text-white mb-8 tracking-tight drop-shadow-2xl"
                >
                    រួចរាល់សម្រាប់ការបង្កើត<br className="max-md:hidden" />ធៀបអញ្ជើញរបស់អ្នកហើយឬនៅ?
                </m.h2>
                <m.p
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                    className="text-white/80 text-lg md:text-xl font-kantumruy font-light leading-relaxed max-w-2xl mb-12"
                >
                    ចូលរួមជាមួយគូស្វាមីភរិយារាប់រយគូផ្សេងទៀតដែលបានជ្រើសរើស MONEA ដើម្បីធ្វើអោយថ្ងៃពិសេសរបស់ពួកគេកាន់តែអស្ចារ្យ។
                </m.p>
                <m.div
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                    className="w-full flex justify-center"
                >
                    <Link href="/register" className="group relative flex h-14 md:h-16 px-12 md:px-20 items-center justify-center overflow-hidden rounded-full bg-white text-black transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="font-kantumruy text-sm sm:text-base md:text-xl font-bold relative z-10 pt-1 flex items-center justify-center">ចុះឈ្មោះឥឡូវនេះ</span>
                    </Link>
                </m.div>
            </div>
        </section>
    );
}
