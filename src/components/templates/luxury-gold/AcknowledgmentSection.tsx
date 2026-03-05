import React from 'react';
import { m } from 'framer-motion';
import { Heart } from 'lucide-react';
import { WeddingData } from "../types";

interface AcknowledgmentSectionProps {
    wedding: WeddingData;
}

export default function AcknowledgmentSection({ wedding }: AcknowledgmentSectionProps) {
    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: "easeOut" as any }
    };

    return (
        <m.section {...fadeInUp} className="px-8 py-24 text-center bg-[#0a0a0a] border-t border-[#D4AF37]/10">
            <div className="relative p-10 border border-[#D4AF37]/20 bg-[#1a1a1a]/40 backdrop-blur-sm">
                <Heart className="absolute -top-5 left-1/2 -translate-x-1/2 text-[#D4AF37] fill-black p-1 bg-[#1a1a1a]" size={40} />
                <h3 className="font-header mb-8 text-xl text-[#D4AF37]">សេចក្តីថ្លែងអំណរគុណ</h3>
                <p className="text-sm leading-loose text-gray-400 italic font-khmer tracking-wide">
                    &quot;{wedding.themeSettings?.acknowledgment || "យើងខ្ញុំជាមាតាបិតា និងកូនៗទាំងអស់ សូមគោរពថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ខ្ពង់ខ្ពស់របស់លោកអ្នក ដែលបានចំណាយពេលដ៏មានតម្លៃមកផ្តល់កិត្តិយស និងពរជ័យដល់កូនៗយើងខ្ញុំ។"}&quot;
                </p>
            </div>
        </m.section>
    );
}
