"use client";

import { WeddingData } from '../types';
import { RevealSection } from '../shared/CinematicComponents';
import { MoneaBranding } from '@/components/MoneaBranding';

interface FooterSectionProps {
    wedding: WeddingData;
}

export function FooterSection({ wedding }: FooterSectionProps) {
    return (
        <section className="py-60 px-12 text-center bg-white border-t border-gold/5 pb-64 relative">
            <div className="max-w-4xl mx-auto">
                <RevealSection>
                    <div className="space-y-24 relative z-10">
                        <p className="font-khmer-content text-[16px] md:text-[18px] leading-[3] text-gray-700 max-w-[480px] mx-auto opacity-80 italic font-medium">
                            យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅបំផុតចំពោះការផ្តល់កិត្តិយសចូលរួម ក្នុងពិធីរបស់យើងខ្ញុំ និងសូមជូនពរឱ្យទទួលបាននូវព្រះពុទ្ធពរ ៤ ប្រការគឺ អាយុ វណ្ណៈ សុខៈ ពលៈ កុំបីឃ្លៀងឃ្លាតឡើយ។
                        </p>
                        <div className="pt-10">
                            <MoneaBranding packageType={wedding.packageType} />
                        </div>
                        <div className="text-[11px] tracking-[0.8em] font-black text-gray-400 uppercase pt-4">
                            {wedding.themeSettings?.customLabels?.footerLabel || "រក្សានូវរាល់អនុស្សាវរីយ៍"}
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}
