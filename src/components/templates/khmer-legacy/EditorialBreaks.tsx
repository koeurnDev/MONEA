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
        <section id="editorial-breaks" className="w-full bg-[#FDFBF7] space-y-24 md:space-y-32 overflow-hidden py-16 md:py-32">
            {/* Split 1 */}
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-0">
                <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-[3/4] bg-gold-main/5 relative overflow-hidden order-1 md:order-1 shadow-[40px_0_100px_-20px_rgba(0,0,0,0.1)]">
                    {galleryImages[1 % galleryImages.length] ? (
                        <Image 
                            src={galleryImages[1 % galleryImages.length]} 
                            fill 
                            className={`object-cover transition-all duration-3000 ease-out ${editorialPan1.isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-110'}`} 
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
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-16 space-y-10 md:space-y-12 order-2 md:order-2 flex flex-col justify-center text-center md:text-left">
                    <RevealSection>
                        <div className="space-y-8 md:space-y-12">
                            <span className="font-playfair italic text-gold-main text-xl md:text-3xl opacity-80 tracking-wider">The Beginning</span>
                            <h3 className="font-playfair text-4xl md:text-7xl font-black text-slate-800 leading-tight">
                                {wedding.themeSettings?.editorialText1 || "A Love Story in Every Frame"}
                            </h3>
                            <div className="w-24 h-[1.5px] bg-gold-main/30 mx-auto md:mx-0" />
                        </div>
                    </RevealSection>
                </div>
            </div>

            {/* Split 2 */}
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-0">
                <div className="w-full md:w-1/2 p-6 md:p-16 space-y-10 md:space-y-12 order-2 md:order-1 flex flex-col justify-center text-center md:text-right">
                    <RevealSection>
                        <div className="space-y-8 md:space-y-12 flex flex-col items-center md:items-end">
                            <span className="font-playfair italic text-gold-main text-xl md:text-3xl opacity-80 tracking-wider">The Journey</span>
                            <h3 className="font-playfair text-4xl md:text-7xl font-black text-slate-800 leading-tight">
                                {wedding.themeSettings?.editorialText2 || "Captured with Soul & Elegance"}
                            </h3>
                            <div className="w-24 h-[1.5px] bg-gold-main/30 mx-auto md:mr-0 md:ml-0" />
                        </div>
                    </RevealSection>
                </div>
                <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-[3/4] bg-gold-main/5 relative overflow-hidden order-1 md:order-2 shadow-[-40px_0_100px_-20px_rgba(0,0,0,0.1)]">
                    {galleryImages[7 % galleryImages.length] ? (
                        <Image 
                            src={galleryImages[7 % galleryImages.length]} 
                            fill 
                            className={`object-cover transition-all duration-3000 ease-out ${editorialPan2.isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-110'}`} 
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
                    <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Full Width Break */}
            <div className="w-full py-16 md:py-32 px-4 md:px-12 relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none premium-texture" />
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-40 items-center">
                    <div className="space-y-12 md:space-y-20">
                        <RevealSection>
                            <h2 className="font-playfair text-5xl md:text-9xl font-black text-gold-main/5 leading-[0.8] tracking-tighter uppercase mb-6 md:mb-10 select-none drop-shadow-sm">Elegance</h2>
                            <div className="space-y-8 md:space-y-12 pl-6 md:pl-16 border-l-[3px] border-gold-main/20">
                                <p className="font-playfair italic text-slate-500 text-xl md:text-3xl tracking-widest">Visual Poetry</p>
                                <h3 className="font-playfair text-4xl md:text-6xl font-black text-slate-800 leading-[1.2]">
                                    {wedding.themeSettings?.editorialText3 || "Preserving the magic of your special day"}
                                </h3>
                            </div>
                        </RevealSection>
                    </div>
                    <div className="aspect-[4/3] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative bg-gold-main/5 border-[12px] md:border-[20px] border-white ring-1 ring-gold-main/10 group">
                        {galleryImages[3] ? (
                            <Image 
                                src={galleryImages[3]} 
                                fill 
                                className={`object-cover transition-all duration-2000 ease-out ${editorialPan3.isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab group-hover:scale-110'}`} 
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Editorial 4 - Panoramic */}
            <div className="w-full py-16 md:py-32 bg-white/30 backdrop-blur-sm flex flex-col items-center px-4 relative overflow-hidden border-y border-gold-main/5">
                <div className="absolute top-0 w-96 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
                <RevealSection>
                    <div className="w-full aspect-[16/9] md:aspect-[21/7] overflow-hidden relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] rounded-[3rem] md:rounded-none bg-gold-main/5 group">
                        {galleryImages[4] ? (
                            <Image 
                                src={galleryImages[4]} 
                                className={`w-full h-full object-cover transition-all duration-3000 ease-out ${editorialPan4.isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab group-hover:scale-[1.05]'}`} 
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
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    </div>
                </RevealSection>
                <div className="absolute bottom-0 w-96 h-[1.5px] bg-gradient-to-r from-transparent via-gold-main/20 to-transparent" />
            </div>
        </section>
    );
}

export function SaverDateSection({ formattedDateInvitation }: { formattedDateInvitation: string }) {
    return (
        <section className="px-8 md:px-12 py-16 md:py-32 border-t border-gold-main/10 bg-[#FAF9F6]/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none premium-texture" />
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
                <RevealSection 
                    delay={0.4} 
                    className="flex-1 cursor-pointer w-full"
                >
                    <div className="space-y-10 md:space-y-16 text-center md:text-left relative">
                         <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="w-12 h-[1px] bg-gold-main/20" />
                            <div className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[1em] uppercase font-black text-gold-main/80 italic leading-relaxed">រក្សាទុកកាលបរិច្ឆេទ</div>
                        </div>
                        <div className="space-y-4 md:space-y-8">
                            <p className="font-playfair text-5xl md:text-8xl font-black tracking-tighter text-slate-800 drop-shadow-sm leading-tight">
                                {formattedDateInvitation || "12 . 04 . 2026"}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-gold-main/40">
                                <m.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <div className="w-2 h-2 rounded-full bg-current" />
                                </m.div>
                                <div className="h-[1px] w-32 bg-current" />
                                <div className="font-playfair italic text-xl md:text-2xl font-black">SAVE THE DATE</div>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}
