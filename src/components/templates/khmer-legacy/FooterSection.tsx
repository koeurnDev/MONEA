"use client";
import { WeddingData } from '../types';
import { RevealSection } from '../shared/CinematicComponents';
import { MoneaBranding } from '@/components/MoneaBranding';
import { useTranslation } from '@/i18n/LanguageProvider';

interface FooterSectionProps {
    wedding: WeddingData;
}

export function FooterSection({ wedding }: FooterSectionProps) {
    const { t } = useTranslation();
    return (
        <section className="py-20 px-12 text-center bg-white border-t border-gold/5 pb-32 relative">
            <div className="max-w-4xl mx-auto">
                <RevealSection>
                    <div className="space-y-12 relative z-10">
                        <p className="font-khmer-content text-[16px] md:text-[18px] leading-[3] text-gray-700 max-w-[480px] mx-auto italic font-medium">
                            {t("template.khmerLegacy.footerThankYou")}
                        </p>
                        <div className="pt-10">
                            <MoneaBranding packageType={wedding.packageType} />
                        </div>
                        <div className="text-[10px] md:text-xs tracking-[1em] font-black text-gold-main/60 uppercase pt-8">
                            {wedding.themeSettings?.customLabels?.footerLabel || t("template.khmerLegacy.footerLabel")}
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}
