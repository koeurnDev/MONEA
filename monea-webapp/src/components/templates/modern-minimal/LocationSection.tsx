import React from 'react';
import { motion } from 'framer-motion';
import { WeddingData } from "../types";
import { MapPin, Navigation } from 'lucide-react';
import { getDirectMapUrl, getMapEmbedUrl } from "../shared/mapUtils";

export const LocationSection = ({ wedding }: { wedding: WeddingData }) => {
    const venueName = wedding.location || "";
    const mapLink = wedding.themeSettings?.mapLink || "";
    if (!venueName && !mapLink) return null;

    const hasEmbeddableMap = Boolean(venueName || mapLink.includes("google.com/maps/embed") || mapLink.includes("q="));
    const directMapUrl = getDirectMapUrl(wedding.themeSettings?.mapLink, venueName);
    const mapEmbedUrl = hasEmbeddableMap ? getMapEmbedUrl(mapLink, venueName) : "";

    return (
        <section className="relative overflow-hidden bg-[#f7f1ea] py-14 sm:py-20" id="location-modern">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_35%)]" />

            <div className="relative z-10 mx-auto max-w-[440px] px-4">
                <div className="relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative z-10 rounded-[32px] border border-slate-200/80 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-6"
                    >
                        <div className="mb-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Location</p>
                            <h2 className="mt-2 text-[2rem] font-black leading-none text-slate-900">View Location</h2>
                        </div>

                        {hasEmbeddableMap && <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
                            <iframe
                                src={mapEmbedUrl}
                                title={`Map: ${venueName || "event location"}`}
                                className="h-44 w-full border-0 sm:h-52"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>}

                        {venueName && <div className="mt-4 flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                    <MapPin size={12} className="text-slate-600" />
                                    <span>Venue</span>
                                </div>
                                <p className="truncate text-sm font-bold text-slate-800">{venueName}</p>
                            </div>
                        </div>}

                        <a
                            href={directMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1d4ed8] px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#1e5be8]"
                        >
                            <Navigation size={14} />
                            <span>Open in Maps</span>
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
