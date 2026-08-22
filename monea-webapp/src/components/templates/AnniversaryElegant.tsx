import React from 'react';
import type { WeddingData } from './types';
import { format } from 'date-fns';
import { km } from 'date-fns/locale';

import AnniversaryVows from './anniversary-elegant/AnniversaryVows';
import AnniversarySchedule from './anniversary-elegant/AnniversarySchedule';
import AnniversaryGallery from './anniversary-elegant/AnniversaryGallery';
import AnniversaryLocation from './anniversary-elegant/AnniversaryLocation';
import AnniversaryGuestbook from './anniversary-elegant/AnniversaryGuestbook';

export default function AnniversaryElegant({ wedding }: { wedding: WeddingData }) {
    const { groomName, brideName, date, location } = wedding;
    
    // Convert to Khmer digits helper
    const toKhmerNum = (num: number | string) => {
        const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
        return String(num).split('').map(d => /\d/.test(d) ? khmerDigits[parseInt(d)] : d).join('');
    };

    const dDate = new Date(date);
    const day = toKhmerNum(format(dDate, 'dd', { locale: km }));
    const month = format(dDate, 'MMMM', { locale: km });
    const year = toKhmerNum(format(dDate, 'yyyy', { locale: km }));
    
    // For anniversary, we usually display "GroomName & BrideName" but since it's Husband and Wife, we use the same fields.
    
    return (
        <div className="w-full bg-[#FDFBF7] font-kantumruy text-slate-800">
            <div 
                className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center font-kantumruy"
                style={{ backgroundImage: `url('/assets/anniversary-elegant/anniversary-elegant-bg.webp')` }}
                id="hero"
            >
                <div className="absolute inset-0 bg-white/20" /> {/* Slight overlay for text readability */}
                
                <div className="relative z-10 p-8 text-center max-w-lg mx-auto flex flex-col items-center gap-6">
                    
                    <h3 className="text-xl md:text-2xl font-black text-purple-900 tracking-wider">
                        សិរីមង្គលខួបអាពាហ៍ពិពាហ៍
                    </h3>
                    
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-khmer-moul text-purple-800 leading-relaxed">
                            {groomName}
                        </h1>
                        <div className="text-2xl text-purple-400 italic font-serif">
                            និង
                        </div>
                        <h1 className="text-4xl md:text-6xl font-khmer-moul text-purple-800 leading-relaxed">
                            {brideName}
                        </h1>
                    </div>
                    
                    <div className="w-16 h-px bg-purple-300 mx-auto my-4" />
                    
                    <div className="space-y-4 text-purple-900">
                        <p className="text-sm font-medium">សូមគោរពអញ្ជើញចូលរួមជាអធិបតី</p>
                        <div className="text-xl font-bold bg-white/50 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm">
                            ថ្ងៃទី {day} ខែ {month} ឆ្នាំ {year}
                        </div>
                        {location && (
                            <p className="text-xs md:text-sm mt-4 leading-relaxed max-w-sm mx-auto opacity-80">
                                {location}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <AnniversaryVows wedding={wedding} />
            <AnniversarySchedule wedding={wedding} />
            <AnniversaryGallery wedding={wedding} />
            <AnniversaryLocation wedding={wedding} />
            <AnniversaryGuestbook wedding={wedding} />
            
            <footer className="py-8 text-center text-xs text-purple-900/40 font-medium tracking-widest uppercase">
                Designed with MONEA
            </footer>
        </div>
    );
}
