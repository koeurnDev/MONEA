import { m } from 'framer-motion';
import { Quote, Star } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

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
        <section className="py-24 md:py-32 bg-white dark:bg-[#0A0A0A] relative border-t border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center mb-20 flex flex-col items-center">
                    <m.span
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/80 font-bold text-xs uppercase tracking-[0.2em] mb-6 sm:backdrop-blur-md"
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
                            className="group bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 sm:p-10 rounded-[2.5rem] relative hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-500 shadow-sm backdrop-blur-sm hover:-translate-y-1"
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
                                <h4 className="text-slate-900 dark:text-white font-bold font-kantumruy text-lg tracking-tight">{review.name}</h4>
                                <span className="text-slate-500 dark:text-white/50 font-bold font-kantumruy text-xs uppercase tracking-wider">{review.role}</span>
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
