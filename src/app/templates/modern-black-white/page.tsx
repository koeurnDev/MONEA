"use client";

import { m, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ImageIcon, Gift, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";

export default function ModernBlackWhiteTemplate() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="bg-neutral-950 min-h-screen flex justify-center font-kantumruy">
            {/* Mobile Frame Container */}
            <div className="relative w-full max-w-md bg-black h-[100dvh] overflow-y-auto overflow-x-hidden shadow-2xl no-scrollbar">

                {/* Fixed Navigation/Back Button */}
                <div className="fixed top-4 left-4 z-50 flex items-center justify-between w-full max-w-md pr-8">
                    <Link href="/" className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <button onClick={toggleAudio} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>

                {/* --- Background Video (White Roses) --- */}
                <div className="fixed top-0 w-full max-w-md h-[100dvh] z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    >
                        <source src="/images/user_uploads/white_roses.mp4" type="video/mp4" />
                    </video>
                    {/* Dark gradient overlay to ensure text is readable */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
                </div>

                {/* --- Main Content --- */}
                <main className="relative z-10 min-h-[100dvh] flex flex-col pt-24 pb-32">

                    {/* Hero Section */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        >
                            <h2 className="text-white/60 tracking-[0.3em] text-sm uppercase mb-4">សិរីសួស្តី អាពាហ៍ពិពាហ៍</h2>

                            <div className="flex items-center gap-4 my-8">
                                <div className="text-right">
                                    <p className="text-white/60 text-xs mb-1">កូនប្រុសនាម</p>
                                    <h1 className="text-3xl font-bold text-white tracking-wider text-shadow-lg font-mono">វឌ្ឍនា</h1>
                                </div>
                                <div className="w-px h-12 bg-white/30" />
                                <div className="text-left">
                                    <p className="text-white/60 text-xs mb-1">កូនស្រីនាម</p>
                                    <h1 className="text-3xl font-bold text-white tracking-wider text-shadow-lg font-mono">ចាន់ណា</h1>
                                </div>
                            </div>

                            <div className="w-12 h-px bg-white/50 mx-auto my-6" />

                            <p className="text-white/80 leading-loose max-w-xs mx-auto text-sm">
                                មានកិត្តិយសសូមគោរពអញ្ជើញ<br />
                                <span className="text-xl font-bold text-white block my-3 border-b border-white/20 pb-2">ឯកឧត្តម លោកជំទាវ អស់លោក លោកស្រី</span>
                                ចូលរួមជាអធិបតី និងភ្ញៀវកិត្តិយស<br />
                                ដើម្បីប្រសិទ្ធពរជ័យសិរីមង្គល។
                            </p>
                        </m.div>
                    </div>

                    {/* Date & Time Outline */}
                    <m.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="mt-12 px-6"
                    >
                        <div className="border border-white/20 rounded-2xl p-6 bg-black/20 backdrop-blur-sm text-center">
                            <h3 className="text-white font-bold text-lg mb-2">សៅរ៍ ទី២៨ ខែកុម្ភៈ ឆ្នាំ២០២៦</h3>
                            <p className="text-white/60 text-xs leading-relaxed">
                                វេលាម៉ោង ០៤:០០ រសៀល តទៅ<br />
                                សណ្ឋាគារ សូហ្វីតែល ភ្នំពេញ ភូគីត្រា (សាលធំ)
                            </p>
                        </div>
                    </m.div>

                    {/* Couple Generic Photo (Black & White stylized) */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1 }}
                        className="mt-16 px-6"
                    >
                        <div className="relative w-full aspect-[4/5] rounded-tl-[4rem] rounded-br-[4rem] overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all duration-1000">
                            <Image
                                src="/images/user_uploads/sample3.jpg" // The modern elegant user image
                                alt="The Couple"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    </m.div>

                    <div className="h-20" /> {/* Bottom padding for fixed dock */}
                </main>

                {/* --- Interactive Floating Dock (Web App Features) --- */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[360px]">
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl">

                        <button className="flex flex-col items-center justify-center w-16 h-14 rounded-xl hover:bg-white/10 hover:text-white text-white/70 transition-colors group">
                            <Calendar className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px]">ប្រតិទិន</span>
                        </button>

                        <button className="flex flex-col items-center justify-center w-16 h-14 rounded-xl hover:bg-white/10 hover:text-white text-white/70 transition-colors group">
                            <MapPin className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px]">ផែនទី</span>
                        </button>

                        <button className="flex flex-col items-center justify-center w-16 h-14 rounded-xl hover:bg-white/10 hover:text-white text-white/70 transition-colors group">
                            <ImageIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px]">វិចិត្រសាល</span>
                        </button>

                        {/* Primary Action Button */}
                        <button className="flex flex-col items-center justify-center w-16 h-14 rounded-xl bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                            <Gift className="w-5 h-5 mb-1" />
                            <span className="text-[10px]">ចំណងដៃ</span>
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}
