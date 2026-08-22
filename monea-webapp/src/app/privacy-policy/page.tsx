"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SmoothScroll from '@/components/layout/SmoothScroll';
import PageTransition from '@/components/layout/PageTransition';
import { useTranslation } from "@/i18n/LanguageProvider";

export default function PrivacyPolicyPage() {
    const { t } = useTranslation();

    return (
        <SmoothScroll>
            <PageTransition>
                <div className="min-h-screen bg-black text-white font-kantumruy">
                    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2 group text-white/70 hover:text-white transition-colors">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                {t("common.auth.backToHome")}
                            </Link>
                            <span className="font-bold text-xl tracking-widest text-white">{t("common.constants.brandName")}</span>
                            <div className="w-[84px]"></div> {/* Spacer for centering */}
                        </div>
                    </header>

                    <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl space-y-12">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t("common.privacy.title")}</h1>
                            <p className="text-white/50">{t("common.privacy.lastUpdated")}</p>
                        </div>

                        <div className="prose prose-invert prose-pink max-w-none text-white/80 space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">{t("common.privacy.s1.title")}</h2>
                                <p>{t("common.privacy.s1.p1")}</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">{t("common.privacy.s2.title")}</h2>
                                <p>{t("common.privacy.s2.p1")}</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    {(t("common.privacy.s2.items", { returnObjects: true }) as string[] || []).map((item, index) => {
                                        const parts = item.split(/[៖:]/);
                                        return (
                                            <li key={index}>
                                                {parts.length > 1 ? (
                                                    <><strong>{parts[0]}{item.includes("៖") ? "៖" : ":"}</strong> {parts.slice(1).join(item.includes("៖") ? "៖" : ":")}</>
                                                ) : item}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">{t("common.privacy.s3.title")}</h2>
                                <p>{t("common.privacy.s3.p1")}</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    {(t("common.privacy.s3.items", { returnObjects: true }) as string[] || []).map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">{t("common.privacy.s4.title")}</h2>
                                <p>{t("common.privacy.s4.p1")}</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">{t("common.privacy.s5.title")}</h2>
                                <p>{t("common.privacy.s5.p1")}</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">{t("common.privacy.s6.title")}</h2>
                                <p>{t("common.privacy.s6.p1")}</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    {(t("common.privacy.s6.items", { returnObjects: true }) as string[] || []).map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">{t("common.privacy.s7.title")}</h2>
                                <p>{t("common.privacy.s7.p1")}</p>
                                <p className="mt-4">
                                    <strong>{t("common.privacy.s7.email").split(": ")[0]}:</strong> {t("common.privacy.s7.email").split(": ")[1]}<br />
                                    <strong>{t("common.privacy.s7.phone").split(": ")[0]}:</strong> {t("common.privacy.s7.phone").split(": ")[1]}
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
