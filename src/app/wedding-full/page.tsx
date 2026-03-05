"use client";
import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { Heart, MapPin, Calendar, Send, Music, Music2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const galleryImages = [
    "/couple-1.jpg", "/couple-2.jpg", "/couple-3.jpg", "/couple-4.jpg",
    "/couple-5.jpg", "/couple-6.jpg", "/couple-7.jpg", "/couple-8.jpg"
];

// Combine classes utility
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function FullWeddingInvitation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedImg, setSelectedImg] = useState<number | null>(null);

    // Play music when opening invitation
    useEffect(() => {
        if (isPlaying) {
            // Simulate music playing (would need an Audio element in a real app)
            // const audio = new Audio('/music.mp3');
            // audio.play();
            // return () => audio.pause();
        }
    }, [isPlaying]);

    return (
        <div className="bg-[#FFF9FA] min-h-screen max-w-md mx-auto relative overflow-x-hidden shadow-2xl font-serif">

            {/* 1. Splash Screen (Video 2 Style) */}
            <AnimatePresence>
                {!isOpen && (
                    <m.div
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto"
                    >
                        <div className="absolute inset-0 bg-[url('/floral-frame.png')] bg-contain bg-center bg-no-repeat opacity-80 pointer-events-none" />
                        <m.h2 className="text-pink-400 text-lg mb-4 z-10">សិរីសួស្តីអាពាហ៍ពិពាហ៍</m.h2>
                        <h1 className="text-5xl text-[#8E5A5A] mb-8 z-10 font-bold">ភារម្យ & សោភា</h1>
                        <button
                            onClick={() => { setIsOpen(true); setIsPlaying(true); }}
                            className="bg-[#8E5A5A] text-white px-10 py-3 rounded-full shadow-xl animate-bounce z-10 hover:bg-pink-800 transition-colors"
                        >
                            បើកសំបុត្រអញ្ជើញ
                        </button>
                    </m.div>
                )}
            </AnimatePresence>

            {/* 2. Background Music Control */}
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="fixed top-5 right-5 z-50 bg-white/80 p-3 rounded-full shadow-lg text-pink-400"
            >
                {isPlaying ? <Music className="animate-spin-slow" /> : <Music2 />}
            </button>

            {/* 3. Hero Section (Video 3 Style) */}
            <section className="relative pt-32 pb-16 text-center overflow-hidden">
                {/* Floating Butterflies */}
                {[1, 2, 3].map((i) => (
                    <m.span
                        key={i}
                        animate={{
                            x: [0, 50, -50, 0],
                            y: [0, -100, -200],
                            opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, delay: i * 2 }}
                        className="absolute text-2xl"
                        style={{ top: '60%', left: `${i * 25}%` }}
                    >
                        🦋
                    </m.span>
                ))}

                <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                    <h2 className="text-pink-400 tracking-[0.3em] mb-6 text-sm font-semibold">SAVE THE DATE</h2>
                    <h1 className="text-6xl text-[#8E5A5A] leading-tight mb-4 font-bold">ភារម្យ <br />&<br /> សោភា</h1>
                    <p className="text-gray-500 italic mt-6 px-10">សូមគោរពអញ្ជើញ លោក... លោកស្រី...</p>
                </m.div>
            </section>

            {/* 4. Event Timeline */}
            <section className="px-8 py-12 bg-white/50 backdrop-blur-md">
                <h3 className="text-center text-2xl text-[#8E5A5A] mb-10 border-b border-pink-100 pb-4 font-bold">កម្មវិធីបុណ្យ</h3>
                <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-5 before:ml-[1.25rem] before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-pink-200 before:to-transparent">
                    {[
                        { time: "07:30 ព្រឹក", desc: "ជួបជុំញាតិមិត្ត និងពិធីហែជំនូន" },
                        { time: "09:00 ព្រឹក", desc: "ពិធីកាត់សក់បង្កក់សិរី" },
                        { time: "04:30 ល្ងាច", desc: "អញ្ជើញពិសាភោជនាហារ" },
                    ].map((item, idx) => (
                        <m.div
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="relative flex items-center gap-6 pl-2"
                        >
                            <div className="w-10 h-10 min-w-10 rounded-full bg-pink-100 border-2 border-white shadow-sm z-10 flex items-center justify-center text-pink-500">
                                <Heart size={16} fill="currentColor" />
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm w-full border border-pink-50">
                                <span className="text-xs font-bold text-pink-500 uppercase block mb-1">{item.time}</span>
                                <p className="text-gray-700 text-sm">{item.desc}</p>
                            </div>
                        </m.div>
                    ))}
                </div>
            </section>

            {/* 5. Photo Gallery (Video 3 Style) */}
            <section className="p-4 grid grid-cols-2 gap-2">
                {galleryImages.map((src, idx) => (
                    <m.div
                        key={idx}
                        whileHover={{ scale: 0.98 }}
                        onClick={() => setSelectedImg(idx)}
                        className={cn(
                            "rounded-lg overflow-hidden shadow-md cursor-pointer aspect-[3/4] relative group",
                            idx === 0 || idx === 7 ? "col-span-2 aspect-[16/9]" : ""
                        )}
                    >
                        <CldImage
                            src={src}
                            alt="Gallery"
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </m.div>
                ))}
            </section>

            {/* 6. Guestbook (Video 2 Style) */}
            <section className="p-8 bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] mt-10" id="wishes">
                <h3 className="text-center text-2xl text-[#8E5A5A] mb-8 font-bold">ផ្ញើសារជូនពរ</h3>
                <div className="space-y-4">
                    <div className="bg-pink-50/50 p-4 rounded-2xl">
                        <input type="text" placeholder="ឈ្មោះ" className="w-full bg-transparent border-b border-pink-200 focus:border-pink-500 p-2 outline-none mb-4" />
                        <textarea placeholder="សរសេរពាក្យជូនពរ..." className="w-full bg-transparent p-2 outline-none h-24 resize-none" />
                    </div>
                    <button className="w-full bg-[#8E5A5A] text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-100 flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-pink-800">
                        ផ្ញើជូនពរ <Send size={18} />
                    </button>
                </div>
            </section>

            {/* 7. Footer / Location */}
            <footer className="p-12 text-center bg-[#8E5A5A] text-white">
                <MapPin className="mx-auto mb-4 animate-bounce" size={32} />
                <h4 className="text-xl font-bold mb-2">ទីកន្លែងពិធី</h4>
                <p className="mb-6 opacity-90">សាលមហោស្រពកោះពេជ្រ (អាគារ A)</p>
                <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border border-white/40 bg-white/10 backdrop-blur-sm px-8 py-2 rounded-full hover:bg-white hover:text-[#8E5A5A] transition-all duration-300"
                >
                    មើលផែនទី
                </a>
                <p className="mt-10 text-[10px] opacity-50 uppercase tracking-widest">Design by Focus Solution</p>
            </footer>

            {/* Fullscreen Image Overlay */}
            <AnimatePresence>
                {selectedImg !== null && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
                        onClick={() => setSelectedImg(null)}
                    >
                        <button
                            onClick={() => setSelectedImg(null)}
                            className="absolute top-5 right-5 text-white/50 hover:text-white p-2"
                        >
                            <X size={32} />
                        </button>

                        <div className="relative w-full max-w-4xl h-[85vh]" onClick={(e) => e.stopPropagation()}>
                            <CldImage
                                src={galleryImages[selectedImg]}
                                alt="Gallery Fullscreen"
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
