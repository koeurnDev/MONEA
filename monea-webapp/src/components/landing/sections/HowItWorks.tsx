import { m } from 'framer-motion';
import { UserPlus, Palette, Users, Send, Sparkles } from "lucide-react";
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
        <section id="how-it-works" className="py-14 md:py-28 bg-[#f7f1ed] dark:bg-[#08070a] relative border-y border-[#eaded8] dark:border-white/10 overflow-hidden">
            
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start md:gap-20">
                    <div className="max-w-xl">
                    <m.div
                        initial={{ opacity: 1, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 mb-5"
                    >
                        <div className="px-4 py-2 rounded-full border border-teal-200 dark:border-teal-300/20 bg-white/70 dark:bg-white/5 shadow-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                            <span className="text-teal-800 dark:text-teal-200 font-bold text-[10px] md:text-xs font-kantumruy">
                                {t("features.howBadge")}
                            </span>
                        </div>
                    </m.div>
                    <m.h2
                        initial={{ opacity: 1, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black font-kantumruy text-[#281a20] dark:text-white mb-6 tracking-tight leading-[1.25]"
                    >
                        {t("features.howTitle")}
                    </m.h2>
                    <m.p
                        initial={{ opacity: 1, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-[#725f62] dark:text-white/60 text-base md:text-lg font-kantumruy leading-relaxed"
                    >
                        {t("features.howSubtitle")}
                    </m.p>
                    </div>

                <div className="relative space-y-2">
                    <div className="absolute bottom-10 left-7 top-10 w-px bg-teal-200 dark:bg-teal-300/20" />
                    {steps.map((step, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 1, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.1 * (idx + 1) }}
                            className="group relative flex items-center gap-3 border-b border-[#eaded8] dark:border-white/10 px-1 py-4 transition-all duration-300 hover:translate-x-1"
                        >
                            <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 via-teal-500 to-amber-400 text-white shadow-xl shadow-teal-700/25 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 sm:h-[4.25rem] sm:w-[4.25rem] sm:rounded-[1.35rem]">
                                <span className="absolute inset-1 rounded-[1.05rem] border border-white/35" />
                                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#f7f1ed] dark:border-[#08070a] bg-[#281a20] text-[10px] font-black text-white">
                                    {idx + 1}
                                </span>
                                <step.icon className="relative z-10 h-6 w-6 drop-shadow-md sm:h-7 sm:w-7" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 font-kantumruy">ជំហានទី {idx + 1}</span>
                                <h3 className="mt-1 text-lg md:text-xl font-bold font-kantumruy text-[#281a20] dark:text-white transition-colors">
                                    {step.title}
                                </h3>
                                <p className="mt-1 text-[#806e70] dark:text-white/60 font-kantumruy leading-relaxed text-xs sm:text-sm transition-colors">
                                    {step.desc}
                                </p>
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
            </div>
        </section>
    );
}
