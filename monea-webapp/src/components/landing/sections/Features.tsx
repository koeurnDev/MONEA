import { m } from 'framer-motion';
import { LayoutTemplate, Wallet, MapPin, Heart, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

function FeatureRow({
    icon: Icon, 
    title, 
    desc, 
    delay
}: { 
    icon: any, 
    title: string, 
    desc: string, 
    delay: number
}) {
    return (
        <m.div
            initial={{ opacity: 1, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: delay * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="group flex min-w-0 items-start gap-4 border-b border-border py-5 transition-colors duration-300 hover:border-sage/60 sm:gap-5 sm:py-6"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors duration-300 group-hover:bg-secondary sm:h-11 sm:w-11">
                <Icon size={19} className="shrink-0" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="font-kantumruy text-sm font-bold leading-6 tracking-tight text-foreground sm:text-base">
                    {title}
                </h3>
                <p className="mt-1 font-kantumruy text-xs font-normal leading-6 text-muted-foreground sm:text-sm">
                    {desc}
                </p>
            </div>

        </m.div>
    );
}

export function Features() {
    const { t } = useTranslation();
    const features = [
        {
            icon: LayoutTemplate,
            title: t("features.card1Title", { defaultValue: "ការរចនាបែបប្រណីត" }),
            desc: t("features.card1Desc", { defaultValue: "Template ទំនើប ស្រស់ស្អាត និងអាចកែប្រែបានច្រើន ដែលបង្កើតចំណាប់អារម្មណ៍យូរអង្វែងសម្រាប់ភ្ញៀវរបស់អ្នក។" }),
        },
        {
            icon: Wallet,
            title: t("features.card3Title", { defaultValue: "ទទួលចំណងដៃ KHQR ផ្ទាល់" }),
            desc: t("features.card3Desc", { defaultValue: "ភ្ញៀវអាចស្កេន Bakong KHQR ផ្ញើចំណងដៃចូលគណនីធនាគាររបស់អ្នកផ្ទាល់ មិនកាត់កម្រៃជើងសារ។" }),
        },
        {
            icon: MapPin,
            title: t("features.card4Title", { defaultValue: "ផែនទី & ទីតាំងច្បាស់លាស់" }),
            desc: t("features.card4Desc", { defaultValue: "ភ្ជាប់ជាមួយ Google Maps ជួយឱ្យភ្ញៀវធ្វើដំណើរទៅដល់ទីតាំងរោងការបានយ៉ាងងាយស្រួល។" }),
        },
        {
            icon: Heart,
            title: t("features.card5Title", { defaultValue: "សៀវភៅជូនពរឌីជីថល" }),
            desc: t("features.card5Desc", { defaultValue: "ភ្ញៀវអាចផ្ញើសារជូនពរ និងរូបថតអនុស្សាវរីយ៍ស្អាតៗបង្ហាញលើអេក្រង់ផ្សាយផ្ទាល់ភ្លាមៗ។" }),
        },
    ];

    return (
        <section id="features" className="relative overflow-hidden border-b border-border bg-background py-12 font-kantumruy sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                <div className="max-w-3xl mb-10 sm:mb-14 flex flex-col items-start">
                    <m.div 
                        initial={{ opacity: 1, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }}
                        className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-primary"
                    >
                        <Sparkles size={13} />
                        <span>{t("features.badge", { defaultValue: "Template មានច្រើនជម្រើស" })}</span>
                    </m.div>
                    <m.h2
                        initial={{ opacity: 1, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl"
                    >
                        {t("features.title", { defaultValue: "ភ្ជាប់ពាក្យ ឬ រៀបការ" })}
                    </m.h2>
                    <p className="mt-4 max-w-2xl font-kantumruy text-sm leading-7 text-muted-foreground sm:text-base">
                        {t("features.subtitle", { defaultValue: "គំរូសម្រាប់ពិធីភ្ជាប់ពាក្យ និង រៀបការ  ស្អាតជាច្រើន" })}
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-1 gap-x-10 md:grid-cols-2">
                    {features.map((feature, idx) => (
                        <FeatureRow
                            key={idx}
                            icon={feature.icon}
                            title={feature.title}
                            desc={feature.desc}
                            delay={idx + 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
