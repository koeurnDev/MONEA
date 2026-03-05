'use client'

import { useState, useEffect } from "react";
import Image from "next/image";

type GalleryItem = {
    id: string;
    url: string;
    type: string;
    caption: string | null;
};

export default function LiveSlideshowPage({ params }: { params: { id: string } }) {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch items periodically
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`/api/gallery/${params.id}`);
                const data = await res.json();
                setItems(prev => {
                    // Only update if length changed to avoid reset? 
                    // Better: just replace for now or check IDs. 
                    // Simple replace is fine for MVP.
                    if (data.items.length !== prev.length) {
                        return data.items;
                    }
                    return prev;
                });
            } catch (error) {
                console.error("Failed to fetch gallery items", error);
            }
        };

        fetchItems();
        const interval = setInterval(fetchItems, 10000); // Check for new photos every 10s
        return () => clearInterval(interval);
    }, [params.id]);

    // Auto Advance
    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }, 5000); // Change slide every 5s
        return () => clearInterval(interval);
    }, [items.length]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-moul animate-pulse">
                <div className="text-2xl mb-4">កំពុងរង់ចាំរូបភាព...</div>
                <p className="font-siemreap text-gray-400">Scan QR to Upload Photos</p>
            </div>
        );
    }

    const currentItem = items[currentIndex];

    return (
        <div className="min-h-screen bg-black overflow-hidden relative flex items-center justify-center">
            {/* Background Blur */}
            <div
                className="absolute inset-0 opacity-30 blur-3xl scale-110 transition-all duration-1000 bg-center bg-cover"
                style={{ backgroundImage: `url(${currentItem.url})` }}
            />

            {/* Main Content */}
            <div className="relative z-10 w-full h-full max-w-5xl max-h-screen p-4 flex items-center justify-center">
                {currentItem.type === 'VIDEO' ? (
                    <video src={currentItem.url} autoPlay muted loop className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                ) : (
                    <div className="relative w-full h-[90vh]">
                        <Image
                            src={currentItem.url}
                            alt="Live Slide"
                            fill
                            className="object-contain rounded-lg shadow-2xl transition-opacity duration-500"
                        />
                    </div>
                )}
            </div>

            {/* Caption Overlay */}
            {currentItem.caption && (
                <div className="absolute bottom-10 left-0 right-0 text-center z-20">
                    <div className="inline-block bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white font-siemreap text-xl">
                        {currentItem.caption}
                    </div>
                </div>
            )}

            {/* QR Code Helper (Optional Overlay) */}
            <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg shadow-lg opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-xs font-bold text-center mb-1">Upload Here</p>
                {/* In real app, put actual QR code here */}
                <div className="w-16 h-16 bg-gray-200" />
            </div>
        </div>
    );
}
