import React from 'react';
import { Heart } from 'lucide-react';
import { WeddingData } from '../types';

interface ThankYouSectionProps {
    wedding: WeddingData;
    primaryColor: string;
}

export const ThankYouSection: React.FC<ThankYouSectionProps> = ({ wedding, primaryColor }) => {
    const groomName = wedding.groomName || "កូនកំលោះ";
    const brideName = wedding.brideName || "កូនក្រមុំ";

    return (
        <section className="py-16 px-4 sm:px-6 bg-transparent text-[#2d352b] text-center font-kantumruy relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-[#f5efe5] text-[#4d5649] border border-[#d9d1bf] flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl font-serif font-bold">囍</span>
                </div>

                <div className="space-y-2">
                    <span className="text-xl sm:text-2xl font-khmer-moul text-[#4d5649] block">
                        សូមអរគុណ
                    </span>
                    <p className="text-xs sm:text-sm text-[#475448] leading-relaxed max-w-sm mx-auto">
                        វត្តមានដ៏ខ្ពង់ខ្ពស់របស់លោកអ្នក គឺជាកិត្តិយស និងជាសេចក្តីសោមនស្សរីករាយឥតឧបមា សម្រាប់ក្រុមគ្រួសារយើងខ្ញុំទាំងពីរ។
                    </p>
                </div>

                <div className="py-3">
                    <span className="m05-font-name text-lg font-serif italic text-[#2d352b] font-bold">
                        {groomName} & {brideName}
                    </span>
                </div>

                <div className="pt-6 border-t border-[#d9d1bf] text-[10px] text-[#586551] flex items-center justify-center gap-1.5">
                    <span>បង្កើតឡើងដោយក្តីស្រឡាញ់ជាមួយ</span>
                    <span className="font-bold text-[#4d5649] font-outfit uppercase tracking-widest">MONEA</span>
                </div>
            </div>
        </section>
    );
};
