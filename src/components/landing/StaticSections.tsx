"use client";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { useTranslation } from "@/i18n/LanguageProvider";

export function TrustedPartners() {
    const { t } = useTranslation();
    const partners = ["ABA Bank", "ACLEDA", "Canadia Bank", "Wing", "KHQR Supported"];

    return (
        <section className="py-12 bg-white dark:bg-black border-b border-slate-100 dark:border-white/5 relative z-10">
            <div className="container mx-auto px-6 max-w-6xl">
                <p className="text-center text-slate-500 dark:text-white/40 text-xs md:text-sm font-kantumruy uppercase tracking-widest mb-8">
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
        <footer className="bg-slate-50 dark:bg-black py-20 border-t border-slate-200 dark:border-white/10">
            <div className="container mx-auto px-6 text-center">
                <div className="flex flex-col items-center mb-10">
                    <MoneaLogo size="md" variant="system" className="mb-4" />
                    <h2 className="text-2xl md:text-4xl font-bold font-kantumruy text-slate-800 dark:text-white/10 tracking-[0.5em] uppercase ml-2">{t("common.constants.brandName")}</h2>
                </div>

                <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 font-kantumruy text-slate-500 dark:text-white/60 uppercase text-xs tracking-[0.2em]">
                    <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.home")}</Link>
                    <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.features")}</Link>
                    <Link href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.howItWorks")}</Link>
                    <Link href="#templates" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.templates")}</Link>
                    <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("common.footer.contact")}</Link>
                </div>

                <div className="flex justify-center gap-6 mb-12">
                    {/* Social Icons */}
                    <Link href="#" className="w-12 h-12 rounded-full border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent hover:bg-slate-900 dark:hover:bg-white text-slate-500 dark:text-white/50 hover:text-white dark:hover:text-black hover:border-slate-900 dark:hover:border-white transition-all cursor-pointer flex items-center justify-center hover:scale-110 duration-300 shadow-sm dark:shadow-none">
                        <Facebook className="w-5 h-5" />
                    </Link>
                    <Link href="#" className="w-12 h-12 rounded-full border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent hover:bg-slate-900 dark:hover:bg-white text-slate-500 dark:text-white/50 hover:text-white dark:hover:text-black hover:border-slate-900 dark:hover:border-white transition-all cursor-pointer flex items-center justify-center hover:scale-110 duration-300 shadow-sm dark:shadow-none">
                        <Instagram className="w-5 h-5" />
                    </Link>
                    <Link href="#" className="w-12 h-12 rounded-full border border-slate-300 dark:border-white/20 bg-white dark:bg-transparent hover:bg-slate-900 dark:hover:bg-white text-slate-500 dark:text-white/50 hover:text-white dark:hover:text-black hover:border-slate-900 dark:hover:border-white transition-all cursor-pointer flex items-center justify-center hover:scale-110 duration-300 shadow-sm dark:shadow-none">
                        <Twitter className="w-5 h-5" />
                    </Link>
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
