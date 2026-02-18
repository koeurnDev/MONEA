"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WishesWallProps {
    weddingId: string;
}

interface Wish {
    id: string;
    guestName: string;
    message: string;
}

export const WishesWall = ({ weddingId }: WishesWallProps) => {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishes = async () => {
            try {
                const res = await fetch(`/api/guestbook?weddingId=${weddingId}`);
                if (res.ok) {
                    const data = await res.json();
                    setWishes(data);
                }
            } catch (error) {
                console.error("Failed to fetch wishes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishes();

        // Optional: Poll for new wishes every 30 seconds
        const interval = setInterval(fetchWishes, 30000);
        return () => clearInterval(interval);
    }, [weddingId]);

    if (loading) return <div className="text-center p-4 text-[#8E5A5A]">កំពុងដំណើរការ...</div>;
    if (wishes.length === 0) return null; // Don't show if no wishes yet

    return (
        <div className="w-full overflow-hidden bg-pink-50/30 py-8">
            <h3 className="text-center font-serif text-[#8E5A5A] text-xl mb-6">ពាក្យជូនពរពីភ្ញៀវកិត្តិយស</h3>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden">
                <div className="flex animate-marquee gap-4 whitespace-nowrap">
                    {/* Duplicate array to create seamless loop if few items, or just map once if many */}
                    {(wishes.length < 5 ? [...wishes, ...wishes, ...wishes, ...wishes] : [...wishes, ...wishes]).map((wish, index) => (
                        <div
                            key={`${wish.id}-${index}`}
                            className="inline-block w-64 bg-white p-4 rounded-xl shadow-sm border border-pink-100 whitespace-normal align-top"
                        >
                            <p className="text-gray-600 text-sm mb-2 italic">&quot;{wish.message}&quot;</p>
                            <p className="text-right font-bold text-[#8E5A5A] text-xs">- {wish.guestName}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .animate-marquee {
          display: flex;
          animation: marquee ${Math.max(20, wishes.length * 5)}s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
      `}</style>
        </div>
    );
};
