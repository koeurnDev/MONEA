import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";

interface ParentsSectionProps {
    wedding: WeddingData;
    labels: any;
}

export default function ParentsSection({ wedding, labels }: ParentsSectionProps) {
    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: "easeOut" as any }
    };

    return (
        <m.section className="py-24 px-6 relative overflow-hidden" {...fadeInUp}>
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px]"></div>

            <div className="relative z-10 p-12 border border-[#D4AF37]/40 bg-gradient-to-b from-[#1a1a1a]/80 to-[#111]/90 backdrop-blur-md max-w-lg mx-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-sm will-change-transform">
                {/* Elegant Corner Ornaments */}
                <div className="absolute top-3 left-3 w-16 h-16 border-t border-l border-[#D4AF37]/60"></div>
                <div className="absolute top-3 right-3 w-16 h-16 border-t border-r border-[#D4AF37]/60"></div>
                <div className="absolute bottom-3 left-3 w-16 h-16 border-b border-l border-[#D4AF37]/60"></div>
                <div className="absolute bottom-3 right-3 w-16 h-16 border-b border-r border-[#D4AF37]/60"></div>

                <div className="flex flex-col gap-12 text-center text-white relative">
                    {/* Groom Side */}
                    <div>
                        <p className="text-xs text-[#D4AF37] font-bold uppercase mb-6 tracking-[0.4em] font-header opacity-90 drop-shadow-sm">
                            {labels.groom_label}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-khmer font-medium text-[#F9F1D8] mb-3 leading-relaxed">
                            {wedding.themeSettings?.parents?.groomFather || "លោក មាស ភារុណ"}
                        </h3>
                        <h3 className="text-2xl md:text-3xl font-khmer font-medium text-[#F9F1D8] leading-relaxed">
                            {wedding.themeSettings?.parents?.groomMother || "លោកស្រី ស៊ឹម សុខា"}
                        </h3>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center gap-6 opacity-70">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
                        <span className="text-[#D4AF37] text-2xl font-greatvibes">and</span>
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
                    </div>

                    {/* Bride Side */}
                    <div>
                        <p className="text-xs text-[#D4AF37] font-bold uppercase mb-6 tracking-[0.4em] font-header opacity-90 drop-shadow-sm">
                            {labels.bride_label}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-khmer font-medium text-[#F9F1D8] mb-3 leading-relaxed">
                            {wedding.themeSettings?.parents?.brideFather || "លោក ចាន់ សុភ័ក្រ"}
                        </h3>
                        <h3 className="text-2xl md:text-3xl font-khmer font-medium text-[#F9F1D8] leading-relaxed">
                            {wedding.themeSettings?.parents?.brideMother || "លោកស្រី ហែម ស្រីពៅ"}
                        </h3>
                    </div>
                </div>
            </div>
        </m.section>
    );
}
