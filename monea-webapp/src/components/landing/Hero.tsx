import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { motion, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Star, Users, Zap } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { AUTH_URLS } from "@/lib/constants";

export function Hero() {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);

    // Mouse tracking for 3D effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });
    const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', checkMobile);
        };
    }, [mouseX, mouseY]);

    return (
        <section
            className="relative w-full overflow-hidden font-kantumruy transition-colors duration-300 bg-gradient-to-br from-[#FFF5F7] via-[#FDF8FF] to-[#FFF8F0] dark:from-[#09090B] dark:via-[#130E1B] dark:to-[#09090B]"
        >
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-rose-400/20 dark:bg-rose-600/15 blur-[130px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-pink-300/20 dark:bg-pink-900/15 blur-[130px]" />
                <div className="absolute top-[30%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-violet-300/10 dark:bg-violet-900/15 blur-[110px]" />
                <div className="absolute inset-0 bg-[radial-gradient(#f9a8d4_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:28px_28px] opacity-25 dark:opacity-30" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

                    {/* ── LEFT: Text & CTAs ── */}
                    <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">

                        {/* Top Live Pill Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mb-5 sm:mb-6"
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-rose-500/25">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                MONEA · ធៀបការឌីជីថល
                            </span>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.18 }}
                            className="mb-4 sm:mb-6"
                        >
                            <span className="block text-4xl sm:text-5xl lg:text-[4.75rem] font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                                រចនាធៀបការ
                            </span>
                            <span className="block text-3xl sm:text-4xl lg:text-[3.85rem] font-black leading-[1.2] tracking-tight mt-1 sm:mt-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 dark:from-rose-400 dark:via-pink-300 dark:to-rose-400">
                                    ក្នុងក្តីស្រមៃ
                                </span>
                                <span className="text-slate-900 dark:text-white"> របស់អ្នក</span>
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.25 }}
                            className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mb-7 sm:mb-9"
                        >
                            បង្កើតធៀបការឌីជីថល ស្រស់ស្អាតជាមួយ{" "}
                            <strong className="text-slate-700 dark:text-slate-200">Google Maps</strong>,{" "}
                            <strong className="text-slate-700 dark:text-slate-200">KHQR</strong> និង{" "}
                            <strong className="text-slate-700 dark:text-slate-200">Telegram</strong> — ត្រឹមតែ ១ ចុច។
                        </motion.p>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.32 }}
                            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
                        >
                            <Link
                                to={AUTH_URLS.SIGN_UP}
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 sm:h-14 px-7 sm:px-9 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold text-sm shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                            >
                                <span>បង្កើតធៀបការឥឡូវ</span>
                                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                            </Link>

                            <a
                                href="#features"
                                onClick={e => {
                                    e.preventDefault();
                                    document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-7 sm:px-8 rounded-2xl bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-sm backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                មើលគំរូ
                            </a>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.45 }}
                            className="mt-7 sm:mt-9 flex items-center gap-3"
                        >
                            <div className="flex -space-x-2">
                                {[
                                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=60&h=60&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&h=60&fit=crop&crop=face",
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face",
                                ].map((src, i) => (
                                    <img key={i} src={src} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-sm" />
                                ))}
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                    <strong className="text-slate-700 dark:text-slate-200">គូស្នេហ៍ ១,២០០+</strong> ជ្រើសរើស Monea
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── RIGHT: 3D Wedding Cards Stack ── */}
                    <div className="lg:col-span-6 relative h-[360px] xs:h-[400px] sm:h-[480px] lg:h-[580px] w-full flex items-center justify-center [perspective:1200px]">

                        {/* ── Mobile Layout (< lg) ── */}
                        <div className="relative block lg:hidden mx-auto" style={{ width: 260, height: 340 }}>
                            {/* Back card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.7, delay: 0.35 }}
                                className="absolute rounded-3xl overflow-hidden shadow-lg border-[3px] border-white dark:border-white/20"
                                style={{
                                    width: 210,
                                    height: 280,
                                    top: 0,
                                    right: 0,
                                    transform: "rotate(8deg)"
                                }}
                            >
                                <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&fit=crop" className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/70 via-rose-500/10 to-transparent" />
                            </motion.div>

                            {/* Front card */}
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute rounded-3xl overflow-hidden shadow-2xl border-[3px] border-white dark:border-white/20"
                                style={{
                                    width: 210,
                                    height: 280,
                                    top: 30,
                                    left: 0,
                                    transform: "rotate(-3deg)"
                                }}
                            >
                                <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=600&fit=crop" className="w-full h-full object-cover" alt="Wedding invitation" />
                                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/40 dark:bg-black/60 backdrop-blur-md border border-white/20">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                        <span className="text-white/80 text-[9px] font-bold uppercase tracking-widest">Digital Invite</span>
                                    </div>
                                    <p className="text-white font-black text-[13px] leading-tight">សិរីសួស្តី អាពាហ៍ពិពាហ៍</p>
                                    <p className="text-white/75 text-[10px] mt-0.5">ឧត្តម &amp; មុន្នី · ២ កញ្ញា ២០២៦</p>
                                </div>
                            </motion.div>

                            {/* Mobile Glow */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[65%] h-10 bg-rose-400/40 dark:bg-rose-600/30 blur-2xl rounded-full" />
                        </div>

                        {/* ── Desktop 3D Stack (lg+) ── */}
                        <div className="relative hidden lg:flex items-center justify-center w-full h-full">

                            {/* Floating Feature Badges (positioned around cards) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.7, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.65, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute -top-2 left-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl border border-white/60 dark:border-white/10"
                            >
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">ធៀបស្រស់ស្អាត</p>
                                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">Premium Design</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.7, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl border border-white/60 dark:border-white/10"
                            >
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">ផ្ញើតាម Telegram</p>
                                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">1-Click Invite</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.95, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute -bottom-3 left-8 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl border border-white/60 dark:border-white/10"
                            >
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">គ្រប់គ្រងភ្ញៀវវ័យ</p>
                                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">Guest Management</p>
                                </div>
                            </motion.div>

                            {/* 3D Rotating Cards Stack */}
                            <motion.div
                                style={{ rotateX, rotateY }}
                                className="relative w-[320px] aspect-[3/4] [transform-style:preserve-3d] will-change-transform"
                            >
                                {/* Card 3 — Back Right */}
                                <motion.div
                                    initial={{ opacity: 0, x: 40, y: -30 }}
                                    animate={{ opacity: 1, x: 44, y: -32, rotateZ: 8 }}
                                    transition={{ duration: 0.9, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    className="absolute inset-0 rounded-3xl shadow-xl border-4 border-white dark:border-white/20 overflow-hidden blur-[1px]"
                                    style={{ transform: "translateZ(-50px)" }}
                                >
                                    <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&fit=crop" className="w-full h-full object-cover opacity-45 grayscale" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 to-transparent" />
                                </motion.div>

                                {/* Card 2 — Middle Left */}
                                <motion.div
                                    initial={{ opacity: 0, x: -40, y: 30 }}
                                    animate={{ opacity: 1, x: -35, y: 22, rotateZ: -6 }}
                                    transition={{ duration: 0.9, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                    className="absolute inset-0 rounded-3xl shadow-xl border-4 border-white dark:border-white/20 overflow-hidden"
                                    style={{ transform: "translateZ(0px)" }}
                                >
                                    <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&fit=crop" className="w-full h-full object-cover opacity-80" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                </motion.div>

                                {/* Card 1 — Front Center */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.92 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, rotateZ: 1.5 }}
                                    transition={{ duration: 0.9, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                    className="absolute inset-0 rounded-3xl shadow-[0_30px_80px_-10px_rgba(244,63,94,0.35)] dark:shadow-[0_30px_80px_-10px_rgba(244,63,94,0.25)] border-4 border-white dark:border-white/30 overflow-hidden"
                                    style={{ transform: "translateZ(50px)" }}
                                >
                                    <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&fit=crop" className="w-full h-full object-cover" alt="Wedding invitation preview" />
                                    
                                    {/* Glass Overlay on Front Card */}
                                    <div className="absolute bottom-4 left-4 right-4 p-3.5 sm:p-4 rounded-2xl bg-black/40 dark:bg-black/60 backdrop-blur-md border border-white/25 shadow-lg text-white">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                            <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Digital Invitation</span>
                                        </div>
                                        <h3 className="font-black text-white text-sm sm:text-base tracking-wide drop-shadow">
                                            សិរីសួស្តី អាពាហ៍ពិពាហ៍
                                        </h3>
                                        <p className="text-white/75 text-xs mt-0.5 font-medium">ឧត្តម &amp; មុន្នី · ២ កញ្ញា ២០២៦</p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Desktop Glow */}
                            <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[50%] h-12 bg-rose-400/30 dark:bg-rose-600/25 blur-3xl rounded-full" />
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}
