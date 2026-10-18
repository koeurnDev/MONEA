import React from 'react';
import { m } from 'framer-motion';
import type { WeddingData } from '../types';
import { getContrastingTextColor } from "@/lib/color-contrast";
import { getTemplatePaperStyles } from "@/lib/template-color-palette";
import { OneLineName } from "../shared/OneLineName";

export const AnniversaryInvitation = ({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) => {
    const { 
        groomName, 
        brideName, 
        groomFather, 
        groomMother, 
        brideFather, 
        brideMother 
    } = wedding;

    const isWedding = wedding.eventType === 'wedding';

    const headerGreeting = isWedding
        ? "សិរីសួស្តី អាពាហ៍ពិពាហ៍"
        : "សិរីសួស្តី ពិធីភ្ជាប់ពាក្យ";

    const groomFatherName = (wedding.themeSettings?.parents?.groomFather || groomFather)?.trim();
    const groomMotherName = (wedding.themeSettings?.parents?.groomMother || groomMother)?.trim();
    const brideFatherName = (wedding.themeSettings?.parents?.brideFather || brideFather)?.trim();
    const brideMotherName = (wedding.themeSettings?.parents?.brideMother || brideMother)?.trim();
    const hasParents = Boolean(groomFatherName || groomMotherName || brideFatherName || brideMotherName);
    const cardColor = getTemplatePaperStyles(
        wedding.themeSettings,
        wedding.themeSettings?.m07CardColor || "#FBF9F5",
    )["--monea-paper-color"];

    return (
        <section className="py-16 px-4 bg-[#F1ECE5] text-[#2D2928] font-kantumruy relative overflow-hidden" id="invitation">
            <div className="max-w-xl mx-auto">
                {/* Royal Invitation Card Frame */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="anniversary-invitation-card relative bg-[#FBF9F5] rounded-[2rem] p-6 sm:p-9 border border-[#CBAF78]/70 shadow-[0_18px_45px_rgba(75,55,40,0.10)] text-center space-y-7"
                    style={{
                        backgroundColor: cardColor,
                        backgroundImage: "var(--monea-paper-texture, url('/khmer-invite-starter-kit/textures/paper-cream.webp'))",
                        backgroundBlendMode: "multiply",
                        backgroundRepeat: "repeat",
                        backgroundSize: "320px 320px",
                        "--anniversary-card-ink": getContrastingTextColor(cardColor),
                    } as React.CSSProperties}
                >
                    {/* Top Ornamental Header */}
                    <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-[#966B4E] uppercase tracking-normal">
                            — សំបុត្រគោរពអញ្ជើញ —
                        </span>
                        <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#633E42] leading-relaxed">
                            {headerGreeting}
                        </h2>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#CBAF78] to-transparent mx-auto" />
                    </div>

                    {/* Parents Section - 2 Columns Side by Side */}
                    {hasParents && <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                        {/* Groom's Parents */}
                        {(groomFatherName || groomMotherName) && <div className="space-y-1 p-3.5 sm:p-4 rounded-2xl bg-[#F0E3D1]/45 border border-[#D9C6AA] flex flex-col justify-center">
                            <p className="text-[11px] sm:text-xs font-bold text-[#966B4E] font-kantumruy pb-0.5">មាតាបិតាខាងប្រុស</p>
                            {groomFatherName && <p className="text-xs sm:text-sm font-semibold text-slate-800">ឪពុក៖ {groomFatherName}</p>}
                            {groomMotherName && <p className="text-xs sm:text-sm font-semibold text-slate-800">ម្តាយ៖ {groomMotherName}</p>}
                        </div>}

                        {/* Bride's Parents */}
                        {(brideFatherName || brideMotherName) && <div className={`space-y-1 p-3.5 sm:p-4 rounded-2xl bg-[#F0E3D1]/45 border border-[#D9C6AA] flex flex-col justify-center ${!groomFatherName && !groomMotherName ? "col-start-2" : ""}`}>
                            <p className="text-[11px] sm:text-xs font-bold text-[#966B4E] font-kantumruy pb-0.5">មាតាបិតាខាងស្រី</p>
                            {brideFatherName && <p className="text-xs sm:text-sm font-semibold text-slate-800">ឪពុក៖ {brideFatherName}</p>}
                            {brideMotherName && <p className="text-xs sm:text-sm font-semibold text-slate-800">ម្តាយ៖ {brideMotherName}</p>}
                        </div>}
                    </div>}

                    {/* Honorific Greeting Card */}
                    <div className="mx-auto max-w-md rounded-2xl border border-[#D9C6AA] bg-[#F0E3D1]/55 p-5 text-center sm:p-6">
                        <p className="font-kantumruy text-xs font-bold tracking-wide text-[#966B4E]">
                            សូមគោរពអញ្ជើញ
                        </p>
                        <h4 className="mx-auto mt-2 max-w-sm font-khmer-moul text-sm leading-loose text-[#633E42] sm:text-base">
                            {guestName || wedding.guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា"}
                        </h4>
                        <p className="mx-auto mt-3 max-w-sm font-kantumruy text-sm leading-[2] text-slate-700">
                            ចូលរួមជាអធិបតី និងជាសាក្សី ដើម្បីប្រសិទ្ធពរជ័យសិរីសួស្តី ជ័យមង្គល ក្នុងពិធីភ្ជាប់ពាក្យកូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ
                        </p>
                    </div>

                    {/* Couple Official Names */}
                    <div className="py-3 border-y border-[#D9C6AA] my-1">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-1">
                            {/* Groom */}
                            <div className="text-center min-w-0">
                                <span className="text-[11px] font-bold text-[#966B4E] block font-kantumruy mb-1">
                                    កូនប្រុសនាម
                                </span>
                                <h3 className="font-khmer-moul text-xs sm:text-sm md:text-base text-slate-900 leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                    <OneLineName name={groomName} />
                                </h3>
                            </div>

                            {/* Center Connector */}
                            <div className="text-[11px] font-khmer-moul text-amber-700 px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-400/40 select-none">
                                ជាគូនឹង
                            </div>

                            {/* Bride */}
                            <div className="text-center min-w-0">
                                <span className="text-[11px] font-bold text-[#966B4E] block font-kantumruy mb-1">
                                    កូនស្រីនាម
                                </span>
                                <h3 className="font-khmer-moul text-xs sm:text-sm md:text-base text-slate-900 leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                    <OneLineName name={brideName} />
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Warm closing note */}
                    <p className="mx-auto max-w-sm pt-1 font-kantumruy text-sm leading-[2] text-slate-700">
                        វត្តមានដ៏ឧត្តុង្គឧត្តមរបស់លោកអ្នក គឺជាកិត្តិយសដ៏ធំធេង និងជាសិរីមង្គលដ៏ប្រសើរសម្រាប់គ្រួសារយើងខ្ញុំទាំងពីរ។
                    </p>
                </m.div>
            </div>
            <style>{`
                .anniversary-invitation-card h2,
                .anniversary-invitation-card h3,
                .anniversary-invitation-card h4,
                .anniversary-invitation-card p,
                .anniversary-invitation-card span { color: var(--anniversary-card-ink) !important; }
            `}</style>
        </section>
    );
};
