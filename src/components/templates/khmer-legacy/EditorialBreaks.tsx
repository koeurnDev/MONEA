"use client";

import Image from 'next/image';
import { m } from 'framer-motion';
import { WeddingData } from '../types';
import { RevealSection, CinematicPlaceholder } from '../shared/CinematicComponents';

interface EditorialBreaksProps {
    wedding: WeddingData;
    galleryImages: string[];
    editorialPan1: any;
    editorialPan2: any;
    editorialPan3: any;
    editorialPan4: any;
}

export function EditorialBreaks({ 
    wedding, 
    galleryImages,
    editorialPan1,
    editorialPan2,
    editorialPan3,
    editorialPan4
}: EditorialBreaksProps) {
    return (
        <section id="editorial-breaks" className="w-full bg-white space-y-32 md:space-y-64 overflow-hidden">
            {/* Split 1 */}
            <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-[4/5] bg-gray-50 relative overflow-hidden order-1 md:order-1">
                    {galleryImages[1 % galleryImages.length] ? (
                        <Image 
                            src={galleryImages[1 % galleryImages.length]} 
                            fill 
                            className={`object-cover ${editorialPan1.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'} transition-all duration-[1500ms]`} 
                            style={{ 
                                objectPosition: `${editorialPan1.localX} ${editorialPan1.localY}`,
                                userSelect: 'none',
                                touchAction: 'none'
                            }}
                            onMouseDown={editorialPan1.onStart}
                            onTouchStart={editorialPan1.onStart}
                            draggable={false}
                            alt="Editorial 1" 
                            sizes="50vw" 
                            loading="lazy" 
                        />
                    ) : (
                        <CinematicPlaceholder label="Editorial Moment" />
                    )}
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-24 space-y-8 md:space-y-12 order-2 md:order-2 flex flex-col justify-center text-center md:text-left">
                    <RevealSection>
                        <div className="space-y-6 md:space-y-8">
                            <span className="font-serif-elegant italic text-gold text-lg md:text-2xl opacity-60">The Beginning</span>
                            <h3 className="font-playfair text-3xl md:text-6xl font-black text-gray-800 leading-tight">
                                {wedding.themeSettings?.editorialText1 || "A Love Story in Every Frame"}
                            </h3>
                            <div className="w-12 h-[1px] bg-gold/30 mx-auto md:mx-0" />
                        </div>
                    </RevealSection>
                </div>
            </div>

            {/* Split 2 */}
            <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 p-8 md:p-24 space-y-8 md:space-y-12 order-2 md:order-1 flex flex-col justify-center text-center md:text-right">
                    <RevealSection>
                        <div className="space-y-6 md:space-y-8 flex flex-col items-center md:items-end">
                            <span className="font-serif-elegant italic text-gold text-lg md:text-2xl opacity-60">The Journey</span>
                            <h3 className="font-playfair text-3xl md:text-6xl font-black text-gray-800 leading-tight">
                                {wedding.themeSettings?.editorialText2 || "Captured with Soul & Elegance"}
                            </h3>
                            <div className="w-12 h-[1px] bg-gold/30 mx-auto md:mr-0 md:ml-0" />
                        </div>
                    </RevealSection>
                </div>
                <div className="w-full md:w-1/2 aspect-[4/5] bg-gray-50 relative overflow-hidden order-1 md:order-2">
                    {galleryImages[7 % galleryImages.length] ? (
                        <Image 
                            src={galleryImages[7 % galleryImages.length]} 
                            fill 
                            className={`object-cover ${editorialPan2.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-105'} transition-all duration-[1500ms]`} 
                            style={{ 
                                objectPosition: `${editorialPan2.localX} ${editorialPan2.localY}`,
                                userSelect: 'none',
                                touchAction: 'none'
                            }}
                            onMouseDown={editorialPan2.onStart}
                            onTouchStart={editorialPan2.onStart}
                            draggable={false}
                            alt="Editorial 2" 
                            sizes="50vw" 
                            loading="lazy" 
                        />
                    ) : (
                        <CinematicPlaceholder label="រូបភាព" />
                    )}
                </div>
            </div>

            {/* Full Width Break */}
            <div className="w-full py-16 md:py-32 px-4 md:px-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-32 items-center">
                    <div className="space-y-8 md:space-y-12">
                        <RevealSection>
                            <h2 className="font-playfair text-4xl md:text-8xl font-black text-gray-900/10 leading-[0.8] tracking-tighter uppercase mb-4 md:mb-8 select-none">Elegance</h2>
                            <div className="space-y-6 md:space-y-8 pl-4 md:pl-12 border-l-2 border-gold/20">
                                <p className="font-serif-elegant italic text-gray-400 text-lg md:text-2xl">Visual Poetry</p>
                                <h3 className="font-playfair text-3xl md:text-5xl font-black text-gray-800 leading-tight">
                                    {wedding.themeSettings?.editorialText3 || "Preserving the magic of your special day"}
                                </h3>
                            </div>
                        </RevealSection>
                    </div>
                    <div className="aspect-[4/3] md:aspect-[4/3] rounded-sm overflow-hidden shadow-2xl relative bg-gold/5 border border-gold/5">
                        {galleryImages[3] ? (
                            <Image 
                                src={galleryImages[3]} 
                                fill 
                                className={`object-cover ${editorialPan3.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-110'} transition-all duration-1000`} 
                                style={{ 
                                    objectPosition: `${editorialPan3.localX} ${editorialPan3.localY}`,
                                    userSelect: 'none',
                                    touchAction: 'none'
                                }}
                                onMouseDown={editorialPan3.onStart}
                                onTouchStart={editorialPan3.onStart}
                                draggable={false}
                                alt="Story Moment 3" 
                                sizes="50vw" 
                                loading="lazy" 
                            />
                        ) : (
                            <CinematicPlaceholder label="Featured Story" />
                        )}
                    </div>
                </div>
            </div>

            {/* Editorial 4 - Panoramic */}
            <div className="w-full py-16 md:py-32 bg-[#FAF9F6]/10 flex flex-col items-center px-4 relative overflow-hidden">
                <div className="absolute top-0 w-64 h-[2px] bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                <div className="w-full aspect-[16/9] md:aspect-[21/7] overflow-hidden hover:scale-[1.01] transition-all duration-[2000ms] relative shadow-lg rounded-sm md:rounded-none bg-gold/5">
                    {galleryImages[4] ? (
                        <Image 
                            src={galleryImages[4]} 
                            className={`w-full h-full object-cover ${editorialPan4.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-110'} transition-all duration-1000`} 
                            style={{ 
                                objectPosition: `${editorialPan4.localX} ${editorialPan4.localY}`,
                                userSelect: 'none',
                                touchAction: 'none'
                            }}
                            onMouseDown={editorialPan4.onStart}
                            onTouchStart={editorialPan4.onStart}
                            draggable={false}
                            alt="Story Moment 4" 
                            fill
                            sizes="100vw"
                            priority
                        />
                    ) : (
                        <CinematicPlaceholder label="Panoramic Moment" />
                    )}
                </div>
            </div>
        </section>
    );
}

export function SaverDateSection({ formattedDateInvitation }: { formattedDateInvitation: string }) {
    return (
        <section className="px-4 md:px-12 py-12 md:py-32 border-t border-gray-50 bg-white relative">
            <div className="max-w-6xl mx-auto flex flex-row items-start justify-between gap-6 md:gap-20">
                <RevealSection 
                    delay={0.4} 
                    className="flex-1 cursor-pointer"
                >
                    <div className="space-y-4 md:space-y-8 text-left relative">
                        <div className="text-[7px] md:text-[10px] tracking-[0.6em] uppercase font-black text-gray-400">រក្សាទុកកាលបរិច្ឆេទ</div>
                        <div className="space-y-2 md:space-y-4">
                            <p className="font-playfair text-xl md:text-5xl font-bold tracking-[0.1em] text-gray-800">
                                {formattedDateInvitation}
                            </p>
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}
