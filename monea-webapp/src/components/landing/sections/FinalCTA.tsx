import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { AUTH_URLS } from "@/lib/constants";

export function FinalCTA() {
    const { t } = useTranslation();
    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-[#FDFDFD] dark:bg-[#050505]">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
                {/* Glassmorphism Card */}
                <m.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 overflow-hidden bg-slate-950 dark:bg-white/5 border border-slate-900 dark:border-white/10 shadow-2xl shadow-rose-900/10 text-center flex flex-col items-center"
                >
                    {/* Inner Mesh Gradients */}
                    <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[150%] rounded-full bg-gradient-to-br from-rose-500/30 to-pink-500/0 blur-[80px] md:blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[150%] rounded-full bg-gradient-to-tl from-indigo-500/30 to-blue-500/0 blur-[80px] md:blur-[120px] pointer-events-none" />
                    
                    {/* Noise texture optional */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay"></div>

                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4 text-rose-300" />
                        <span className="text-white/90 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] font-kantumruy">
                            {t("cta.badge") || "MONEA"}
                        </span>
                    </m.div>

                    <m.h2
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black font-kantumruy text-white mb-8 tracking-tight leading-[1.5] drop-shadow-lg relative z-10"
                    >
                        {t("cta.title1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300 whitespace-nowrap">{t("cta.title2")}</span>
                    </m.h2>

                    <m.p
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                        className="text-white/70 text-lg md:text-xl font-kantumruy font-light leading-relaxed max-w-2xl mb-12 relative z-10"
                    >
                        {t("cta.description")}
                    </m.p>

                    <m.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
                        className="w-full flex justify-center relative z-10"
                    >
                        <Link to={AUTH_URLS.SIGN_UP} className="group relative flex h-14 md:h-16 px-10 md:px-14 items-center justify-center overflow-hidden rounded-full bg-white text-slate-900 transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl shadow-black/20">
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="font-kantumruy text-sm sm:text-base font-bold relative z-10 flex items-center justify-center gap-3 pt-0.5">
                                {t("cta.button")}
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                            </span>
                        </Link>
                    </m.div>
                </m.div>
            </div>
        </section>
    );
}
