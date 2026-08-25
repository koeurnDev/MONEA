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
        <section id="editorial-breaks" className="w-full bg-[#FAF9F6] space-y-12 md:space-y-24 overflow-hidden py-10 md:py-20 px-4 md:px-12">
            {/* Split 1 */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 aspect-[4/5] bg-gold-main/5 relative overflow-hidden rounded-[2rem] shadow-xl">
                    {galleryImages[1 % galleryImages.length] ? (
                        <img 
                            src={galleryImages[1 % galleryImages.length]}  
                            className={`w-full h-full object-cover transition-all duration-1000 ${editorialPan1.isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'}`} 
                            style={{ 
                                objectPosition: `${editorialPan1.localX} ${editorialPan1.localY}`,
                                userSelect: 'none',
                                touchAction: 'none'
                            }}
                            onMouseDown={editorialPan1.onStart}
                            onTouchStart={editorialPan1.onStart}
                            draggable={false}
                            alt="Editorial 1" 
                            loading="lazy" 
                        />
                    ) : (
                        <CinematicPlaceholder label="Editorial Moment" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="w-full md:w-1/2 p-4 md:p-8 space-y-4 md:space-y-6 flex flex-col justify-center text-center md:text-left">
                    <RevealSection>
                        <div className="space-y-3 md:space-y-4">
                            <span className="font-playfair italic text-[#9C7A3C] text-sm md:text-lg tracking-wider">The Beginning</span>
                            <h3 className="font-playfair text-2xl sm:text-3xl md:text-5xl font-black text-slate-800 leading-tight">
                                {wedding.themeSettings?.editorialText1 || "A Love Story in Every Frame"}
                            </h3>
                            <div className="w-16 h-[2px] bg-[#9C7A3C]/30 mx-auto md:mx-0" />
                        </div>
                    </RevealSection>
                </div>
            </div>

            {/* Split 2 */}
            <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 p-4 md:p-8 space-y-4 md:space-y-6 flex flex-col justify-center text-center md:text-right">
                    <RevealSection>
                        <div className="space-y-3 md:space-y-4 flex flex-col items-center md:items-end">
                            <span className="font-playfair italic text-[#9C7A3C] text-sm md:text-lg tracking-wider">The Journey</span>
                            <h3 className="font-playfair text-2xl sm:text-3xl md:text-5xl font-black text-slate-800 leading-tight">
                                {wedding.themeSettings?.editorialText2 || "Captured with Soul & Elegance"}
                            </h3>
                            <div className="w-16 h-[2px] bg-[#9C7A3C]/30 mx-auto md:mr-0" />
                        </div>
                    </RevealSection>
                </div>
                <div className="w-full md:w-1/2 aspect-[4/5] bg-gold-main/5 relative overflow-hidden rounded-[2rem] shadow-xl">
                    {galleryImages[7 % galleryImages.length] ? (
                        <img 
                            src={galleryImages[7 % galleryImages.length]}  
                            className={`w-full h-full object-cover transition-all duration-1000 ${editorialPan2.isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'}`} 
                            style={{ 
                                objectPosition: `${editorialPan2.localX} ${editorialPan2.localY}`,
                                userSelect: 'none',
                                touchAction: 'none'
                            }}
                            onMouseDown={editorialPan2.onStart}
                            onTouchStart={editorialPan2.onStart}
                            draggable={false}
                            alt="Editorial 2" 
                            loading="lazy" 
                        />
                    ) : (
                        <CinematicPlaceholder label="រូបភាព" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Full Width Break */}
            <div className="max-w-6xl mx-auto py-8 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div className="space-y-6 md:space-y-8 text-center md:text-left">
                        <RevealSection>
                            <span className="font-playfair italic text-[#9C7A3C] text-sm md:text-lg tracking-wider">Visual Poetry</span>
                            <h3 className="font-playfair text-2xl sm:text-3xl md:text-5xl font-black text-slate-800 leading-tight mt-2">
                                {wedding.themeSettings?.editorialText3 || "Preserving the magic of your special day"}
                            </h3>
                            <div className="w-16 h-[2px] bg-[#9C7A3C]/30 mx-auto md:mx-0 mt-3" />
                        </RevealSection>
                    </div>
                    <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl relative bg-gold-main/5 border-4 border-white">
                        {galleryImages[3] ? (
                            <img 
                                src={galleryImages[3]}  
                                className={`w-full h-full object-cover transition-all duration-1000 ${editorialPan3.isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'}`} 
                                style={{ 
                                    objectPosition: `${editorialPan3.localX} ${editorialPan3.localY}`,
                                    userSelect: 'none',
                                    touchAction: 'none'
                                }}
                                onMouseDown={editorialPan3.onStart}
                                onTouchStart={editorialPan3.onStart}
                                draggable={false}
                                alt="Editorial 3" 
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
            <div className="max-w-6xl mx-auto py-6 md:py-12">
                <RevealSection>
                    <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden relative shadow-xl rounded-[2rem] bg-gold-main/5">
                        {galleryImages[4] ? (
                            <img 
                                src={galleryImages[4]} 
                                className={`w-full h-full object-cover transition-all duration-1000 ${editorialPan4.isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'}`} 
                                style={{ 
                                    objectPosition: `${editorialPan4.localX} ${editorialPan4.localY}`,
                                    userSelect: 'none',
                                    touchAction: 'none'
                                }}
                                onMouseDown={editorialPan4.onStart}
                                onTouchStart={editorialPan4.onStart}
                                draggable={false}
                                alt="Story Moment 4" 
                            />
                        ) : (
                            <CinematicPlaceholder label="Panoramic Moment" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}

export function SaverDateSection({ formattedDateInvitation }: { formattedDateInvitation: string }) {
    return (
        <section className="px-6 py-12 md:py-20 bg-[#FAF9F6] border-y border-amber-200/40 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
                <RevealSection delay={0.2}>
                    <div className="space-y-3">
                        {/* Subtitle */}
                        <div className="flex items-center justify-center gap-3">
                            <span className="w-8 h-[1px] bg-[#9C7A3C]/40" />
                            <span className="font-khmer-moul text-xs text-[#9C7A3C] tracking-wide">
                                រក្សាទុកកាលបរិច្ឆេទ
                            </span>
                            <span className="w-8 h-[1px] bg-[#9C7A3C]/40" />
                        </div>

                        {/* Date Typography */}
                        <h2 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-[#0A1226] leading-relaxed drop-shadow-sm">
                            {formattedDateInvitation || "ថ្ងៃសៅរ៍ ទី៤ ខែមេសា ឆ្នាំ២០២៦"}
                        </h2>

                        {/* Save The Date Pill */}
                        <div className="flex items-center justify-center gap-3 pt-2 text-[#9C7A3C]/70">
                            <span className="h-[1px] w-12 bg-current" />
                            <span className="font-playfair italic text-xs sm:text-sm font-bold tracking-widest uppercase">
                                SAVE THE DATE
                            </span>
                            <span className="h-[1px] w-12 bg-current" />
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}
