import React from 'react';
import { m } from 'framer-motion';
import type { WeddingData } from '../types';

export const AnniversaryInvitation = ({ wedding }: { wedding: WeddingData }) => {
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

    const groomFatherName = groomFather || "កាប់ វណ្ណា";
    const groomMotherName = groomMother || "សេង ផល្លា";
    const brideFatherName = brideFather || "មាស សុផល";
    const brideMotherName = brideMother || "ចាន់ ធីតា";

    return (
        <section className="py-12 px-4 bg-[#FAF7F2] text-slate-800 font-kantumruy relative overflow-hidden" id="invitation">
            <div className="max-w-xl mx-auto">
                {/* Royal Invitation Card Frame */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200/80 shadow-[0_12px_40px_rgba(76,29,149,0.07)] text-center space-y-6"
                >
                    {/* Top Ornamental Header */}
                    <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-normal">
                            — សំបុត្រគោរពអញ្ជើញ —
                        </span>
                        <h2 className="text-xl sm:text-2xl font-khmer-moul text-[#3B0764] leading-relaxed">
                            {headerGreeting}
                        </h2>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
                    </div>

                    {/* Parents Section - 2 Columns Side by Side */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                        {/* Groom's Parents */}
                        <div className="space-y-1 p-3.5 sm:p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-center">
                            <p className="text-[11px] sm:text-xs font-bold text-purple-800 font-kantumruy pb-0.5">
                                លោកមេបាខាងប្រុស
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                {groomFatherName}
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                {groomMotherName}
                            </p>
                        </div>

                        {/* Bride's Parents */}
                        <div className="space-y-1 p-3.5 sm:p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-center">
                            <p className="text-[11px] sm:text-xs font-bold text-purple-800 font-kantumruy pb-0.5">
                                លោកមេបាខាងស្រី
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                {brideFatherName}
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                {brideMotherName}
                            </p>
                        </div>
                    </div>

                    {/* Honorific Greeting Card */}
                    <div className="p-4 sm:p-5 bg-purple-50/60 rounded-2xl border border-purple-100/80 text-center space-y-2">
                        <p className="text-xs font-bold text-purple-700 font-kantumruy">
                            សូមគោរពអញ្ជើញ
                        </p>
                        <h4 className="font-khmer-moul text-sm sm:text-base text-[#3B0764] leading-relaxed">
                            {wedding.guestName || "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា"}
                        </h4>
                        <p className="text-xs text-slate-600 font-kantumruy leading-relaxed pt-1">
                            ចូលរួមជាអធិបតី និងជាសាក្សី ដើម្បីប្រសិទ្ធពរជ័យសិរីសួស្តី ជ័យមង្គល ក្នុងពិធីភ្ជាប់ពាក្យកូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ
                        </p>
                    </div>

                    {/* Couple Official Names */}
                    <div className="py-3 border-y border-purple-100 my-1">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-1">
                            {/* Groom */}
                            <div className="text-center min-w-0">
                                <span className="text-[11px] font-bold text-purple-700 block font-kantumruy mb-1">
                                    កូនប្រុសនាម
                                </span>
                                <h3 className="font-khmer-moul text-xs sm:text-sm md:text-base text-slate-900 leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                    {groomName}
                                </h3>
                            </div>

                            {/* Center Connector */}
                            <div className="text-[11px] font-khmer-moul text-amber-700 px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-400/40 select-none">
                                ជាគូនឹង
                            </div>

                            {/* Bride */}
                            <div className="text-center min-w-0">
                                <span className="text-[11px] font-bold text-purple-700 block font-kantumruy mb-1">
                                    កូនស្រីនាម
                                </span>
                                <h3 className="font-khmer-moul text-xs sm:text-sm md:text-base text-slate-900 leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                    {brideName}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Warm closing note */}
                    <p className="text-xs text-slate-600 font-kantumruy leading-relaxed pt-1">
                        វត្តមានដ៏ឧត្តុង្គឧត្តមរបស់លោកអ្នក គឺជាកិត្តិយសដ៏ធំធេង និងជាសិរីមង្គលដ៏ប្រសើរសម្រាប់គ្រួសារយើងខ្ញុំទាំងពីរ។
                    </p>
                </m.div>
            </div>
        </section>
    );
};
