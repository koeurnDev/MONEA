import * as React from "react";
import { WeddingData } from "../types";
import { RevealSection } from '../shared/CinematicComponents';
import { useTranslation } from "@/i18n/LanguageProvider";

export function KhmerInvitation({
    wedding,
    smartColors
}: {
    wedding: WeddingData;
    smartColors: { primary: string; secondary: string; dark: string };
}) {
    const { t } = useTranslation();
    const isAnniversary = wedding.eventType === 'anniversary';

    const groomFather = wedding.themeSettings?.parents?.groomFather ?? wedding.groomFather;
    const groomMother = wedding.themeSettings?.parents?.groomMother ?? wedding.groomMother;
    const brideFather = wedding.themeSettings?.parents?.brideFather ?? wedding.brideFather;
    const brideMother = wedding.themeSettings?.parents?.brideMother ?? wedding.brideMother;

    const toKhmerNum = (num: number | string) => {
        const khmerNumbers = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
        return num.toString().split('').map(digit => {
            const d = parseInt(digit);
            return isNaN(d) ? digit : khmerNumbers[d];
        }).join('');
    };

    const formattedKhmerDate = React.useMemo(() => {
        if (!wedding.date) return "";
        try {
            const d = new Date(wedding.date);
            if (isNaN(d.getTime())) return "";
            const khmerDays = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
            const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
            
            const dayName = khmerDays[d.getDay()];
            const day = toKhmerNum(d.getDate());
            const month = khmerMonths[d.getMonth()];
            const year = toKhmerNum(d.getFullYear());
            
            return `ថ្ងៃ${dayName} ទី${day} ខែ${month} ឆ្នាំ${year}`;
        } catch {
            return "";
        }
    }, [wedding.date]);

    const titleText = wedding.themeSettings?.customLabels?.invitationTitle || 
                      (isAnniversary ? "សិរីមង្គលពិធីភ្ជាប់ពាក្យ" : "សិរីមង្គលអាពាហ៍ពិពាហ៍");

    const honorText = wedding.themeSettings?.customLabels?.invitationHonorTitle || "មានកិត្តិយសសូមគោរពអញ្ជើញ";

    const bodyText = wedding.themeSettings?.customLabels?.invitationBody || 
        "ឯកឧត្តម ឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា និងប្រិយមិត្តអញ្ជើញចូលរួមជាអធិបតីនិងជាភ្ញៀវកិត្តិយសដើម្បីប្រសិទ្ធពរជ័យសិរីសួស្តីជ័យមង្គលក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍ កូនប្រុស / កូនស្រី របស់យើងខ្ញុំ";

    return (
        <section id="invitation-khmer" className="py-12 md:py-20 px-4 sm:px-6 text-center bg-white relative overflow-hidden font-kantumruy w-full max-w-full">
            {/* Background subtle luxury watermark */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)] pointer-events-none" />

            <div className="max-w-3xl mx-auto space-y-8 md:space-y-12 relative z-10">
                <RevealSection>
                    {/* 1. Header Title */}
                    <div className="space-y-3 mb-8 md:mb-12">
                        <div className="flex items-center justify-center gap-3">
                            <span className="w-10 h-[1.5px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
                            <span className="font-kantumruy text-[11px] sm:text-xs text-[#805C00] tracking-wide font-bold">
                                {wedding.themeSettings?.customLabels?.invitationBadge || "សិរីសួស្ដីជ័យមង្គល"}
                            </span>
                            <span className="w-10 h-[1.5px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
                        </div>
                        <h2 className="font-khmer-moul text-2xl sm:text-3xl md:text-5xl text-gold-gradient text-gold-embossed tracking-wide leading-relaxed py-1">
                            {titleText}
                        </h2>
                    </div>

                    {/* 2. Parents of Groom & Bride (Traditional 2-Column Format) */}
                    {(groomFather?.trim() || groomMother?.trim() || brideFather?.trim() || brideMother?.trim()) && (
                    <div className="grid grid-cols-2 gap-4 sm:gap-10 max-w-2xl mx-auto mb-8 md:mb-12 text-left">
                        {/* Groom Parents */}
                        {(groomFather?.trim() || groomMother?.trim()) && (
                            <div className="space-y-2.5 flex flex-col items-center sm:items-start rounded-2xl border border-[#D4AF37]/25 bg-[#FAF7F0] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.02)]">
                                {groomFather?.trim() && (
                                    <div className="flex items-center gap-2 sm:gap-3 w-full justify-center sm:justify-start">
                                        <span className="font-khmer-moul text-[11px] sm:text-xs text-gold-gradient min-w-[55px] sm:min-w-[65px] text-right sm:text-left">ឪពុក</span>
                                        <span className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed font-bold">{groomFather.trim()}</span>
                                    </div>
                                )}
                                {groomMother?.trim() && (
                                    <div className="flex items-center gap-2 sm:gap-3 w-full justify-center sm:justify-start">
                                        <span className="font-khmer-moul text-[11px] sm:text-xs text-gold-gradient min-w-[55px] sm:min-w-[65px] text-right sm:text-left">ម្ដាយ</span>
                                        <span className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed font-bold">{groomMother.trim()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bride Parents */}
                        {(brideFather?.trim() || brideMother?.trim()) && (
                            <div className={`space-y-2.5 flex flex-col items-center sm:items-end rounded-2xl border border-[#D4AF37]/25 bg-[#FAF7F0] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.02)] ${!groomFather?.trim() && !groomMother?.trim() ? "col-start-2" : ""}`}>
                                {brideFather?.trim() && (
                                    <div className="flex items-center gap-2 sm:gap-3 w-full justify-center sm:justify-end">
                                        <span className="font-khmer-moul text-[11px] sm:text-xs text-gold-gradient min-w-[55px] sm:min-w-[65px] text-right">ឪពុក</span>
                                        <span className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed font-bold">{brideFather.trim()}</span>
                                    </div>
                                )}
                                {brideMother?.trim() && (
                                    <div className="flex items-center gap-2 sm:gap-3 w-full justify-center sm:justify-end">
                                        <span className="font-khmer-moul text-[11px] sm:text-xs text-gold-gradient min-w-[55px] sm:min-w-[65px] text-right">ម្ដាយ</span>
                                        <span className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed font-bold">{brideMother.trim()}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    )}

                    {/* 3. Honorific Greeting & Invitation Text */}
                    <div className="space-y-4 max-w-2xl mx-auto my-8 md:my-12">
                        <h3 className="font-khmer-moul text-sm sm:text-base md:text-xl text-gold-gradient text-gold-embossed leading-relaxed">
                            {honorText}
                        </h3>
                        <p className="font-kantumruy text-xs sm:text-sm md:text-base leading-[2.2] sm:leading-[2.6] text-slate-700 font-medium px-2 sm:px-6">
                            {bodyText}
                        </p>
                    </div>

                    {/* 4. Couple Official Names (កូនប្រុសនាម ... ជាគូនឹង ... កូនស្រីនាម) */}
                    {wedding.themeSettings?.customMonogramUrl ? (
                        <div className="flex justify-center items-center max-w-2xl mx-auto py-8 my-4 border-y border-[#D4AF37]/25">
                            <img 
                                src={wedding.themeSettings.customMonogramUrl} 
                                alt={`${wedding.groomName} and ${wedding.brideName}`} 
                                className="h-16 sm:h-20 md:h-24 w-auto object-contain"
                                style={{ 
                                    transform: `scale(${(wedding.themeSettings.customMonogramScale || 100) / 100}) translateY(${wedding.themeSettings.customMonogramY || 0}px)`,
                                    filter: `drop-shadow(${wedding.themeSettings.customMonogramDropShadow || '0px 2px 4px rgba(0,0,0,0.5)'})` 
                                }}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6 max-w-2xl mx-auto py-6 my-4 border-y border-[#D4AF37]/25">
                        {/* Groom */}
                        <div className="flex flex-col items-center text-center space-y-1">
                            <span className="font-kantumruy text-[11px] sm:text-xs text-[#805C00] font-bold">
                                កូនប្រុសនាម
                            </span>
                            <h3 className="font-khmer-moul text-sm sm:text-lg md:text-2xl text-gold-gradient text-gold-embossed tracking-wide leading-snug">
                                {wedding.groomName}
                            </h3>
                        </div>

                        {/* Center Bridge */}
                        <div className="flex flex-col items-center justify-center px-1 sm:px-4">
                            <span className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed whitespace-nowrap">
                                ជាគូនឹង
                            </span>
                        </div>

                        {/* Bride */}
                        <div className="flex flex-col items-center text-center space-y-1">
                            <span className="font-kantumruy text-[11px] sm:text-xs text-[#805C00] font-bold">
                                កូនស្រីនាម
                            </span>
                            <h3 className="font-khmer-moul text-sm sm:text-lg md:text-2xl text-gold-gradient text-gold-embossed tracking-wide leading-snug">
                                {wedding.brideName}
                            </h3>
                        </div>
                    </div>
                )}

                    {/* 5. Reception Details (ដែលនឹងពិសាភោជនាហារនៅ...) */}
                    <div className="space-y-3 pt-6 max-w-2xl mx-auto">
                        <h4 className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed leading-relaxed">
                            {wedding.themeSettings?.customLabels?.receptionTitle || "ដែលនឹងពិសាភោជនាហារនៅ"}
                        </h4>
                        
                        <div className="space-y-1.5 font-kantumruy text-xs sm:text-sm md:text-base text-slate-700 leading-[2.2] sm:leading-[2.5] font-normal px-2">
                            {wedding.themeSettings?.lunarDate && (
                                <p className="text-[#805C00] font-medium">
                                    {wedding.themeSettings.lunarDate} ត្រូវនឹង
                                </p>
                            )}
                            <p className="break-words whitespace-normal leading-relaxed">
                                {formattedKhmerDate}<br />
                                {wedding.time ? `វេលាម៉ោង ${wedding.time}` : "វេលាម៉ោង ៤:០០ រសៀល"} ស្ថិតនៅ
                            </p>
                            <p className="font-medium text-slate-800">
                                {wedding.location || "គេហដ្ឋានខាងស្រី"} {wedding.themeSettings?.customLabels?.receptionClosing || "ដោយមេត្រីភាព។"}
                            </p>
                        </div>

                        {/* 6. Closing (សូមអរគុណ!) */}
                        <div className="pt-4">
                            <p className="font-khmer-moul text-xs sm:text-sm text-gold-gradient text-gold-embossed tracking-wide">
                                {wedding.themeSettings?.customLabels?.invitationThankYou || "សូមអរគុណ!"}
                            </p>
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}
