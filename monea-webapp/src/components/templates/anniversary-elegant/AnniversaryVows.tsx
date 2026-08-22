import React from 'react';
import type { WeddingData } from '../types';
import { Heart } from 'lucide-react';

export default function AnniversaryVows({ wedding }: { wedding: WeddingData }) {
    const settings = wedding.themeSettings as any;
    
    // Fallbacks if not provided
    const vowsTitle = settings?.customLabels?.vowsTitleAnniv || "សារជូនពរ និងសម្រង់សម្តី";
    const groomVows = settings?.groomVows || "រីករាយខួបអាពាហ៍ពិពាហ៍ អរគុណសម្រាប់ការស្រលាញ់និងមើលថែអូនរហូតមក។";
    const brideVows = settings?.brideVows || "រីករាយខួបអាពាហ៍ពិពាហ៍ អរគុណដែលតែងតែផ្តល់ស្នាមញញឹមដល់បង។";
    
    return (
        <div className="py-20 px-6 bg-purple-50/30 flex flex-col items-center justify-center font-kantumruy" id="vows">
            <div className="max-w-2xl mx-auto text-center space-y-12">
                
                <div className="flex flex-col items-center gap-3">
                    <Heart className="w-8 h-8 text-purple-400" />
                    <h2 className="text-2xl md:text-3xl font-black text-purple-900 tracking-wider font-khmer-moul">
                        {vowsTitle}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
                    {/* Divider for desktop */}
                    <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-purple-200 -translate-x-1/2" />
                    
                    <div className="space-y-4 text-center md:text-right pr-0 md:pr-8">
                        <h4 className="text-lg font-bold text-purple-800">{wedding.groomName}</h4>
                        <p className="text-sm leading-relaxed text-purple-900/70 italic">
                            &quot;{groomVows}&quot;
                        </p>
                    </div>
                    
                    <div className="space-y-4 text-center md:text-left pl-0 md:pl-8">
                        <h4 className="text-lg font-bold text-purple-800">{wedding.brideName}</h4>
                        <p className="text-sm leading-relaxed text-purple-900/70 italic">
                            &quot;{brideVows}&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
