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
            initial={{ opacity: 1, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: delay * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "group relative p-4 sm:p-8 md:p-10 rounded-2xl bg-white/[0.06] border border-white/10 overflow-hidden hover:border-teal-300/40 hover:bg-white/[0.09] transition-all duration-500 shadow-2xl shadow-black/10 flex flex-col justify-start sm:justify-between backdrop-blur-xl",
                className
            )}
        >
            {/* Ambient Background Glow on Hover */}
            <div className={cn(
                "absolute -inset-10 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700 pointer-events-none rounded-full",
                gradientClass
            )} />
            
            <div className="relative z-10 w-9 h-9 sm:w-14 sm:h-14 mb-2 sm:mb-8 rounded-xl sm:rounded-2xl bg-teal-400/10 flex items-center justify-center border border-teal-200/20 group-hover:scale-105 transition-all duration-300 shadow-xs">
                <Icon size={18} className="text-teal-200 shrink-0 sm:hidden" />
                <Icon size={21} className="text-teal-200 shrink-0 hidden sm:block" />
            </div>

            <div className="relative z-10 sm:mt-auto space-y-2.5">
                <h3 className="text-base sm:text-2xl font-bold font-kantumruy text-white tracking-tight">
                    {title}
                </h3>
                <p className="text-white/65 text-[11px] sm:text-sm md:text-base font-kantumruy leading-relaxed font-normal">
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
            className: "md:col-span-7 min-h-0 sm:min-h-[340px] bg-teal-500/10 border-teal-300/20",
            gradientClass: "bg-teal-500"
        },
        {
            icon: Wallet,
            title: t("features.card3Title", { defaultValue: "ទទួលចំណងដៃ KHQR ផ្ទាល់" }),
            desc: t("features.card3Desc", { defaultValue: "ភ្ញៀវអាចស្កេន Bakong KHQR ផ្ញើចំណងដៃចូលគណនីធនាគាររបស់អ្នកផ្ទាល់ មិនកាត់កម្រៃជើងសារ។" }),
            className: "md:col-span-5 min-h-0 sm:min-h-[300px]",
            gradientClass: "bg-emerald-500"
        },
        {
            icon: MapPin,
            title: t("features.card4Title", { defaultValue: "ផែនទី & ទីតាំងច្បាស់លាស់" }),
            desc: t("features.card4Desc", { defaultValue: "ភ្ជាប់ជាមួយ Google Maps ជួយឱ្យភ្ញៀវធ្វើដំណើរទៅដល់ទីតាំងរោងការបានយ៉ាងងាយស្រួល។" }),
            className: "md:col-span-5 min-h-0 sm:min-h-[300px]",
            gradientClass: "bg-amber-500"
        },
        {
            icon: Heart,
            title: t("features.card5Title", { defaultValue: "សៀវភៅជូនពរឌីជីថល" }),
            desc: t("features.card5Desc", { defaultValue: "ភ្ញៀវអាចផ្ញើសារជូនពរ និងរូបថតអនុស្សាវរីយ៍ស្អាតៗបង្ហាញលើអេក្រង់ផ្សាយផ្ទាល់ភ្លាមៗ។" }),
            className: "md:col-span-7 min-h-0 sm:min-h-[300px]",
            gradientClass: "bg-teal-400"
        },
    ];

    return (
        <section id="features" className="py-12 sm:py-24 bg-[#160d19] relative border-b border-white/10 overflow-hidden font-kantumruy">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                <div className="max-w-3xl mb-10 sm:mb-14 flex flex-col items-start">
                    <m.div 
                        initial={{ opacity: 1, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-300/10 text-teal-200 text-xs font-bold mb-3"
                    >
                        <Sparkles size={13} />
                        <span>អ្វីដែល MONEA រៀបចំជូនអ្នក</span>
                    </m.div>
                    <m.h2
                        initial={{ opacity: 1, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight"
                    >
                        {t("features.title", { defaultValue: "អ្វីដែល MONEA ផ្តល់ជូន" })}
                    </m.h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base font-kantumruy">
                        ពីការរចនាធៀបការ រហូតដល់ការទទួលភ្ញៀវ និងចំណងដៃ MONEA រៀបចំអ្វីៗសំខាន់ៗឱ្យអ្នកនៅកន្លែងតែមួយ។
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-6 relative z-10">
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
