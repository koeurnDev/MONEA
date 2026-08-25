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
        <section id="how-it-works" className="py-24 md:py-32 bg-[#FAFAFA] dark:bg-[#080808] relative border-y border-slate-100 dark:border-white/5 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[30%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-pink-100/40 dark:bg-pink-900/10 blur-[150px] pointer-events-none" />
            
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
                    <m.div
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 mb-6"
                    >
                        <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-rose-500" />
                            <span className="text-slate-700 dark:text-white/90 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] font-kantumruy">
                                {t("features.howBadge")}
                            </span>
                        </div>
                    </m.div>
                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black font-kantumruy text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.2]"
                    >
                        {t("features.howTitle")}
                    </m.h2>
                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="text-slate-600 dark:text-white/60 text-lg md:text-xl font-kantumruy font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        {t("features.howSubtitle")}
                    </m.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative">
                    <div className="hidden md:block absolute top-[4rem] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-rose-300 dark:via-rose-900/50 to-transparent" />
                    {steps.map((step, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.1 * (idx + 1) }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            <div className="absolute -top-10 -right-2 text-6xl font-black font-kantumruy text-slate-900/[0.03] dark:text-white/[0.03] group-hover:text-rose-500/10 dark:group-hover:text-rose-500/20 transition-colors pointer-events-none italic">
                                0{idx + 1}
                            </div>
                            
                            <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-[#111] border border-slate-200/80 dark:border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-pink-600 group-hover:text-white text-slate-700 dark:text-white/80 group-hover:-translate-y-3 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-rose-500/20 will-change-transform overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                                <step.icon className="w-10 h-10 transition-colors relative z-10" />
                            </div>
                            
                            <h3 className="text-xl md:text-2xl font-bold font-kantumruy text-slate-900 dark:text-white mb-4 transition-colors">
                                {step.title}
                            </h3>
                            <p className="text-slate-500 dark:text-white/60 font-kantumruy font-light leading-relaxed text-sm md:text-base px-2 group-hover:text-slate-700 dark:group-hover:text-white/90 transition-colors">
                                {step.desc}
                            </p>
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
