"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { useState } from "react";

interface InteractiveMapProps {
    locationName: string;
    mapLink?: string; // Optional: specific Google Maps link
}

export const InteractiveMap = ({ locationName, mapLink }: InteractiveMapProps) => {
    // Fallback to searching the location name if no specific link is provided
    // Note: Embedding a map usually requires an API key for dynamic maps or the 'pb' parameter for embedded maps.
    // Since we don't have an API key handy for the user, we'll use the basic embed formatted URL which is free but sometimes limited.
    // A better approach for free usage without API key is using the "output=embed" with a query.

    const encodedLocation = encodeURIComponent(locationName);
    const embedUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const directionsUrl = mapLink || `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="w-full space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white sticky relative h-64 w-full bg-gray-100">
                <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    style={{ border: 0, opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                    onLoad={() => setIsLoading(false)}
                ></iframe>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                        <MapPin className="text-gray-400 animate-bounce" size={32} />
                    </div>
                )}
            </div>



            <div className="flex justify-center gap-4">
                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#8E5A5A] text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-800 transition-transform hover:scale-105"
                >
                    <MapPin size={18} />
                    <span>បង្ហាញផ្លូវ</span>
                </a>
            </div>
            <div className="text-center">
                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 underline flex items-center justify-center gap-1 mt-2 hover:text-[#8E5A5A]"
                >
                    <ExternalLink size={12} />
                    បើកក្នុង Google Maps
                </a>
            </div>
        </div >
    );
};
