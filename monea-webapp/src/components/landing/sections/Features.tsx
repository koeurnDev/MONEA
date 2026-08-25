import { m } from 'framer-motion';
import { LayoutTemplate, Wallet, MapPin, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

function FeatureBentoCard({ 
    icon: Icon, 
    title, 
    desc, 
    delay,
    className,
    gradientClass
}: { 
    icon: any, 
    title: string, 
    desc: string, 
    delay: number,
    className?: string,
    gradientClass: string
}) {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: delay * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "group relative p-6 sm:p-8 md:p-10 rounded-3xl bg-card border border-border/80 overflow-hidden hover:border-rose-500/30 transition-all duration-500 shadow-xs hover:shadow-xl flex flex-col justify-between backdrop-blur-xl",
                className
            )}
        >
            {/* Ambient Background Glow on Hover */}
            <div className={cn(
                "absolute -inset-10 opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-700 pointer-events-none rounded-full",
                gradientClass
            )} />
            
            <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 mb-6 sm:mb-8 rounded-2xl bg-muted/60 dark:bg-white/5 flex items-center justify-center border border-border/80 group-hover:scale-105 transition-all duration-300 shadow-xs">
                <Icon size={24} className="text-rose-600 dark:text-rose-400 shrink-0" />
            </div>

            <div className="relative z-10 mt-auto space-y-2.5">
                <h3 className="text-xl sm:text-2xl font-bold font-kantumruy text-foreground tracking-tight">
                    {title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base font-kantumruy leading-relaxed font-normal">
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
            className: "md:col-span-7 min-h-[260px] sm:min-h-[300px]",
            gradientClass: "bg-rose-500"
        },
        {
            icon: Wallet,
            title: t("features.card3Title", { defaultValue: "ទទួលចំណងដៃ KHQR ផ្ទាល់" }),
            desc: t("features.card3Desc", { defaultValue: "ភ្ញៀវអាចស្កេន Bakong KHQR ផ្ញើចំណងដៃចូលគណនីធនាគាររបស់អ្នកផ្ទាល់ មិនកាត់កម្រៃជើងសារ។" }),
            className: "md:col-span-5 min-h-[260px] sm:min-h-[300px]",
            gradientClass: "bg-emerald-500"
        },
        {
            icon: MapPin,
            title: t("features.card4Title", { defaultValue: "ផែនទី & ទីតាំងច្បាស់លាស់" }),
            desc: t("features.card4Desc", { defaultValue: "ភ្ជាប់ជាមួយ Google Maps ជួយឱ្យភ្ញៀវធ្វើដំណើរទៅដល់ទីតាំងរោងការបានយ៉ាងងាយស្រួល។" }),
            className: "md:col-span-5 min-h-[260px] sm:min-h-[300px]",
            gradientClass: "bg-amber-500"
        },
        {
            icon: Heart,
            title: t("features.card5Title", { defaultValue: "សៀវភៅជូនពរឌីជីថល" }),
            desc: t("features.card5Desc", { defaultValue: "ភ្ញៀវអាចផ្ញើសារជូនពរ និងរូបថតអនុស្សាវរីយ៍ស្អាតៗបង្ហាញលើអេក្រង់ផ្សាយផ្ទាល់ភ្លាមៗ។" }),
            className: "md:col-span-7 min-h-[260px] sm:min-h-[300px]",
            gradientClass: "bg-pink-500"
        },
    ];

    return (
        <section id="features" className="py-16 sm:py-24 bg-card/40 dark:bg-background relative border-b border-border/60 overflow-hidden font-kantumruy">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 flex flex-col items-center">
                    <m.div 
                        initial={{ opacity: 0, y: 15 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold mb-3"
                    >
                        <Sparkles size={13} />
                        <span>លក្ខណៈពិសេសកម្រិតខ្ពស់</span>
                    </m.div>
                    <m.h2
                        initial={{ opacity: 0, y: 15 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight"
                    >
                        {t("features.title", { defaultValue: "អ្វីដែល MONEA ផ្តល់ជូន" })}
                    </m.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 relative z-10">
                    {features.map((feature, idx) => (
                        <FeatureBentoCard
                            key={idx}
                            icon={feature.icon}
                            title={feature.title}
                            desc={feature.desc}
                            className={feature.className}
                            gradientClass={feature.gradientClass}
                            delay={idx + 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
