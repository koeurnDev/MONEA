import React from 'react';
import type { WeddingData } from '../types';
import { MapPin } from 'lucide-react';

export default function AnniversaryLocation({ wedding }: { wedding: WeddingData }) {
    if (!wedding.location) return null;
    const settings = wedding.themeSettings as any;
    const mapLink = settings?.mapLink;
    const title = settings?.customLabels?.locationTitle || "ទីតាំងកម្មវិធី";

    return (
        <div className="py-20 px-6 bg-white flex flex-col items-center justify-center font-kantumruy" id="location">
            <div className="max-w-2xl mx-auto text-center space-y-12 w-full">
                
                <div className="flex flex-col items-center gap-3">
                    <MapPin className="w-8 h-8 text-purple-400" />
                    <h2 className="text-2xl md:text-3xl font-black text-purple-900 tracking-wider font-khmer-moul">
                        {title}
                    </h2>
                </div>

                <div className="bg-purple-50/50 p-8 rounded-3xl border border-purple-100 shadow-sm space-y-6">
                    <p className="text-purple-900 leading-relaxed">
                        {wedding.location}
                    </p>
                    
                    {mapLink && (
                        <a 
                            href={mapLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-md shadow-purple-200"
                        >
                            <MapPin size={18} />
                            បើកមើលទីតាំងលើផែនទី
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
