import { MapPin, Heart } from 'lucide-react';
import { WeddingData } from "../types";
import { THEME, GlassCard, FloatingPetals } from './shared';
import { motion } from 'framer-motion';

interface LocationFooterProps {
    wedding: WeddingData;
    labels: any;
    mapLink: string;
}

export default function LocationFooter({ wedding, labels, mapLink }: LocationFooterProps) {
    return (
        <footer className="py-32 px-6 text-center text-white relative overflow-hidden flex flex-col items-center justify-center bg-[#1a1a1a]">
            {/* Background Map Overlay with better effect */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center mix-blend-overlay pointer-events-none scale-110"></div>

            <FloatingPetals />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative z-10 w-full max-w-2xl mx-auto"
            >
                <GlassCard className="bg-white/5 border-white/10 backdrop-blur-xl p-12 md:p-16">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-[#D4AF37]/30"
                    >
                        <MapPin className="text-[#D4AF37]" size={32} />
                    </motion.div>

                    <h2 className="text-4xl font-serif text-[#D4AF37] mb-8 tracking-tight">{labels.location_title}</h2>

                    <p className="text-gray-300 font-light leading-relaxed text-xl font-khmer mb-12 max-w-md mx-auto">
                        {wedding.location}
                    </p>

                    <motion.a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block px-12 py-5 bg-[#D4AF37] text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-stone-900 transition-all duration-500 shadow-2xl rounded-sm"
                    >
                        View Map
                    </motion.a>
                </GlassCard>

                <div className="pt-24 mt-12 border-t border-white/5 w-full opacity-60">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="font-script text-4xl text-[#D4AF37] mb-6"
                    >
                        {wedding.groomName} & {wedding.brideName}
                    </motion.p>
                    <div className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gray-500 font-bold">
                        <span>Made with</span>
                        <Heart size={14} className="fill-[#D4AF37] text-[#D4AF37] animate-pulse" />
                        <span>for you</span>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}
