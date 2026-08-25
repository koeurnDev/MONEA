import * as React from 'react';
import { m } from 'framer-motion';
import { WeddingData } from '../types';
import { RevealSection } from '../shared/CinematicComponents';

interface DynamicGalleryProps {
    wedding: WeddingData;
    galleryImages: string[];
    dynamicPool: string[];
    preWeddingPan1: any;
    preWeddingPan2: any;
    preWeddingPan3: any;
    preWeddingPan4: any;
    preWeddingPan5: any;
    preWeddingPan6: any;
}

export function DynamicGallery({ 
    wedding, 
    galleryImages = [],
    dynamicPool = [],
    preWeddingPan1,
    preWeddingPan2,
    preWeddingPan3,
    preWeddingPan4,
    preWeddingPan5,
    preWeddingPan6
}: DynamicGalleryProps) {
    const pans = [preWeddingPan1, preWeddingPan2, preWeddingPan3, preWeddingPan4, preWeddingPan5, preWeddingPan6];
    
    const DEFAULT_GALLERY = [
        "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg",
        "/assets/khmer-legacy/621811002_905396558712142_5126771807004187076_n.jpg",
        "/assets/khmer-legacy/621811942_905392918712506_8600818650624857202_n.jpg",
        "/assets/khmer-legacy/621813168_905393265379138_2356104923368506186_n.jpg",
        "/assets/khmer-legacy/622279784_905392782045853_1189842078802821714_n.jpg",
        "/assets/khmer-legacy/622374686_905392995379165_1001573724208229331_n.jpg",
    ];

    // Aggregate all unique images
    const allRawImages = [...(galleryImages || []), ...(dynamicPool || [])];
    let images = Array.from(new Set(allRawImages.filter(Boolean)));
    if (images.length === 0) {
        images = DEFAULT_GALLERY;
    }

    // Group into alternating 2-image pairs
    const imagePairs: { left: string; right?: string; leftIdx: number; rightIdx?: number }[] = [];
    for (let i = 0; i < images.length; i += 2) {
        imagePairs.push({
            left: images[i],
            right: images[i + 1] || undefined,
            leftIdx: i,
            rightIdx: images[i + 1] ? i + 1 : undefined,
        });
    }

    const titleText = wedding.themeSettings?.customLabels?.galleryTitle || "វិចិត្រសាល";

    return (
        <section id="gallery-sections" className="py-10 md:py-20 px-3 sm:px-6 md:px-12 bg-white relative overflow-hidden font-kantumruy">
            {/* Background subtle luxury watermark */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] md:w-[1000px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)] pointer-events-none" />

            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative z-10">
                {/* Section Title */}
                <RevealSection>
                    <div className="text-center space-y-2 mb-6 sm:mb-8">
                        <h2 className="font-khmer-moul text-2xl sm:text-3xl md:text-4xl text-gold-gradient text-gold-embossed tracking-wide leading-relaxed py-1">
                            {titleText}
                        </h2>
                        <div className="w-16 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mx-auto" />
                    </div>
                </RevealSection>

                {/* Alternating 2-Column Photo Collage Grid (Matching User Reference) */}
                <div className="space-y-3 sm:space-y-4">
                    {imagePairs.map((pair, pairIdx) => {
                        const isEven = pairIdx % 2 === 0;

                        // Single trailing image if odd count
                        if (!pair.right) {
                            return (
                                <RevealSection key={pairIdx} delay={0.1}>
                                    <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-white p-1 rounded-2xl sm:rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#D4AF37]/20 overflow-hidden relative group">
                                        <img 
                                            src={pair.left} 
                                            className={`w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform duration-700 group-hover:scale-105 ${pans[pair.leftIdx % pans.length]?.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                            style={{
                                                objectPosition: `${pans[pair.leftIdx % pans.length]?.localX} ${pans[pair.leftIdx % pans.length]?.localY}`,
                                                userSelect: 'none',
                                                touchAction: 'none'
                                            }}
                                            onMouseDown={pans[pair.leftIdx % pans.length]?.onStart}
                                            onTouchStart={pans[pair.leftIdx % pans.length]?.onStart}
                                            draggable={false}
                                            alt={`Gallery ${pair.leftIdx}`}
                                        />
                                    </div>
                                </RevealSection>
                            );
                        }

                        // Alternating Pair: Even = (Portrait 5/12 + Landscape 7/12), Odd = (Landscape 7/12 + Portrait 5/12)
                        return (
                            <RevealSection key={pairIdx} delay={0.06 * (pairIdx % 4)}>
                                <div className="grid grid-cols-12 gap-2.5 sm:gap-4 items-center">
                                    {isEven ? (
                                        <>
                                            {/* Left: Portrait 5/12 */}
                                            <div className="col-span-5 aspect-[3/4] bg-white p-1 rounded-2xl sm:rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#D4AF37]/20 overflow-hidden relative group">
                                                <img 
                                                    src={pair.left} 
                                                    className={`w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform duration-700 group-hover:scale-105 ${pans[pair.leftIdx % pans.length]?.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                    style={{
                                                        objectPosition: `${pans[pair.leftIdx % pans.length]?.localX} ${pans[pair.leftIdx % pans.length]?.localY}`,
                                                        userSelect: 'none',
                                                        touchAction: 'none'
                                                    }}
                                                    onMouseDown={pans[pair.leftIdx % pans.length]?.onStart}
                                                    onTouchStart={pans[pair.leftIdx % pans.length]?.onStart}
                                                    draggable={false}
                                                    alt={`Gallery ${pair.leftIdx}`}
                                                />
                                            </div>

                                            {/* Right: Landscape 7/12 */}
                                            <div className="col-span-7 aspect-[4/3] bg-white p-1 rounded-2xl sm:rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#D4AF37]/20 overflow-hidden relative group">
                                                <img 
                                                    src={pair.right} 
                                                    className={`w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform duration-700 group-hover:scale-105 ${pans[pair.rightIdx! % pans.length]?.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                    style={{
                                                        objectPosition: `${pans[pair.rightIdx! % pans.length]?.localX} ${pans[pair.rightIdx! % pans.length]?.localY}`,
                                                        userSelect: 'none',
                                                        touchAction: 'none'
                                                    }}
                                                    onMouseDown={pans[pair.rightIdx! % pans.length]?.onStart}
                                                    onTouchStart={pans[pair.rightIdx! % pans.length]?.onStart}
                                                    draggable={false}
                                                    alt={`Gallery ${pair.rightIdx}`}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Left: Landscape 7/12 */}
                                            <div className="col-span-7 aspect-[16/10] bg-white p-1 rounded-2xl sm:rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#D4AF37]/20 overflow-hidden relative group">
                                                <img 
                                                    src={pair.left} 
                                                    className={`w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform duration-700 group-hover:scale-105 ${pans[pair.leftIdx % pans.length]?.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                    style={{
                                                        objectPosition: `${pans[pair.leftIdx % pans.length]?.localX} ${pans[pair.leftIdx % pans.length]?.localY}`,
                                                        userSelect: 'none',
                                                        touchAction: 'none'
                                                    }}
                                                    onMouseDown={pans[pair.leftIdx % pans.length]?.onStart}
                                                    onTouchStart={pans[pair.leftIdx % pans.length]?.onStart}
                                                    draggable={false}
                                                    alt={`Gallery ${pair.leftIdx}`}
                                                />
                                            </div>

                                            {/* Right: Portrait 5/12 */}
                                            <div className="col-span-5 aspect-[3/4] bg-white p-1 rounded-2xl sm:rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#D4AF37]/20 overflow-hidden relative group">
                                                <img 
                                                    src={pair.right} 
                                                    className={`w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform duration-700 group-hover:scale-105 ${pans[pair.rightIdx! % pans.length]?.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                    style={{
                                                        objectPosition: `${pans[pair.rightIdx! % pans.length]?.localX} ${pans[pair.rightIdx! % pans.length]?.localY}`,
                                                        userSelect: 'none',
                                                        touchAction: 'none'
                                                    }}
                                                    onMouseDown={pans[pair.rightIdx! % pans.length]?.onStart}
                                                    onTouchStart={pans[pair.rightIdx! % pans.length]?.onStart}
                                                    draggable={false}
                                                    alt={`Gallery ${pair.rightIdx}`}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </RevealSection>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
