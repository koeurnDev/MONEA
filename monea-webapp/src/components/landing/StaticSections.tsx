import { Link } from 'react-router-dom';
import { Facebook, Instagram, Send, Sparkles } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { useTranslation } from "@/i18n/LanguageProvider";

export function TrustedPartners() {
    return null;
}

export function Footer() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';

    return (
        <footer className="bg-card dark:bg-[#070709] pt-14 pb-28 sm:pb-16 border-t border-border/80 relative overflow-hidden font-kantumruy">
            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
            
            <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 max-w-4xl">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <Link to="/" className="group inline-flex items-center gap-2.5 hover:scale-105 transition-transform">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 p-[1.5px] shadow-sm shadow-rose-500/20">
                            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                                <Sparkles size={14} className="text-rose-600 dark:text-rose-400" />
                            </div>
                        </div>
                        <span className="font-outfit font-black text-lg tracking-[0.2em] text-foreground uppercase select-none">
                            MONEA
                        </span>
                    </Link>
                    <p className="text-muted-foreground text-xs mt-2 max-w-sm">
                        {isKm ? "វេទិការៀបចំសំបុត្រមង្គលការឌីជីថល និងគ្រប់គ្រងភ្ញៀវទំនើប" : "Modern Digital Wedding Invitation & Guest Management Platform"}
                    </p>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2.5 mb-8 text-xs sm:text-sm font-bold text-muted-foreground">
                    <Link to="/" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                        {t("common.footer.home", { defaultValue: "ទំព័រដើម" })}
                    </Link>
                    <a href="#features" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                        {t("common.footer.features", { defaultValue: "លក្ខណៈពិសេស" })}
                    </a>
                    <a href="#how-it-works" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                        {t("common.footer.howItWorks", { defaultValue: "របៀបប្រើប្រាស់" })}
                    </a>
                    <a href="https://t.me/eza_ocr_bot" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                        {isKm ? "ទំនាក់ទំនង" : "Contact"}
                    </a>
                </div>

                {/* Social Icons */}
                <div className="flex justify-center gap-3.5 mb-10">
                    <a 
                        href="https://t.me/eza_ocr_bot" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full border border-border bg-card/80 hover:bg-muted text-muted-foreground hover:text-rose-600 transition-all flex items-center justify-center shadow-xs"
                    >
                        <Send size={16} />
                    </a>
                    <a 
                        href="https://facebook.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full border border-border bg-card/80 hover:bg-muted text-muted-foreground hover:text-rose-600 transition-all flex items-center justify-center shadow-xs"
                    >
                        <Facebook size={16} />
                    </a>
                    <a 
                        href="https://instagram.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-full border border-border bg-card/80 hover:bg-muted text-muted-foreground hover:text-rose-600 transition-all flex items-center justify-center shadow-xs"
                    >
                        <Instagram size={16} />
                    </a>
                </div>

                {/* Copyright & Legal Links */}
                <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                    <p>{t("common.footer.copyright", { defaultValue: "រក្សាសិទ្ធិគ្រប់យ៉ាង © ២០២៦ MONEA" })}</p>
                    <div className="flex items-center gap-3">
                        <Link to="/privacy-policy" className="hover:text-foreground transition-colors underline-offset-2 hover:underline">
                            {t("common.footer.privacyPolicy", { defaultValue: "គោលការណ៍ឯកជនភាព" })}
                        </Link>
                        <span>•</span>
                        <Link to="/terms-and-conditions" className="hover:text-foreground transition-colors underline-offset-2 hover:underline">
                            {t("common.footer.termsOfUse", { defaultValue: "លក្ខខណ្ឌប្រើប្រាស់" })}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
