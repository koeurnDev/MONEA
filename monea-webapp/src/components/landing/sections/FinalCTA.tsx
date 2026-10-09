import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { AUTH_URLS } from "@/lib/constants";

export function FinalCTA() {
    const { t } = useTranslation();
    return (
        <section className="py-10 md:py-28 relative overflow-hidden bg-[#160d19] border-t border-white/10">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
                <m.div
                    initial={{ opacity: 1, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full overflow-hidden border-y border-white/10 py-6 md:py-16 text-center flex flex-col items-center"
                >
                    <m.div
                        initial={{ opacity: 1, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 mb-4 md:mb-7 px-4 py-2 rounded-full bg-teal-300/10 border border-teal-200/20"
                    >
                        <Sparkles className="w-4 h-4 text-teal-300" />
                        <span className="text-teal-100 font-bold text-[10px] md:text-xs font-kantumruy">
                            {t("cta.badge") || "MONEA"}
                        </span>
                    </m.div>

                    <m.h2
                        initial={{ opacity: 1, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                        className="text-2xl sm:text-4xl md:text-5xl font-black font-kantumruy text-white mb-4 md:mb-6 tracking-tight leading-[1.45] relative z-10"
                    >
                        {t("cta.title1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">{t("cta.title2")}</span>
                    </m.h2>

                    <m.p
                        initial={{ opacity: 1, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                        className="text-white/65 text-sm md:text-lg font-kantumruy leading-relaxed max-w-2xl mb-6 md:mb-9 relative z-10"
                    >
                        {t("cta.description")}
                    </m.p>

                    <m.div
                        initial={{ opacity: 1, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
                        className="w-full flex justify-center relative z-10"
                    >
                        <Link to={AUTH_URLS.SIGN_UP} className="group relative flex h-14 px-8 md:px-12 items-center justify-center overflow-hidden rounded-xl bg-teal-600 text-white transition-all duration-300 hover:bg-teal-500 hover:scale-[1.03] active:scale-95 shadow-xl shadow-teal-950/30">
                            <span className="font-kantumruy text-sm sm:text-base font-bold relative z-10 flex items-center justify-center gap-3">
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
