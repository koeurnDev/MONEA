import * as React from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { RevealSection } from '../shared/CinematicComponents';

export function KhmerInvitation({
    wedding,
    smartColors
}: {
    wedding: WeddingData;
    smartColors: { primary: string; secondary: string; dark: string };
}) {
    const isAnniversary = wedding.eventType === 'anniversary';

    return (
        <>
            <section id="invitation-khmer" className="py-16 md:py-64 px-8 md:px-12 text-center bg-white relative">
                <div className="absolute inset-0 premium-texture opacity-30 pointer-events-none" />

                <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
                    <RevealSection>
                        <div className="space-y-4 mb-12">
                            <div className="text-[12px] tracking-[0.5em] text-gold/60 font-black uppercase italic mb-4">
                                {wedding.themeSettings?.customLabels?.invitationBadge || "ពរជ័យមង្គល"}
                            </div>
                            <h2 className="font-khmer-moul text-2xl md:text-7xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed whitespace-nowrap">
                                {wedding.themeSettings?.customLabels?.invitationTitle || (isAnniversary ? 'មង្គលការខួប' : 'សិរីមង្គលអាពាហ៍ពិពាហ៍')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:gap-16 mb-12 md:mb-16 px-2 md:px-6 relative items-start">
                            <div className="absolute left-1/2 top-2 bottom-2 w-[1px] bg-gold/10 -translate-x-1/2" />
                            
                            {/* Groom Parents */}
                            <div className="space-y-2 font-khmer-m1 text-[15px] md:text-[18px] font-bold text-gray-700 leading-tight flex flex-col items-center">
                                <p className="font-khmer-moul-pali text-gold/50 text-[10px] uppercase tracking-[0.5em] font-black border-b border-gold/5 pb-2 inline-block h-8 flex items-end whitespace-nowrap">
                                    {isAnniversary ? "មាតាបិតាខាងស្វាមី" : "មាតាបិតាខាងកូនប្រុស"}
                                </p>
                                <div className="space-y-0.5 pt-2">
                                    <p>{wedding.themeSettings?.parents?.groomFather ? `លោក ${wedding.themeSettings.parents.groomFather}` : ""}</p>
                                    <p>{wedding.themeSettings?.parents?.groomMother ? `អ្នកស្រី ${wedding.themeSettings.parents.groomMother}` : ""}</p>
                                </div>
                            </div>

                            {/* Bride Parents */}
                            <div className="space-y-2 font-khmer-m1 text-[15px] md:text-[18px] font-bold text-gray-700 leading-tight flex flex-col items-center">
                                <p className="font-khmer-moul-pali text-gold/50 text-[10px] uppercase tracking-[0.5em] font-black border-b border-gold/5 pb-2 inline-block h-8 flex items-end whitespace-nowrap">
                                    {isAnniversary ? "មាតាបិតាខាងភរិយា" : "មាតាបិតាខាងកូនស្រី"}
                                </p>
                                <div className="space-y-0.5 pt-2">
                                    <p>{wedding.themeSettings?.parents?.brideFather ? `លោក ${wedding.themeSettings.parents.brideFather}` : ""}</p>
                                    <p>{wedding.themeSettings?.parents?.brideMother ? `អ្នកស្រី ${wedding.themeSettings.parents.brideMother}` : ""}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative py-12 md:py-20 px-6 overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 md:w-64 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                            
                            <div className="space-y-8">
                                <h3 className="font-khmer-os-moul-light text-gold-gradient text-gold-embossed text-base md:text-2xl tracking-[0.2em] whitespace-nowrap">
                                    {wedding.themeSettings?.customLabels?.invitationHonorTitle || "សូមគោរពអញ្ជើញ"}
                                </h3>
                                <p className="font-khmer-moul-pali text-[18px] md:text-[20px] leading-[2.2] text-gray-700 max-w-[800px] mx-auto text-center italic font-medium px-4">
                                    {isAnniversary ? (
                                        <>ឯកឧត្តម អ្នកឧកញ៉ា ឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា និងញាតិមិត្តជិតឆ្ងាយទាំងអស់ អញ្ជើញចូលរួមជាអធិបតី និងពិសាភោជនាហារ ដើម្បីផ្តល់សក្ខីភាព ដ៏ខ្ពង់ខ្ពស់ ក្នុងពិធីខួបអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ</>
                                    ) : (
                                        <>ឯកឧត្តម អ្នកឧកញ៉ា ឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា និងញាតិមិត្តជិតឆ្ងាយទាំងអស់ អញ្ជើញចូលរួមជាអធិបតី និងពិសាភោជនាហារ ដើម្បីផ្តល់សក្ខីភាព ដ៏ខ្ពង់ខ្ពស់ ក្នុងពិធីអាពាហ៍ពិពាហ៍របស់កូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ</>
                                    )}
                                </p>
                            </div>

                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 md:w-64 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                            <div className="absolute inset-0 bg-gold/[0.02] -z-10" />
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-16 relative z-10">
                            <div className="space-y-6">
                                <div className="font-khmer-moul-pali text-[11px] tracking-[0.4em] text-gold/50 uppercase font-black">
                                    {isAnniversary ? "ស្វាមី" : "កូនប្រុស"}
                                </div>
                                <p className="font-khmer-m1 text-xl md:text-3xl text-gold-gradient text-gold-embossed tracking-wider">{wedding.groomName}</p>
                                <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent w-32 mx-auto" />
                            </div>
                            <div className="space-y-6">
                                <div className="font-khmer-moul-pali text-[11px] tracking-[0.4em] text-gold/50 uppercase font-black">
                                    {isAnniversary ? "ភរិយា" : "កូនស្រី"}
                                </div>
                                <p className="font-khmer-m1 text-xl md:text-3xl text-gold-gradient text-gold-embossed tracking-wider">{wedding.brideName}</p>
                                <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent w-32 mx-auto" />
                            </div>
                        </div>

                        {/* Reception Details Below Names */}
                        <div className="pt-16 pb-8 space-y-4">
                            <h4 className="font-khmer-moul-pali text-xl md:text-2xl text-gold-gradient text-gold-embossed">ពិសាភោជនាហារ</h4>
                            <div className="font-khmer-moul-pali text-[16px] md:text-[18px] text-gray-700 leading-[2.4] max-w-[650px] mx-auto whitespace-pre-line px-4">
                                ដែលនឹងប្រព្រឹត្តទៅនៅថ្ងៃ ពុធ ទី០៧ ខែ មេសា ឆ្នាំ២០២៦<br />
                                ត្រូវនឹងថ្ងៃ ១២កើត ខែមាខ ឆ្នាំជូត សំរឹទ្ធិស័ក ព. ស ២៥៥២ វេលាម៉ោង ៤:០០ រសៀល នៅគេហដ្ឋានខាងស្រី ភូមិក្រាំងអាត់ ឃុំកំពង់សីលា ស្រុកកំពង់សីលា ខេត្តព្រះសីហនុ ដោយមេត្រីភាព ។ សូមអរគុណ!
                            </div>
                        </div>

                    </RevealSection>
                </div>
            </section>
        </>
    );
}
