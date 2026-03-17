import { m } from "framer-motion";
import Image from "next/image";
import { RevealSection, CinematicPlaceholder } from "../shared/CinematicComponents";
import { WeddingData } from "../types";

interface SignatureMomentsProps {
    wedding: WeddingData;
    galleryImages: string[];
    signaturePan1: any;
    signaturePan2: any;
    signaturePan3: any;
}

export function SignatureMoments({ 
    wedding,
    galleryImages,
    signaturePan1,
    signaturePan2,
    signaturePan3
}: SignatureMomentsProps) {
    if (galleryImages.length === 0) return null;

    return (
        <section id="signature-moments" className="w-full py-32 md:py-64 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <RevealSection className="space-y-8 mb-24 md:mb-32">
                    <div className="text-center space-y-4">
                        <div className="h-[1px] w-24 bg-gold/10 mx-auto" />
                        <h2 className="font-khmer-moul text-[15px] md:text-5xl text-gold-gradient text-gold-embossed whitespace-nowrap py-2">
                            {wedding.themeSettings?.customLabels?.galleryTitle || "កម្រងរូបភាពអនុស្សាវរីយ៍"}
                        </h2>
                        <p className="font-khmer text-xs md:text-sm text-gold/40 tracking-[0.4em] uppercase font-bold">
                            {wedding.themeSettings?.customLabels?.gallerySubtitle || "PRE-WEDDING PHOTOS"}
                        </p>
                    </div>
                </RevealSection>

                {/* STRUCTURED TRIPTYCH LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-12 relative">
                    {/* Image 1 */}
                    <RevealSection delay={0.1}>
                        <div className="flex flex-col gap-6">
                            <div 
                                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl md:shadow-2xl border border-gold/10 bg-gold/5"
                            >
                                {galleryImages[6] ? (
                                    <Image 
                                        src={galleryImages[6]} 
                                        fill 
                                        className={`object-cover transition-all duration-[2000ms] ${signaturePan1.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-110'}`} 
                                        style={{ 
                                            objectPosition: `${signaturePan1.localX} ${signaturePan1.localY}`,
                                            userSelect: 'none',
                                            touchAction: 'none'
                                        }}
                                        onMouseDown={signaturePan1.onStart}
                                        onTouchStart={signaturePan1.onStart}
                                        draggable={false}
                                        alt="Signature Moment 1" 
                                        sizes="(max-width: 768px) 100vw, 30vw" 
                                        loading="lazy" 
                                    />
                                ) : (
                                    <CinematicPlaceholder label="រូបភាព" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </RevealSection>

                    {/* Image 2 (Center Focus) */}
                    <RevealSection delay={0.2}>
                        <div className="flex flex-col gap-6 -mt-4 md:mt-0">
                            <div 
                                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(212,175,55,0.15)] md:shadow-[0_40px_100px_-20px_rgba(212,175,55,0.2)] border-2 border-gold/20 md:scale-105 z-10 bg-gold/5"
                            >
                                {galleryImages[7] ? (
                                    <Image 
                                        src={galleryImages[7]} 
                                        fill 
                                        className={`object-cover transition-all duration-[2s] ${signaturePan2.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-110'}`} 
                                        style={{ 
                                            objectPosition: `${signaturePan2.localX} ${signaturePan2.localY}`,
                                            userSelect: 'none',
                                            touchAction: 'none'
                                        }}
                                        onMouseDown={signaturePan2.onStart}
                                        onTouchStart={signaturePan2.onStart}
                                        draggable={false}
                                        alt="Signature Moment 2" 
                                        sizes="(max-width: 768px) 100vw, 30vw" 
                                        loading="lazy" 
                                    />
                                ) : (
                                    <CinematicPlaceholder label="រូបភាព" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </RevealSection>

                    {/* Image 3 */}
                    <RevealSection delay={0.3}>
                        <div className="flex flex-col gap-6 -mt-4 md:mt-0">
                            <div 
                                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl md:shadow-2xl border border-gold/10 bg-gold/5"
                            >
                                {galleryImages[8] ? (
                                    <Image 
                                        src={galleryImages[8]} 
                                        fill 
                                        className={`object-cover transition-all duration-[2s] ${signaturePan3.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-110'}`} 
                                        style={{ 
                                            objectPosition: `${signaturePan3.localX} ${signaturePan3.localY}`,
                                            userSelect: 'none',
                                            touchAction: 'none'
                                        }}
                                        onMouseDown={signaturePan3.onStart}
                                        onTouchStart={signaturePan3.onStart}
                                        draggable={false}
                                        alt="Signature Moment 3" 
                                        sizes="(max-width: 768px) 100vw, 30vw" 
                                        loading="lazy" 
                                    />
                                ) : (
                                    <CinematicPlaceholder label="រូបភាព" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </RevealSection>
                </div>

                <div className="text-center mt-32 space-y-16">
                    <div className="max-w-3xl mx-auto space-y-8">
                        
                        <p className="font-khmer-content text-gray-600 leading-[2] md:leading-[2.5] text-sm md:text-xl italic px-8 relative z-10">
                            {wedding.themeSettings?.customLabels?.thankYouMessage || "យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅបំផុតចំពោះការផ្តល់កិត្តិយសចូលរួម ក្នុងពិធីរបស់យើងខ្ញុំ និងសូមជូនពរឱ្យទទួលបាននូវព្រះពុទ្ធពរ ៤ ប្រការគឺ អាយុ វណ្ណៈ សុខៈ ពលៈ កុំបីឃ្លៀងឃ្លាតឡើយ។"}
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-8">
                        <div className="h-[1px] w-12 bg-gold/20" />
                        <div className="space-y-6 font-serif-kh-bold text-xl md:text-4xl text-gold-gradient tracking-[0.2em] relative">
                            <p>{wedding.groomName}</p>
                            <p className="font-playfair italic text-white/20 text-sm md:text-xl tracking-widest lowercase">and</p>
                            <p>{wedding.brideName}</p>
                        </div>
                        <div className="h-[1px] w-12 bg-gold/20" />
                    </div>
                </div>
            </div>
        </section>
    );
}
