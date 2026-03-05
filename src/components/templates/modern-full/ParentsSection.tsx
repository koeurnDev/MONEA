import React from 'react';
import { WeddingData } from "../types";
import { m } from 'framer-motion';

interface ParentsSectionProps {
    wedding: WeddingData;
    labels: any;
}

export default function ParentsSection({ wedding, labels }: ParentsSectionProps) {
    return (
        <m.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="px-4 py-8 md:py-12 mx-auto max-w-5xl text-center relative z-20 mb-8 font-khmer space-y-8"
        >
            {/* Header: Honor to Invite */}
            <h2 className="text-xl md:text-3xl font-kantumruy text-pink-300 drop-shadow-md font-bold">
                មានកិត្តិយសសូមគោរពអញ្ជើញ
            </h2>

            {/* Invitation Body */}
            <p className="text-white/90 text-sm md:text-lg leading-relaxed max-w-3xl mx-auto">
                ឯកឧត្តម អ្នកឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ចូលរួម និងជាភ្ញៀវកិត្តិយស
                ដើម្បីប្រសិទ្ធពរជ័យ សិរីសួស្ដី ជ័យមង្គល ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍ កូនប្រុស-កូនស្រី របស់ យើងខ្ញុំ
            </p>

            {/* 3-Column Layout: Groom - Monogram - Bride */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mt-12">

                {/* Left: Groom */}
                <div className="order-2 md:order-1 space-y-4">
                    <div className="space-y-1 text-gray-200 font-khmer text-sm md:text-lg opacity-90">
                        <p>{wedding.themeSettings?.parents?.groomFather || "លោក មាស ភារុណ"}</p>
                        <p>{wedding.themeSettings?.parents?.groomMother || "លោកស្រី ស៊ឹម សុខា"}</p>
                    </div>
                    <p className="text-xs md:text-sm text-pink-300 tracking-wider font-light opacity-80 pb-2">ត្រូវជាមាតាបិតា</p>
                    <div>
                        <p className="text-lg text-pink-300 font-bold uppercase tracking-widest drop-shadow-md pb-1">កូនប្រុសនាម</p>
                        <h3 className="text-2xl md:text-4xl text-white font-kantumruy drop-shadow-lg font-bold">{wedding.groomName}</h3>
                    </div>
                </div>

                {/* Center: Monogram Circle (Floral Wreath) */}
                <div className="order-1 md:order-2 flex justify-center relative">
                    <div className="relative w-80 h-80 md:w-96 md:h-96 flex flex-col items-center justify-center">

                        {/* Floral Wreath Frame - REMOVED as per request */}
                        {/* <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                                src="/images/floral_wreath_transparent.png" 
                                alt="Floral Wreath" 
                                className="w-full h-full object-contain scale-110 drop-shadow-xl filter brightness-110" 
                            />
                         </div> */}

                        {/* Text Inside Wreath - Now Standalone */}
                        <div className="text-center space-y-4 z-10 pt-2 relative drop-shadow-md">
                            <h3 className="text-6xl md:text-8xl font-script text-pink-300 tracking-widest leading-none drop-shadow-lg scale-110">
                                {wedding.groomName?.split(' ').pop()?.toLowerCase()}
                            </h3>
                            <div className="text-5xl md:text-6xl text-white font-script italic -my-4">&</div>
                            <h3 className="text-6xl md:text-8xl font-script text-pink-300 tracking-widest leading-none drop-shadow-lg scale-110">
                                {wedding.brideName?.split(' ').pop()?.toLowerCase()}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Right: Bride */}
                <div className="order-3 md:order-3 space-y-4">
                    <div className="space-y-1 text-gray-200 font-khmer text-sm md:text-lg opacity-90">
                        <p>{wedding.themeSettings?.parents?.brideFather || "លោក ចាន់ សុភ័ក្រ"}</p>
                        <p>{wedding.themeSettings?.parents?.brideMother || "លោកស្រី ហែម ស្រីពៅ"}</p>
                    </div>
                    <p className="text-xs md:text-sm text-pink-300 tracking-wider font-light opacity-80 pb-2">ត្រូវជាមាតាបិតា</p>
                    <div>
                        <p className="text-lg text-pink-300 font-bold uppercase tracking-widest drop-shadow-md pb-1">កូនស្រីនាម</p>
                        <h3 className="text-2xl md:text-4xl text-white font-kantumruy drop-shadow-lg font-bold">{wedding.brideName}</h3>
                    </div>
                </div>

            </div>
        </m.section>
    );
}
