import React from 'react';
import { WeddingData } from '../types';

interface ParentsSectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const ParentsSection: React.FC<ParentsSectionProps> = ({ wedding, primaryColor }) => {
    const isEngagement = wedding.eventType === 'anniversary';
    const groomName = wedding.groomName || "កូនកំលោះ";
    const brideName = wedding.brideName || "កូនក្រមុំ";

    const groomFather = wedding.themeSettings?.parents?.groomFather || "លោកឪពុក";
    const groomMother = wedding.themeSettings?.parents?.groomMother || "អ្នកម្តាយ";
    const brideFather = wedding.themeSettings?.parents?.brideFather || "លោកឪពុក";
    const brideMother = wedding.themeSettings?.parents?.brideMother || "អ្នកម្តាយ";

    return (
        <section className="py-12 px-4 sm:px-6 bg-[#520912] text-white text-center font-kantumruy relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-8 relative z-10">
                {/* Header Decoration */}
                <div className="flex flex-col items-center space-y-2">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-amber-300">
                        {isEngagement ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍"}
                    </span>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                </div>

                {/* Parents Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                    {/* Groom Parents */}
                    <div className="bg-black/40 border border-amber-400/40 rounded-2xl p-4 shadow-md space-y-1.5">
                        <span className="text-[11px] font-bold text-amber-300 block uppercase tracking-wider">
                            មាតាបិតាខាងប្រុស
                        </span>
                        <p className="font-bold text-white">{groomFather}</p>
                        <p className="font-bold text-white">{groomMother}</p>
                    </div>

                    {/* Bride Parents */}
                    <div className="bg-black/40 border border-amber-400/40 rounded-2xl p-4 shadow-md space-y-1.5">
                        <span className="text-[11px] font-bold text-amber-300 block uppercase tracking-wider">
                            មាតាបិតាខាងស្រី
                        </span>
                        <p className="font-bold text-white">{brideFather}</p>
                        <p className="font-bold text-white">{brideMother}</p>
                    </div>
                </div>

                {/* Formal Invitation Paragraph */}
                <div className="bg-[#6B0E1B]/80 border border-amber-400/40 rounded-3xl p-5 sm:p-6 text-xs sm:text-sm leading-relaxed text-amber-100/90 space-y-3 shadow-md">
                    <p className="font-bold text-amber-300 text-sm">
                        សូមគោរពអញ្ជើញ
                    </p>
                    <p>
                        {wedding.themeSettings?.customLabels?.formal_invitation_text || 
                        "ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យ សិរីសួស្តី ជ័យមង្គល ក្នុងពិធីមង្គលការ កូនប្រុស-កូនស្រី របស់យើងខ្ញុំ។"}
                    </p>
                </div>

                {/* Couple Highlight */}
                <div className="py-2 space-y-1">
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="text-right">
                            <span className="text-[11px] text-amber-200/60 block">កូនប្រុសនាម</span>
                            <span className="text-base sm:text-lg font-khmer-moul text-amber-300">{groomName}</span>
                        </div>
                        <div className="text-left">
                            <span className="text-[11px] text-amber-200/60 block">កូនស្រីនាម</span>
                            <span className="text-base sm:text-lg font-khmer-moul text-amber-300">{brideName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
