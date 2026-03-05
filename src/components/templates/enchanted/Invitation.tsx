import React from 'react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { WeddingData } from "../types";

export default function Invitation({ wedding }: { wedding: WeddingData }) {
    return (
        <section className="relative py-24 px-6 overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[#08120e] opacity-90 z-0"></div>
            <Image
                src="/templates/enchanted/bg-floral.jpg"
                alt="Floral Background"
                fill
                className="object-cover opacity-20 z-0 mix-blend-overlay"
            />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
                <m.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="p-8 md:p-12 border border-[#D4AF37]/30 bg-[#050A08]/60 backdrop-blur-sm relative"
                >
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t border-l border-[#D4AF37]"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-t border-r border-[#D4AF37]"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 md:w-8 md:h-8 border-b border-l border-[#D4AF37]"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b border-r border-[#D4AF37]"></div>

                    <p className="font-vibes text-[#D4AF37] text-3xl mb-8">Together with their families</p>

                    <p className="font-cormorant text-gray-300 text-lg mb-6 tracking-wider uppercase">
                        We joyfully invite you to celebrate the wedding of
                    </p>

                    <div className="font-kantumruy text-xl md:text-3xl text-white leading-[1.8] md:leading-loose py-6 border-y border-[#D4AF37]/20 my-8">
                        {wedding.themeSettings?.parents?.groomFather || "លោក មាស ភារុណ"} <br />
                        {wedding.themeSettings?.parents?.groomMother || "លោកស្រី ស៊ឹម សុខា"}
                        <div className="my-4 text-xs md:text-sm text-[#D4AF37]/70 font-sans tracking-widest uppercase">and</div>
                        {wedding.themeSettings?.parents?.brideFather || "លោក ចាន់ សុភ័ក្រ"} <br />
                        {wedding.themeSettings?.parents?.brideMother || "លោកស្រី ហែម ស្រីពៅ"}
                    </div>

                    <p className="font-cormorant text-gray-300 text-lg mb-4">
                        Please join us for an evening of love, laughter, and happily ever after.
                    </p>

                    <div className="inline-block mt-6">
                        <button className="px-8 py-3 bg-[#D4AF37] text-[#050A08] font-cinzel font-bold tracking-widest hover:bg-[#F3E5AB] transition-colors duration-300 transform hover:-translate-y-1">
                            RSVP NOW
                        </button>
                    </div>
                </m.div>
            </div>
        </section>
    );
}
