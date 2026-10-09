import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SmoothScroll from '@/components/layout/SmoothScroll';
import PageTransition from '@/components/layout/PageTransition';
import { useTranslation } from "@/i18n/LanguageProvider";

export default function TermsAndConditionsPage() {
    const { t } = useTranslation();

    return (
        <SmoothScroll>
            <PageTransition>
                <div className="min-h-screen bg-black text-white font-kantumruy">
                    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                        <div className="container mx-auto relative px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                            <Link to="/" className="flex max-w-[42%] items-center gap-1.5 truncate text-xs sm:gap-2 sm:text-sm group text-white/70 hover:text-white transition-colors">
                                <ArrowLeft size={17} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                                {t("common.auth.backToHome")}
                            </Link>
                            <span className="absolute left-1/2 -translate-x-1/2 font-bold text-base sm:text-xl tracking-widest text-white">{t("common.constants.brandName")}</span>
                        </div>
                    </header>

                    <main className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24 max-w-4xl space-y-8 sm:space-y-12">
                        <div className="text-center space-y-3 sm:space-y-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight break-words">{t("common.terms.title")}</h1>
                            <p className="text-white/50">{t("common.terms.lastUpdated")}</p>
                        </div>

                        <div className="prose prose-invert prose-pink max-w-none text-white/80 text-sm sm:text-base leading-8 sm:leading-relaxed space-y-7 sm:space-y-8 break-words">
                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 break-words">{t("common.terms.s1.title")}</h2>
                                <p>{t("common.terms.s1.p1")}</p>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 break-words">{t("common.terms.s2.title")}</h2>
                                <p>{t("common.terms.s2.p1")}</p>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 break-words">{t("common.terms.s3.title")}</h2>
                                <p>{t("common.terms.s3.p1")}</p>
                                <ul className="list-disc pl-5 sm:pl-6 mt-3 sm:mt-4 space-y-2">
                                    {(t("common.terms.s3.items", { returnObjects: true }) as string[] || []).map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 break-words">{t("common.terms.s4.title")}</h2>
                                <p>{t("common.terms.s4.p1")}</p>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 break-words">{t("common.terms.s5.title")}</h2>
                                <p>{t("common.terms.s5.p1")}</p>
                                <p className="mt-4">{t("common.terms.s5.p2")}</p>
                                <ul className="list-disc pl-5 sm:pl-6 mt-3 sm:mt-4 space-y-2">
                                    {(t("common.terms.s5.items", { returnObjects: true }) as string[] || []).map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 break-words">{t("common.terms.s6.title")}</h2>
                                <p>{t("common.terms.s6.p1")}</p>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 break-words">{t("common.terms.s7.title")}</h2>
                                <p>{t("common.terms.s7.p1")}</p>
                                <p className="mt-4">
                                    <strong>{t("common.terms.s7.email").split(": ")[0]}:</strong> {t("common.terms.s7.email").split(": ")[1]}<br />
                                    <strong>{t("common.terms.s7.phone").split(": ")[0]}:</strong> {t("common.terms.s7.phone").split(": ")[1]}
                                </p>
                            </section>
                        </div>
                    </main>

                    {/* Minimal Footer */}
                    <footer className="border-t border-white/10 py-8">
                        <div className="container mx-auto px-6 text-center">
                            <p className="text-white/30 text-sm">{t("common.footer.copyright")}</p>
                        </div>
                    </footer>
                </div>
            </PageTransition>
        </SmoothScroll>
    );
}
