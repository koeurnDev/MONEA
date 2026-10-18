import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { TemplateProps } from './types';
import { Volume2, VolumeX } from 'lucide-react';

import { AnniversaryHero } from './anniversary-elegant/AnniversaryHero';
import { AnniversaryInvitation } from './anniversary-elegant/AnniversaryInvitation';
import { AnniversaryStory } from './anniversary-elegant/AnniversaryStory';
import { AnniversaryCountdown } from './anniversary-elegant/AnniversaryCountdown';
import AnniversarySchedule from './anniversary-elegant/AnniversarySchedule';
import AnniversaryGallery from './anniversary-elegant/AnniversaryGallery';
import AnniversaryLocation from './anniversary-elegant/AnniversaryLocation';
import { AnniversaryGift } from './anniversary-elegant/AnniversaryGift';
import { AnniversaryThankYou } from './anniversary-elegant/AnniversaryThankYou';
import { getTemplatePaletteStyles } from "@/lib/template-color-palette";
import { isSectionVisible } from "./shared/template-settings";
import { GuestbookSection } from "./shared/GuestbookSection";
import { CoupleNamesLine, OneLineName } from "./shared/OneLineName";

export default function AnniversaryElegant({ wedding, guestName, config }: TemplateProps) {
    const { groomName, brideName } = wedding;
    const [revealed, setRevealed] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const revealTimerRef = useRef<number | null>(null);
    const shouldReduceMotion = useReducedMotion();

    const primaryColor = wedding.themeSettings?.primaryColor || "#8B4B55";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const isWedding = wedding.eventType === 'wedding';

    const entranceHeader = isWedding 
        ? "— សិរីមង្គលអាពាហ៍ពិពាហ៍ —" 
        : "— សិរីមង្គលភ្ជាប់ពាក្យ —";

    // Support for dashboard force reveal
    useEffect(() => {
        const handleForceReveal = () => {
            if (revealTimerRef.current !== null) {
                window.clearTimeout(revealTimerRef.current);
            }
            setIsOpening(false);
            setRevealed(true);
        };
        window.addEventListener('FORCE_REVEAL', handleForceReveal);
        return () => {
            window.removeEventListener('FORCE_REVEAL', handleForceReveal);
            if (revealTimerRef.current !== null) {
                window.clearTimeout(revealTimerRef.current);
            }
        };
    }, []);

    // Direct User Gesture Audio Playback (iOS Safari & Android Chrome Autoplay policy)
    const handleOpenEnvelope = () => {
        if (isOpening || revealed) return;

        setIsPlaying(true);
        if (musicUrl && audioRef.current) {
            audioRef.current.play().catch((err) => {
                console.log("Autoplay blocked by browser policy:", err);
            });
        }

        if (shouldReduceMotion) {
            setRevealed(true);
            window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
            return;
        }

        setIsOpening(true);
        revealTimerRef.current = window.setTimeout(() => {
            setRevealed(true);
            window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
        }, 1200);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    };

    return (
        <div 
            style={getTemplatePaletteStyles(wedding.themeSettings, "#8B4B55", "#F1ECE5")}
            className="monea-full-palette monea-paper-canvas khmer-readable-type-system w-full bg-[#F1ECE5] font-kantumruy text-[#2D2928] relative min-h-screen selection:bg-[var(--primary)] selection:text-white"
        >
            {/* Background Audio */}
            {musicUrl && (
                <audio ref={audioRef} id="bg-music" src={musicUrl} loop preload="none" />
            )}

            {/* Entrance Cover / Reveal Screen */}
            <AnimatePresence>
                {!revealed && (
                    <m.div 
                        initial={{ opacity: 1 }}
                        exit={shouldReduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
                        transition={{ duration: shouldReduceMotion ? 0.01 : 0.65, ease: [0.76, 0, 0.24, 1] }}
                        onClick={handleOpenEnvelope}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-[#3B1720] px-6 py-8 text-center text-[#F3E8D0] cursor-pointer"
                        style={{
                            isolation: "isolate",
                            paddingTop: "max(2rem, env(safe-area-inset-top))",
                            paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
                        }}
                    >
                        <svg
                            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                            viewBox="0 0 390 844"
                            preserveAspectRatio="xMidYMid slice"
                            aria-hidden="true"
                        >
                            <defs>
                                <radialGradient id="m07-envelope-paper" cx="50%" cy="45%" r="75%">
                                    <stop offset="0%" stopColor="#54232D" />
                                    <stop offset="100%" stopColor="#301018" />
                                </radialGradient>
                                <pattern id="m07-embossed-florals" width="176" height="210" patternUnits="userSpaceOnUse">
                                    <g fill="none" stroke="#8D5961" strokeWidth="1.25" opacity=".42">
                                        <path d="M20 210 C28 161 41 116 70 72 C83 52 99 34 121 16" />
                                        <path d="M39 155 C19 137 14 118 17 101 M52 123 C75 119 88 104 96 88 M69 89 C50 74 48 58 52 43 M88 58 C111 59 124 48 133 33" />
                                        <path d="M16 101 C3 93 4 78 18 69 C32 78 31 93 16 101Z M96 88 C85 77 89 64 104 59 C115 72 109 84 96 88Z M52 43 C39 34 43 20 58 16 C69 29 64 40 52 43Z M133 33 C125 20 132 9 147 9 C154 24 146 33 133 33Z" />
                                        <path d="M108 175 C127 160 143 157 159 163 M24 184 C9 176 5 161 13 149 C29 157 33 171 24 184Z" />
                                        <circle cx="17" cy="84" r="3" /><circle cx="99" cy="74" r="3" />
                                        <circle cx="50" cy="29" r="3" /><circle cx="139" cy="20" r="3" />
                                    </g>
                                    <g fill="none" stroke="#B78388" strokeWidth=".8" opacity=".35">
                                        <path d="M45 65 C34 58 36 49 45 50 C44 40 54 40 55 50 C64 45 69 53 61 60 C69 68 62 75 54 68 C49 77 40 73 45 65Z" />
                                        <circle cx="53" cy="59" r="2.5" />
                                        <path d="M134 145 C123 138 125 129 134 130 C133 120 143 120 144 130 C153 125 158 133 150 140 C158 148 151 155 143 148 C138 157 129 153 134 145Z" />
                                        <circle cx="142" cy="139" r="2.5" />
                                    </g>
                                    <g fill="#A16A72" opacity=".24">
                                        <path d="M17 61 C24 50 30 55 29 64 C40 57 44 64 37 72 C47 73 46 81 34 83 C39 93 31 97 24 87 C17 97 10 92 15 82 C3 82 3 74 14 71 C7 63 11 58 17 61Z" />
                                        <circle cx="24" cy="75" r="3" fill="#D2A77A" />
                                        <path d="M121 106 C128 94 134 99 133 108 C144 101 148 108 141 116 C151 117 150 125 138 127 C143 137 135 141 128 131 C121 141 114 136 119 126 C107 126 107 118 118 115 C111 107 115 102 121 106Z" />
                                        <circle cx="128" cy="120" r="3" fill="#D2A77A" />
                                    </g>
                                </pattern>
                                <linearGradient id="m07-fold-highlight" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#D19AA0" stopOpacity=".2" />
                                    <stop offset="100%" stopColor="#17080C" stopOpacity=".32" />
                                </linearGradient>
                            </defs>
                            <rect width="390" height="844" fill="url(#m07-envelope-paper)" />
                            <rect width="390" height="844" fill="url(#m07-embossed-florals)" />
                            <m.path
                                d="M0 0H390L195 425Z"
                                fill="#4B2029"
                                fillOpacity=".82"
                                stroke="#D5A5A2"
                                strokeOpacity=".32"
                                strokeWidth="1.5"
                                style={{ transformOrigin: "50% 0%" }}
                                initial={false}
                                animate={isOpening
                                    ? { y: -560, rotate: -7, opacity: 0 }
                                    : { y: 0, rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.68, ease: [0.65, 0, 0.35, 1] }}
                            />
                            <m.path
                                d="M8 0L195 412L382 0"
                                fill="none"
                                stroke="#D4A2A0"
                                strokeOpacity=".34"
                                strokeWidth="1"
                                initial={false}
                                animate={isOpening
                                    ? { y: -540, opacity: 0 }
                                    : { y: 0, opacity: 1 }}
                                transition={{ duration: 0.68, ease: [0.65, 0, 0.35, 1] }}
                            />
                            <g fill="none" strokeLinecap="round">
                                <path d="M-12 0 C36 18 14 40 43 54 C72 68 50 91 80 106 C110 121 88 145 120 161 C151 177 128 202 158 220 C188 238 162 263 188 282 C211 300 177 326 196 346 C214 366 182 393 196 422 C182 451 214 478 196 498 C177 518 211 544 188 562 C162 581 188 606 158 624 C128 642 151 667 120 683 C88 699 110 723 80 738 C50 753 72 776 43 790 C14 804 36 826 -12 844" stroke="#1E0A10" strokeWidth="9" opacity=".34" />
                                <path d="M-8 0 C40 18 18 40 47 54 C76 68 54 91 84 106 C114 121 92 145 124 161 C155 177 132 202 162 220 C192 238 166 263 192 282 C215 300 181 326 200 346 C218 366 186 393 200 422 C186 451 218 478 200 498 C181 518 215 544 192 562 C166 581 192 606 162 624 C132 642 155 667 124 683 C92 699 114 723 84 738 C54 753 76 776 47 790 C18 804 40 826 -8 844" stroke="url(#m07-fold-highlight)" strokeWidth="2" />
                                <path d="M-8 0 C40 18 18 40 47 54 C76 68 54 91 84 106 C114 121 92 145 124 161 C155 177 132 202 162 220 C192 238 166 263 192 282 C215 300 181 326 200 346 C218 366 186 393 200 422 C186 451 218 478 200 498 C181 518 215 544 192 562 C166 581 192 606 162 624 C132 642 155 667 124 683 C92 699 114 723 84 738 C54 753 76 776 47 790 C18 804 40 826 -8 844" stroke="#C7959B" strokeWidth="2" strokeDasharray="1 7" opacity=".65" />
                                <path transform="translate(390 0) scale(-1 1)" d="M-12 0 C36 18 14 40 43 54 C72 68 50 91 80 106 C110 121 88 145 120 161 C151 177 128 202 158 220 C188 238 162 263 188 282 C211 300 177 326 196 346 C214 366 182 393 196 422 C182 451 214 478 196 498 C177 518 211 544 188 562 C162 581 188 606 158 624 C128 642 151 667 120 683 C88 699 110 723 80 738 C50 753 72 776 43 790 C14 804 36 826 -12 844" stroke="#1E0A10" strokeWidth="9" opacity=".34" />
                                <path transform="translate(390 0) scale(-1 1)" d="M-8 0 C40 18 18 40 47 54 C76 68 54 91 84 106 C114 121 92 145 124 161 C155 177 132 202 162 220 C192 238 166 263 192 282 C215 300 181 326 200 346 C218 366 186 393 200 422 C186 451 218 478 200 498 C181 518 215 544 192 562 C166 581 192 606 162 624 C132 642 155 667 124 683 C92 699 114 723 84 738 C54 753 76 776 47 790 C18 804 40 826 -8 844" stroke="url(#m07-fold-highlight)" strokeWidth="2" />
                                <path transform="translate(390 0) scale(-1 1)" d="M-8 0 C40 18 18 40 47 54 C76 68 54 91 84 106 C114 121 92 145 124 161 C155 177 132 202 162 220 C192 238 166 263 192 282 C215 300 181 326 200 346 C218 366 186 393 200 422 C186 451 218 478 200 498 C181 518 215 544 192 562 C166 581 192 606 162 624 C132 642 155 667 124 683 C92 699 114 723 84 738 C54 753 76 776 47 790 C18 804 40 826 -8 844" stroke="#C7959B" strokeWidth="2" strokeDasharray="1 7" opacity=".65" />
                            </g>
                            <rect x="12" y="12" width="366" height="820" rx="2" fill="none" stroke="#D2A77A" strokeOpacity=".18" />
                        </svg>

                        <m.div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
                        >
                            <m.div
                            className="flex aspect-[0.7] w-[min(70vw,280px)] flex-col items-center justify-center border border-[#C5A46D] bg-[#F5EBDD] px-5 text-center text-[#633B3D] shadow-[0_18px_50px_rgba(10,3,5,0.55),inset_0_0_0_6px_#F5EBDD,inset_0_0_0_7px_rgba(165,126,75,0.42)]"
                            initial={false}
                            animate={isOpening
                                ? { opacity: 1, scale: 1 }
                                : { opacity: 0, scale: 0.72 }}
                            transition={{ duration: 0.5, delay: isOpening ? 0.32 : 0, ease: [0.2, 0.75, 0.25, 1] }}
                        >
                            <span className="mb-3 text-[10px] tracking-[0.18em] text-[#A27B4D]">សូមគោរពអញ្ជើញ</span>
                            <span className="w-full font-khmer-moul text-[13px] leading-loose text-[#56343A]">
                                <OneLineName name={groomName} />
                                <span className="block text-[10px] text-[#A27B4D]">និង</span>
                                <OneLineName name={brideName} ariaHidden />
                            </span>
                            <span className="my-4 h-px w-12 bg-[#B99766]/70" />
                            <span className="font-kantumruy text-[10px] leading-relaxed text-[#80656A]">
                                សូមអញ្ជើញចូលរួមជាសាក្សី<br />ក្នុងថ្ងៃដ៏មានអត្ថន័យរបស់យើងខ្ញុំ
                            </span>
                            <svg viewBox="0 0 50 20" className="mt-4 h-5 w-12 text-[#A27B4D]" fill="none">
                                <path d="M25 18C26 11 25 6 25 2M25 12C18 11 15 8 14 4C20 4 24 7 25 12ZM26 10C32 9 35 6 36 2C30 2 27 5 26 10Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            </m.div>
                        </m.div>

                        <m.div 
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 pt-2"
                        >
                            <p className="font-khmer-moul text-xs sm:text-sm tracking-[0.16em] text-[#E4C9A0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                                {entranceHeader}
                            </p>
                            <div className="mx-auto mt-3 h-px w-14 bg-gradient-to-r from-transparent via-[#D2A77A]/70 to-transparent" />
                        </m.div>

                        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-5">
                            <m.button
                                type="button"
                                aria-label="ចុចត្រាមាសដើម្បីបើកធៀប"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenEnvelope();
                                }}
                                animate={isOpening
                                    ? { y: -44, scale: 0.42, rotate: 28, opacity: 0 }
                                    : { y: 0, scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.46, ease: [0.2, 0.75, 0.25, 1] }}
                                whileHover={{ scale: 1.04, rotate: -2 }}
                                whileTap={{ scale: 0.94 }}
                                className="group relative grid h-36 w-36 place-items-center rounded-[43%_50%_45%_52%] border border-[#F4D995]/80 bg-[radial-gradient(circle_at_35%_28%,#FFF0C3_0%,#D9B66C_31%,#A77935_60%,#E4C57D_78%,#805425_100%)] shadow-[0_14px_38px_rgba(12,4,7,0.6),inset_0_2px_4px_rgba(255,255,255,0.75),inset_0_-5px_10px_rgba(78,42,14,0.52)]"
                            >
                                <span className="absolute inset-[8px] grid place-items-center rounded-[43%_50%_45%_52%] border border-[#FFF0C3]/75 bg-[radial-gradient(circle_at_40%_30%,#F7E7C0,#C8A25A_68%,#9B7137)] shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-3px_8px_rgba(80,48,15,0.4)]">
                                    <span className="grid h-[82px] w-[82px] place-items-center rounded-full border border-[#805B2B]/45 bg-[#E7D1A5]/70 shadow-[inset_0_0_0_4px_rgba(255,248,224,0.32)]">
                                        <svg viewBox="0 0 64 64" className="h-12 w-12 drop-shadow-[0_1px_1px_rgba(74,46,19,0.4)]" fill="none" aria-hidden="true">
                                            <path d="M31 54C33 42 34 29 32 12M32 39C22 36 17 29 16 22C25 23 31 29 32 39ZM33 31C42 29 47 23 49 16C41 16 35 21 33 31ZM31 47C23 45 19 41 17 35C24 35 29 39 31 47ZM33 22C39 20 42 16 43 11C38 11 34 15 33 22Z" stroke="#80602F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M32 13C28 10 28 6 32 4C36 7 36 10 32 13Z" fill="#B28A4A" stroke="#80602F" strokeWidth="1.3" />
                                            <circle cx="16" cy="21" r="1.5" fill="#A47A3B" /><circle cx="49" cy="15" r="1.5" fill="#A47A3B" />
                                        </svg>
                                    </span>
                                </span>
                                <span className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-[#17080C]/40 blur-sm" />
                            </m.button>

                            <m.div
                                className="max-w-xs space-y-2"
                                animate={isOpening ? { y: 12, opacity: 0 } : { y: 0, opacity: 1 }}
                                transition={{ duration: 0.28, ease: "easeIn" }}
                            >
                                {(groomName || brideName) && (
                                    <h1 className="font-khmer-moul text-base leading-relaxed text-[#F3E8D0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                        <CoupleNamesLine groom={groomName} bride={brideName} />
                                    </h1>
                                )}
                                <p className="font-khmer-moul text-[11px] text-[#D9BDA0]">
                                    {guestName || "សូមគោរពអញ្ជើញ"}
                                </p>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleOpenEnvelope();
                                    }}
                                    className="mt-1 inline-flex items-center justify-center rounded-full border border-[#D2A77A]/55 bg-[#401A23]/75 px-5 py-2 font-khmer-moul text-[11px] text-[#F2DDAF] shadow-[0_5px_18px_rgba(0,0,0,0.22)] transition-colors hover:bg-[#592631]"
                                >
                                    សូមចុចបើកធៀប
                                </button>
                            </m.div>
                        </div>

                        <m.div
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative z-10 pb-1 text-center"
                        >
                            <p className="text-[9px] tracking-[0.12em] text-[#C9A2A4]/75">
                                ចុចត្រាមាស ឬចុចត្រង់ណាក៏បាន
                            </p>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Main Stage Canvas */}
            {revealed && (
            <main className="monea-paper-canvas relative w-full max-w-3xl mx-auto min-h-screen shadow-[0_0_60px_rgba(45,34,30,0.12)] bg-[#F8F5EF] flex flex-col overflow-hidden overflow-x-hidden">
                <AnniversaryHero wedding={wedding} />
                <AnniversaryInvitation wedding={wedding} guestName={guestName} />
                {isSectionVisible(config, "story") && <AnniversaryStory wedding={wedding} />}
                <AnniversaryCountdown wedding={wedding} />
                {isSectionVisible(config, "timeline") && <AnniversarySchedule wedding={wedding} title={config.labels.scheduleTitle} />}
                {isSectionVisible(config, "gallery") && <AnniversaryGallery wedding={wedding} />}
                {isSectionVisible(config, "map") && <AnniversaryLocation wedding={wedding} />}
                {isSectionVisible(config, "gift") && <AnniversaryGift wedding={wedding} />}
                {isSectionVisible(config, "guestbook") && <GuestbookSection wedding={wedding} />}
                <AnniversaryThankYou wedding={wedding} />
            </main>
            )}

            {/* Floating Music Button */}
            {musicUrl && (
                <div className="invitation-floating-control fixed top-[max(1.5rem,env(safe-area-inset-top))] z-40">
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7C783]/70 bg-[#2D2928]/90 text-[#E7C783] shadow-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                        aria-label="Toggle Music"
                    >
                        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </div>
            )}
        </div>
    );
}
