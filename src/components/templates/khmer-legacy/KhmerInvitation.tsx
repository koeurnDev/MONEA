import * as React from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { m } from 'framer-motion';
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
    const { t, locale } = useTranslation();
    const isAnniversary = wedding.eventType === 'anniversary';

    return (
        <>
            <section id="invitation-khmer" className="py-16 md:py-32 px-8 md:px-12 text-center bg-white relative overflow-hidden">
                {/* Cinematic Background Elements */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,_rgba(177,147,86,0.05)_0%,_transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 premium-texture opacity-20 pointer-events-none" />

                <div className="max-w-6xl mx-auto space-y-12 md:space-y-20 relative z-10">
                    <RevealSection>
                        <div className="space-y-8 mb-12 md:mb-20">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[1em] text-gold-main/80 font-black uppercase italic leading-relaxed">
                                    {wedding.themeSettings?.customLabels?.invitationBadge || t("template.khmerLegacy.invitationBadge")}
                                </div>
                                <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent" />
                            </div>
                            <h2 className="font-khmer-moul text-3xl md:text-8xl text-gold-gradient text-gold-embossed tracking-wider leading-relaxed">
                                {wedding.themeSettings?.customLabels?.invitationTitle || t("template.khmerLegacy.invitationTitle")}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-20 px-4 md:px-12 relative items-start">
                            <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-gradient-to-b from-transparent via-gold-main/20 to-transparent -translate-x-1/2" />
                            
                            {/* Groom Parents */}
                            <div className="space-y-4 flex flex-col items-center group">
                                <p className="font-khmer-moul text-gold-main/60 text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.6em] font-black pb-4 border-b border-gold-main/10 flex items-center justify-center h-10 transition-colors group-hover:text-gold-main leading-relaxed">
                                    {t("template.khmerLegacy.parentsGroom")}
                                </p>
                                <div className="space-y-2 pt-4 font-khmer-m1 text-lg md:text-2xl font-black text-slate-800 leading-tight">
                                    <p className="hover:text-gold-main transition-colors">{wedding.themeSettings?.parents?.groomFather ? (locale === 'km' ? `លោក ${wedding.themeSettings.parents.groomFather}` : `Mr. ${wedding.themeSettings.parents.groomFather}`) : ""}</p>
                                    <p className="hover:text-gold-main transition-colors">{wedding.themeSettings?.parents?.groomMother ? (locale === 'km' ? `អ្នកស្រី ${wedding.themeSettings.parents.groomMother}` : `Mrs. ${wedding.themeSettings.parents.groomMother}`) : ""}</p>
                                </div>
                            </div>

                            {/* Bride Parents */}
                            <div className="space-y-4 flex flex-col items-center group">
                                <p className="font-khmer-moul text-gold-main/60 text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.6em] font-black pb-4 border-b border-gold-main/10 flex items-center justify-center h-10 transition-colors group-hover:text-gold-main leading-relaxed">
                                    {t("template.khmerLegacy.parentsBride")}
                                </p>
                                <div className="space-y-2 pt-4 font-khmer-m1 text-lg md:text-2xl font-black text-slate-800 leading-tight">
                                    <p className="hover:text-gold-main transition-colors">{wedding.themeSettings?.parents?.brideFather ? (locale === 'km' ? `លោក ${wedding.themeSettings.parents.brideFather}` : `Mr. ${wedding.themeSettings.parents.brideFather}`) : ""}</p>
                                    <p className="hover:text-gold-main transition-colors">{wedding.themeSettings?.parents?.brideMother ? (locale === 'km' ? `អ្នកស្រី ${wedding.themeSettings.parents.brideMother}` : `Mrs. ${wedding.themeSettings.parents.brideMother}`) : ""}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative py-12 md:py-20 px-10 md:px-24 overflow-hidden rounded-[4rem] group">
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm border border-slate-100/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] rounded-[4rem]" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 md:w-96 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/40 to-transparent z-20" />
                            
                            <div className="space-y-12 relative z-10">
                                <h3 className="font-khmer-moul text-gold-gradient text-gold-embossed text-base md:text-3xl tracking-[0.1em] md:tracking-[0.3em] font-black leading-relaxed">
                                    {wedding.themeSettings?.customLabels?.invitationHonorTitle || t("template.khmerLegacy.invitationHonorTitle")}
                                </h3>
                                <p className="font-khmer-content text-lg md:text-3xl leading-[2.2] md:leading-[2.5] text-slate-700 max-w-[900px] mx-auto text-center italic font-black px-4 md:px-10">
                                    {t("template.khmerLegacy.invitationBody")}
                                </p>
                            </div>

                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 md:w-96 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/40 to-transparent z-20" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(177,147,86,0.03)_0%,_transparent_70%)] -z-10" />
                        </div>

                        <div className="grid grid-cols-2 gap-12 md:gap-24 pt-16 md:pt-24 relative z-10">
                            <div className="space-y-8 group transition-transform hover:-translate-y-2 duration-700">
                                <div className="font-khmer-moul text-[9px] md:text-xs tracking-[0.2em] md:tracking-[0.8em] text-gold-main/80 uppercase font-black group-hover:text-gold-main transition-colors leading-relaxed">
                                    {t("template.khmerLegacy.groomTitle")}
                                </div>
                                <p className="font-khmer-m1 text-3xl md:text-6xl text-gold-gradient text-gold-embossed tracking-wider font-black">{wedding.groomName}</p>
                                <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent w-40 mx-auto group-hover:w-56 transition-all duration-700" />
                            </div>
                            <div className="space-y-8 group transition-transform hover:-translate-y-2 duration-700">
                                <div className="font-khmer-moul text-[9px] md:text-xs tracking-[0.2em] md:tracking-[0.8em] text-gold-main/80 uppercase font-black group-hover:text-gold-main transition-colors leading-relaxed">
                                    {t("template.khmerLegacy.brideTitle")}
                                </div>
                                <p className="font-khmer-m1 text-3xl md:text-6xl text-gold-gradient text-gold-embossed tracking-wider font-black">{wedding.brideName}</p>
                                <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-main/30 to-transparent w-40 mx-auto group-hover:w-56 transition-all duration-700" />
                            </div>
                        </div>

                        {/* Reception Details Below Names */}
                        <div className="pt-16 md:pt-24 pb-12 space-y-10">
                            <div className="flex flex-col items-center space-y-6">
                                <div className="w-12 h-[1.5px] bg-gold-main/30" />
                                <h4 className="font-khmer-moul text-xl md:text-4xl text-gold-gradient text-gold-embossed tracking-wider md:tracking-widest font-black uppercase leading-relaxed">
                                    {t("template.khmerLegacy.receptionTitle")}
                                </h4>
                                <div className="w-12 h-[1.5px] bg-gold-main/30" />
                            </div>
                            <div className="font-khmer-content text-lg md:text-2xl text-slate-600 leading-[2.6] max-w-[800px] mx-auto whitespace-pre-line px-10 italic font-black">
                                {t("template.khmerLegacy.receptionBody", {
                                    date: new Date(wedding.date).toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
                                    khmerDate: wedding.themeSettings?.lunarDate || (locale === 'km' ? "ថ្ងៃសិរីសួស្តី" : "Auspicious Day"),
                                    time: wedding.time || (locale === 'km' ? "៤:០០ រសៀល" : "4:00 PM"),
                                    location: wedding.location || (locale === 'km' ? "គេហដ្ឋានខាងស្រី" : "the Bride's House")
                                })}
                            </div>
                        </div>

                    </RevealSection>
                </div>
            </section>
        </>
    );
}
