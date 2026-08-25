import { useState } from "react";
import { m, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

export function FAQ() {
    const { t } = useTranslation();
    const faqs = [
        {
            q: t("faq.q1"),
            a: t("faq.a1")
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
        <section className="py-32 bg-[#FDFBF7] dark:bg-[#0A0A0A] relative overflow-hidden border-t border-slate-100 dark:border-white/5">
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
                            className={cn("border rounded-[2rem] transition-all duration-500 overflow-hidden", openIdx === idx ? "border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 shadow-sm" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/50 dark:bg-black/40 hover:bg-white dark:hover:bg-white/[0.03]")}
                        >
                            <button
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full px-8 py-7 text-left flex items-center justify-between gap-6 focus:outline-none group/faq"
                            >
                                <span className={cn("font-bold font-kantumruy text-lg sm:text-xl transition-colors duration-300 tracking-tight", openIdx === idx ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-white/80 group-hover/faq:text-slate-950 dark:group-hover/faq:text-white")}>{faq.q}</span>
                                <span className={cn("shrink-0 w-10 h-10 rounded-2xl border flex items-center justify-center transition-all duration-500", openIdx === idx ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white rotate-180" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 group-hover/faq:scale-110")}>
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
