"use client";
import React from 'react';
import { m } from 'framer-motion';
import NextImage from 'next/image';
import { CldImage } from 'next-cloudinary';
import { cn } from './shared';

interface LoveStorySectionProps {
    galleryImages?: string[];
    year?: number;
}

export default function LoveStorySection({ galleryImages = [], storyImages = [], year = 2025, eventType }: { galleryImages?: string[]; storyImages?: string[]; year?: number; eventType?: string }) {
    // Generate stories from storyImages if available, otherwise fall back to galleryImages or defaults
    const sourceImages = (storyImages && storyImages.length > 0) ? storyImages : galleryImages;
    const displayImages = sourceImages.length > 0 ? sourceImages : [
        "/images/gallery1.jpg", "/images/gallery2.jpg", "/images/couple.jpg",
        "/images/cover.jpg", "/images/bg_enchanted.jpg", "/images/bg_staircase.jpg"
    ];

    // Dynamic Image Distribution
    // Split images into two groups for the layout (Top vs Bottom)
    const midPoint = Math.ceil(displayImages.length / 2);
    const topImages = displayImages.slice(0, midPoint).map((img, i) => ({
        year: year - (displayImages.length - i), // Countdown years roughly
        img: img
    }));
    const bottomImages = displayImages.slice(midPoint).map((img, i) => ({
        year: year, // Wedding Year usually
        img: img
    }));

    // If no story images (using fallbacks), restrict to original design count to avoid clutter
    const isFallback = galleryImages.length === 0 && storyImages.length === 0;
    const finalTop = isFallback ? topImages.slice(0, 4) : topImages;
    const finalBottom = isFallback ? bottomImages.slice(0, 3) : bottomImages;

    const Polaroid = ({ item, index }: { item: any, index: number }) => (
        <m.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? "2deg" : "-2deg", zIndex: 10 }}
            className="bg-white p-2 pb-6 shadow-md transform transition-all duration-300 w-[31%] sm:w-28 md:w-36 flex-shrink-0"
            style={{ rotate: index % 2 === 0 ? '-2deg' : '2deg' }}
        >
            <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-2 relative">
                {/* Optimized Image Handling */}
                {item.img.startsWith('http') || item.img.startsWith('/') || item.img.match(/\.(jpeg|jpg|gif|png)$/) ? (
                    <NextImage
                        src={item.img}
                        alt={`Story ${item.year}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 15vw"
                    />
                ) : (
                    <CldImage
                        src={item.img}
                        alt={`Story ${item.year}`}
                        width={400}
                        height={533}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 33vw, 15vw"
                        config={{ url: { analytics: false } }}
                    />
                )}
            </div>
            {/* removed year display if using dynamic story images as dates might be inaccurate, or keep simple index */}
        </m.div>
    );

    return (
        <section className="py-10 w-full overflow-hidden">
            <div className="w-[95%] md:w-full max-w-6xl mx-auto space-y-12 md:px-4">

                {/* Row 1: The Journey */}
                <div className="flex justify-center flex-wrap gap-4 md:gap-8">
                    {finalTop.map((item, idx) => <Polaroid key={`r1-${idx}`} item={item} index={idx} />)}
                </div>

                {/* Middle: Narrative */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 text-center md:text-right font-kantumruy text-white text-lg md:text-xl leading-relaxed max-w-sm drop-shadow-md"
                    >
                        &quot;{eventType === 'anniversary' ? "រាល់ឆ្នាំដែលកន្លងផុតទៅ ធ្វើឲ្យខ្ញុំកាន់តែស្រលាញ់អ្នកខ្លាំងជាងមុន។" : "រឿងរ៉ាវស្នេហាគ្រប់យ៉ាងសុទ្ធតែស្រស់ស្អាត ប៉ុន្តែរឿងរ៉ាវរបស់យើងគឺជារឿងដែលខ្ញុំពេញចិត្តបំផុត។"}&quot;
                    </m.div>

                    {/* Row 2: The Destination (Center) */}
                    {/* If we have a lot of images, render them here. If few, keep layout. */}
                    {finalBottom.length > 0 && (
                        <div className="flex justify-center flex-wrap gap-4 md:gap-8 relative z-10 my-8 md:my-0 order-last md:order-none w-full md:w-auto">
                            {finalBottom.map((item, idx) => <Polaroid key={`r2-${idx}`} item={item} index={idx + 4} />)}
                        </div>
                    )}

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 text-center md:text-left font-kantumruy text-white text-lg md:text-xl leading-relaxed max-w-sm drop-shadow-md"
                    >
                        &quot;{eventType === 'anniversary' ? "អរគុណដែលបាននៅក្បែរខ្ញុំ និងកសាងសុភមង្គលជាមួយគ្នា។" : "ចាប់ពីពេលនេះតទៅ ខ្ញុំសន្យានឹងធ្វើជាផ្ទះ ជាក្តីសុខ និងជាកន្លែងដែលអ្នកអាចពឹងផ្អែកបានជារៀងរហូត។"}&quot;
                        &quot;{eventType === 'anniversary' ? "អរគុណដែលបាននៅក្បែរខ្ញុំ និងកសាងសុភមង្គលជាមួយគ្នា។" : "ចាប់ពីពេលនេះតទៅ ខ្ញុំសន្យានឹងធ្វើជាផ្ទះ ជាក្តីសុខ និងជាកន្លែងដែលអ្នកអាចពឹងពាក់បានជារៀងរហូត។"}&quot;
                    </m.div>
                </div>

            </div>

            <style jsx global>{`
                .font-handwriting {
                    font-family: var(--font-dancing), cursive;
                }
            `}</style>
        </section>
    );
}
