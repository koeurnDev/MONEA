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
        <section id="how-it-works" className="relative overflow-hidden border-y border-border bg-background py-12 sm:py-16 md:py-24">
            
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start md:gap-16 lg:gap-20">
                <div className="max-w-xl">
                <m.div
                    initial={{ opacity: 1, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-primary sm:mb-4"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="font-kantumruy">{t("features.howBadge")}</span>
                </m.div>
                <m.h2
                    initial={{ opacity: 1, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                    className="mb-4 font-kantumruy text-2xl font-bold leading-tight tracking-tight text-foreground sm:mb-5 sm:text-3xl md:text-4xl lg:text-5xl"
                >
                    {t("features.howTitle")}
                </m.h2>
                <m.p
                    initial={{ opacity: 1, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                    className="font-kantumruy text-sm leading-7 text-muted-foreground sm:text-base"
                >
                    {t("features.howSubtitle")}
                </m.p>
                </div>

                <div className="relative">
                {steps.map((step, idx) => (
                    <m.div
                        key={idx}
                            initial={{ opacity: 1, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.1 * (idx + 1) }}
                            className="group flex items-start gap-4 border-b border-border py-5 transition-colors duration-300 hover:border-sage/60 sm:gap-5 sm:py-6"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors duration-300 group-hover:bg-secondary sm:h-11 sm:w-11">
                                <step.icon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                                <span className="font-kantumruy text-xs font-bold text-gold">ជំហានទី {idx + 1}</span>
                                <h3 className="mt-1 font-kantumruy text-sm font-bold leading-6 text-foreground transition-colors sm:text-base">
                                    {step.title}
                                </h3>
                                <p className="mt-1 font-kantumruy text-xs leading-6 text-muted-foreground transition-colors sm:text-sm">
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
