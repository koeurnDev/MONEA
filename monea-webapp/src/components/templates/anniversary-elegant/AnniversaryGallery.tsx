import React from 'react';
import type { WeddingData } from '../types';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';

export default function AnniversaryGallery({ wedding }: { wedding: WeddingData }) {
    const validItems = wedding.galleryItems?.filter(i => i.url) || [];
    if (validItems.length === 0) return null;
    
    const settings = wedding.themeSettings as any;
    const title = settings?.customLabels?.galleryTitle || "អនុស្សាវរីយ៍របស់យើង";

    return (
        <div className="py-20 px-6 bg-purple-50/50 flex flex-col items-center justify-center font-kantumruy" id="gallery">
            <div className="max-w-4xl mx-auto w-full space-y-12">
                
                <div className="flex flex-col items-center gap-3 text-center">
                    <ImageIcon className="w-8 h-8 text-purple-400" />
                    <h2 className="text-2xl md:text-3xl font-black text-purple-900 tracking-wider font-khmer-moul">
                        {title}
                    </h2>
                </div>

                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {validItems.map((item, idx) => (
                        <div key={idx} className="relative w-full rounded-2xl overflow-hidden shadow-sm break-inside-avoid group">
                            <Image
                                src={item.url}
                                alt={`Gallery ${idx}`}
                                width={500}
                                height={700}
                                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                unoptimized={item.url.startsWith('http')}
                            />
                        </div>
                    ))}
                </div>
                
            </div>
        </div>
    );
}
