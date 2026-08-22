"use client";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { useTranslation } from "@/i18n/LanguageProvider";

export function TrustedPartners() {
    const { t } = useTranslation();
    const partners = ["ABA Bank", "ACLEDA", "Canadia Bank", "Wing", "BAKONG KHQR"];

    return (
        <section className="py-12 bg-[#FDFBF7] dark:bg-[#0A0A0A] border-b border-slate-100 dark:border-white/5 relative z-10">
            <div className="container mx-auto px-6 max-w-6xl">
                <p className="text-center text-slate-400 dark:text-white/40 text-[10px] md:text-xs font-kantumruy font-bold uppercase tracking-widest mb-8">
                    {t("common.partners.subtitle")}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                    {partners.map((partner, idx) => (
                        <span key={idx} className="text-slate-900 dark:text-white font-bold text-lg md:text-xl font-mono tracking-wider">
                            {partner}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bg-slate-50 dark:bg-[#0A0A0A] py-20 border-t border-slate-200 dark:border-white/10">
            <div className="container mx-auto px-6 text-center">
                <div className="flex flex-col items-center mb-10">
                    <MoneaLogo size="md" variant="system" className="mb-4" />
                    <h2 className="text-xl md:text-2xl font-bold font-kantumruy text-slate-900 dark:text-white/80 tracking-[0.3em] uppercase ml-2">{t("common.constants.brandName")}</h2>
                </div>

                <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 font-kantumruy text-slate-500 dark:text-white/60 uppercase text-xs tracking-[0.2em]">
                    <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.home")}</Link>
                    <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.features")}</Link>
                    <Link href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.howItWorks")}</Link>
                    <Link href="#templates" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.templates")}</Link>
                    <a href="mailto:support@monea.com" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.contact")}</a>
                </div>

                <div className="flex justify-center gap-6 mb-12">
                    {/* Social Icons */}
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-sm dark:shadow-none">
                        <Facebook className="w-4 h-4" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-sm dark:shadow-none">
                        <Instagram className="w-4 h-4" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-sm dark:shadow-none">
                        <Twitter className="w-4 h-4" />
                    </a>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/30 text-xs font-kantumruy">
                    <p>{t("common.footer.copyright")}</p>
                    <div className="flex gap-4 mt-4 md:mt-0 font-kantumruy">
                        <Link href="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.privacyPolicy")}</Link>
                        <span>•</span>
                        <Link href="/terms-and-conditions" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.termsOfUse")}</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
