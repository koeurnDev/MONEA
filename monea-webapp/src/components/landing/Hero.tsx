import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { m, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { AUTH_URLS } from "@/lib/constants";

export function Hero() {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);
    
    // Mouse tracking for 3D effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    // Smooth spring for the mouse movement
    const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

    // Calculate rotation based on mouse position (normalized between -1 and 1)
    const rotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
        <section className="relative min-h-[100dvh] w-full flex items-center overflow-hidden bg-[#FAF8F5] dark:bg-[#09090B] font-kantumruy transition-colors duration-300">
            {/* Ambient Background Lights */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-rose-500/10 dark:bg-rose-600/15 blur-[140px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-amber-500/10 dark:bg-amber-600/10 blur-[140px]" />
                <div className="absolute top-[30%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-pink-500/5 dark:bg-pink-900/10 blur-[150px]" />
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* Left: Content */}
                    <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
                        {/* Live Badge */}
                        <m.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mb-5 sm:mb-7"
                        >
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-border/80 shadow-xs">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                                </span>
                                <span className="text-foreground text-[10px] sm:text-xs font-black tracking-wider uppercase">
                                    {t("hero.badge", { defaultValue: "MONEA DIGITAL: លឿនរហ័ស & ចំណេញពេល" })}
                                </span>
                            </div>
                        </m.div>

                        {/* Title */}
                        <m.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col gap-1 sm:gap-2 mb-6 sm:mb-8"
                        >
                            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-bold text-foreground leading-[1.3] tracking-tight">
                                {t("hero.title1", { defaultValue: "រចនាធៀប" })}
                            </span>
                            <span className="text-2xl sm:text-4xl md:text-5xl lg:text-[4rem] text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-300 font-bold leading-[1.3] tracking-tight pb-1">
                                {t("hero.title2", { defaultValue: "របស់អ្នកនៅទីនេះ" })}
                            </span>
                        </m.h1>

                        {/* Action Buttons */}
                        <m.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center lg:justify-start max-w-md sm:max-w-none"
                        >
                            <Link 
                                to={AUTH_URLS.SIGN_UP} 
                                className="group relative flex h-12 sm:h-14 px-7 sm:px-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 pt-0.5">
                                    {t("hero.ctaRegister", { defaultValue: "ចាប់ផ្តើមឥឡូវនេះ" })}
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                            
                            <a 
                                href="#features" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="group flex h-12 sm:h-14 px-6 sm:px-8 items-center justify-center rounded-full bg-card/80 hover:bg-muted/80 backdrop-blur-md border border-border text-foreground font-bold text-xs sm:text-sm shadow-xs transition-all w-full sm:w-auto"
                            >
                                <span className="flex items-center justify-center gap-2 pt-0.5">
                                    <Play size={14} className="fill-current text-muted-foreground group-hover:text-rose-600 transition-colors" />
                                    <span>ស្វែងយល់បន្ថែម</span>
                                </span>
                            </a>
                        </m.div>
                    </div>

                    {/* Right: 3D Floating Wedding Cards */}
                    <div className="lg:col-span-6 relative h-[340px] xs:h-[380px] sm:h-[460px] lg:h-[580px] w-full mt-6 lg:mt-0 flex items-center justify-center perspective-[1500px]">
                        <m.div
                            style={isMobile ? {} : { rotateX, rotateY }}
                            className="relative w-full max-w-[220px] xs:max-w-[260px] sm:max-w-[320px] lg:max-w-[380px] aspect-[3/4] transform-style-3d will-change-transform"
                        >
                            {/* Card 3 (Back Right) */}
                            <m.div
                                initial={{ opacity: 0, x: 40, y: -30, rotateZ: 8 }}
                                animate={{ opacity: 1, x: isMobile ? 25 : 45, y: isMobile ? -20 : -35, rotateZ: isMobile ? 6 : 8 }}
                                transition={{ duration: 0.9, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute inset-0 bg-card rounded-2xl sm:rounded-3xl shadow-xl border border-border/80 overflow-hidden translate-z-[-60px] blur-[1px]"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop" 
                                    className="w-full h-full object-cover opacity-50 grayscale" 
                                    alt="Wedding Template 3" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            </m.div>

                            {/* Card 2 (Middle Left) */}
                            <m.div
                                initial={{ opacity: 0, x: -40, y: 30, rotateZ: -8 }}
                                animate={{ opacity: 1, x: isMobile ? -25 : -35, y: isMobile ? 15 : 20, rotateZ: isMobile ? -4 : -6 }}
                                transition={{ duration: 0.9, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute inset-0 bg-card rounded-2xl sm:rounded-3xl shadow-xl border border-border/80 overflow-hidden translate-z-[0px]"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop" 
                                    className="w-full h-full object-cover opacity-85" 
                                    alt="Wedding Template 2" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </m.div>

                            {/* Card 1 (Front Center) */}
                            <m.div
                                initial={{ opacity: 0, y: 60 }}
                                animate={{ opacity: 1, y: 0, rotateZ: 1 }}
                                transition={{ duration: 0.9, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                className="absolute inset-0 bg-card rounded-2xl sm:rounded-[2rem] shadow-2xl border-2 sm:border-4 border-white dark:border-border overflow-hidden translate-z-[60px]"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop" 
                                    className="w-full h-full object-cover" 
                                    alt="Wedding Template Main" 
                                />
                                
                                {/* Glass Overlay on Front Card */}
                                <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-lg text-white">
                                    <h3 className="font-bold text-sm sm:text-base tracking-wide drop-shadow-md">
                                        សិរីសួស្តី អាពាហ៍ពិពាហ៍
                                    </h3>
                                    <p className="text-white/80 text-[11px] sm:text-xs mt-0.5 drop-shadow-sm font-medium">
                                        ឧត្តម & មុន្នី
                                    </p>
                                </div>
                            </m.div>
                        </m.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
