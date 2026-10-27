import { m } from 'framer-motion';
import SafeQRCode from "@/components/ui/SafeQRCode";
import { WeddingData } from '../types';
import { RevealSection } from '../shared/CinematicComponents';
import { useTranslation } from '@/i18n/LanguageProvider';

interface ThankYouSectionProps {
    wedding: WeddingData;
    smartColors: { primary: string; secondary: string; dark: string };
}

export function ThankYouSection({ wedding, smartColors }: ThankYouSectionProps) {
    const { t } = useTranslation();
    return (
        <section className="py-16 md:py-64 px-8 md:px-12 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto space-y-32 md:space-y-48">
                <RevealSection delay={0.3}>
                    <div className="text-center">

                        {wedding.guestId && (
                            <m.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="mb-24 max-w-sm mx-auto flex flex-col items-center gap-6 group relative overflow-hidden"
                            >
                                <div className="text-center space-y-3">
                                    <p className="font-khmer-moul text-base text-gold-main tracking-wide leading-relaxed">
                                        {wedding.themeSettings?.customLabels?.ticketHeader || t("template.khmerLegacy.ticketHeader")}
                                    </p>
                                    <div className="w-12 h-[1px] bg-gold-main/20 mx-auto" />
                                    <p className="font-kantumruy text-xs text-slate-400 tracking-wide font-bold">
                                        {wedding.themeSettings?.customLabels?.ticketSubtitle || t("template.khmerLegacy.ticketSubtitle")}
                                    </p>
                                </div>

                                <div className="p-4 bg-white group-hover:scale-105 transition-transform duration-700">
                                    <SafeQRCode
                                        value={wedding.guestId}
                                        size={200}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                        fgColor={smartColors.dark || "#1a1a1a"}
                                    />
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="font-khmer-content text-base text-slate-600 font-black italic leading-relaxed">
                                        {t("template.khmerLegacy.ticketInfo")}
                                    </p>
                                </div>
                            </m.div>
                        )}

                    </div>
                </RevealSection>
            </div>
        </section>
    );
}
