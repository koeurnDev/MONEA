"use client";
import { Home, Calendar, Image as ImageIcon, MapPin } from "lucide-react";
import { WeddingData } from "../types";

export default function MobileNav({ wedding, mapLink }: { wedding?: WeddingData, mapLink?: string }) {
    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[999] pointer-events-none flex justify-center">
            <div className="pointer-events-auto bg-black/40 backdrop-blur-md shadow-2xl rounded-full px-6 py-3 flex justify-between items-center border border-white/20 w-full max-w-sm">

                <button onClick={() => scrollTo('hero')} className="flex flex-col items-center text-white/70 hover:text-white transition-colors p-1">
                    <Home size={20} />
                    <span className="text-[10px] font-khmer mt-1">ដើម</span>
                </button>

                <button onClick={() => scrollTo('timeline')} className="flex flex-col items-center text-white/70 hover:text-white transition-colors p-1">
                    <Calendar size={20} />
                    <span className="text-[10px] font-khmer mt-1">កម្មវិធី</span>
                </button>

                {/* Heart Logo */}
                <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-full -mt-12 border-4 border-black/20 shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center text-white animate-pulse z-10">
                        ♥
                    </div>
                </div>


                <button onClick={() => scrollTo('gallery')} className="flex flex-col items-center text-white/70 hover:text-white transition-colors p-1">
                    <ImageIcon size={20} />
                    <span className="text-[10px] font-khmer mt-1">រូបភាព</span>
                </button>

                <button onClick={() => scrollTo('location')} className="flex flex-col items-center text-white/70 hover:text-white transition-colors p-1">
                    <MapPin size={20} />
                    <span className="text-[10px] font-khmer mt-1">ទីតាំង</span>
                </button>

            </div>
        </div>
    );
}
