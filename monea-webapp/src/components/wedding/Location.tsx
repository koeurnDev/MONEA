import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import Image from "next/image";

interface LocationProps {
    locationName: string;
    mapLink?: string | null; // Allow null to match Prisma type
}

export default function Location({ locationName, mapLink }: LocationProps) {
    return (
        <section className="p-8 bg-zinc-900 text-center text-white font-siemreap">
            <h3 className="text-pink-500 mb-4 font-moul text-xl">ទីតាំងកម្មវិធី</h3>
            <div className="flex flex-col items-center gap-2 mb-6 text-gray-300">
                <MapPin className="w-6 h-6 text-pink-500 mb-2" />
                <p className="text-base leading-relaxed max-w-xs mx-auto">
                    {locationName || "ទីតាំងនឹងជូនដំណឹងពេលក្រោយ"}
                </p>
            </div>

            {/* Map Button */}
            {mapLink && (
                <a
                    href={mapLink}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-pink-900/20 animate-pulse"
                >
                    <Navigation className="w-4 h-4" />
                    មើលទីតាំងលើ Google Maps
                </a>
            )}
        </section>
    );
}
