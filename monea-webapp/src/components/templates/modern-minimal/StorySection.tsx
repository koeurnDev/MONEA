import React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";

export const StorySection = ({ wedding }: { wedding: WeddingData }) => {
    const { t, locale } = useTranslation();
    const story = wedding.themeSettings?.story?.[locale] || wedding.themeSettings?.story?.['en'];

    if (!story) return null;

    return (
        <section className="py-24 md:py-32 bg-white relative">
            <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 uppercase">
                        Our Story
                    </h2>
                    <div className="w-8 md:w-12 h-1 bg-slate-900 mt-6 mx-auto" />
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <p className="text-lg md:text-2xl font-medium text-slate-500 leading-relaxed md:leading-loose">
                        {story}
                    </p>
                </m.div>
            </div>
        </section>
    );
};
