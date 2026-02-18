import React from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { WeddingData } from "../types";

interface HeroSectionProps {
    wedding: WeddingData;
    guestName?: string;
    labels: any;
    primaryColor: string;
    heroImage: string | undefined;
}

export default function HeroSection({ wedding, guestName, labels, primaryColor, heroImage }: HeroSectionProps) {
    return (
        <section className="relative pt-32 pb-20 text-center overflow-hidden">
            {/* Elegant Floating Particles */}
            {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: Math.random() * 8 + 2 + "px",
                        height: Math.random() * 8 + 2 + "px",
                        background: primaryColor,
                        opacity: 0.15,
                        top: Math.random() * 100 + "%",
                        left: Math.random() * 100 + "%",
                    }}
                    animate={{
                        y: [0, -100, -200],
                        x: [0, Math.random() * 40 - 20, 0],
                        opacity: [0, 0.4, 0],
                        scale: [0, 1.2, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 15,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5,
                    }}
                />
            ))}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                {/* Custom Hero Image if provided */}
                {heroImage && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mx-auto w-64 h-64 rounded-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-10 border-4 border-white relative z-10"
                    >
                        {heroImage.startsWith('http') || heroImage.startsWith('/') || heroImage.match(/\.(jpeg|jpg|gif|png)$/) ? (
                            <img src={heroImage} alt="Couple" className="w-full h-full object-cover" />
                        ) : (
                            <CldImage src={heroImage} alt="Couple" fill className="object-cover" sizes="300px" config={{ url: { analytics: false } }} />
                        )}
                    </motion.div>
                )}

                <h2 className="tracking-[0.3em] mb-6 text-sm font-bold uppercase opacity-70 font-khmer" style={{ color: primaryColor }}>{labels.invite_main}</h2>

                <div className="relative inline-block mb-8">
                    <h1 className="text-6xl md:text-8xl font-great-vibes leading-none text-slate-800 drop-shadow-sm p-2">
                        <span className="block mb-2" style={{ color: primaryColor }}>{wedding.groomName}</span>
                        <span className="text-4xl font-playfair italic text-slate-300 block my-2">&</span>
                        <span className="block mt-2" style={{ color: primaryColor }}>{wedding.brideName}</span>
                    </h1>
                </div>

                {guestName ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 px-6 py-4 bg-white/50 backdrop-blur-sm inline-block rounded-2xl shadow-sm border border-white/60"
                    >
                        <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-kantumruy">ភ្ញៀវកិត្តិយស</p>
                        <p className="text-gray-900 font-bold text-2xl font-kantumruy leading-relaxed break-words max-w-xs mx-auto">{guestName}</p>
                    </motion.div>
                ) : (
                    <p className="text-gray-400 italic mt-8 px-10 font-kantumruy">រក្សាថ្ងៃនេះទុកក្នុងចិត្ត</p>
                )}
            </motion.div>
        </section>
    );
}
