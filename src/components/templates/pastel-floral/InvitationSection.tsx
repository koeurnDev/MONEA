import React from 'react';
import { motion } from 'framer-motion';
import { WeddingData } from "../types";
import { SectionDivider, THEME, FloatingPetals, GlassCard } from './shared';

interface InvitationSectionProps {
    wedding: WeddingData;
    labels: any;
    guestName?: string;
}

export default function InvitationSection({ wedding, labels, guestName }: InvitationSectionProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    return (
        <section className="py-24 px-6 text-center relative overflow-hidden min-h-screen flex items-center justify-center" style={{ backgroundColor: THEME.colors.background }}>
            <FloatingPetals />

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-[url('/wedding_assets/floral-corner-tl.png')] bg-contain bg-no-repeat opacity-30 pointer-events-none z-10"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[url('/wedding_assets/floral-corner-br.png')] bg-contain bg-no-repeat opacity-30 pointer-events-none z-10"></div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-2xl mx-auto z-20 relative"
            >
                <motion.div variants={itemVariants}>
                    <h3 className="text-5xl md:text-6xl font-script text-[#D4AF37] mb-6 drop-shadow-sm">Save The Date</h3>
                    <p className="font-serif italic text-xl text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                        &quot;Every love story is beautiful, but ours is my favorite.&quot;
                    </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <SectionDivider />
                </motion.div>

                <motion.div variants={itemVariants} className="my-10">
                    <GlassCard className="relative overflow-hidden group">
                        {/* Decorative internal corners */}
                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]/40 group-hover:border-[#D4AF37] transition-colors duration-500"></div>
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]/40 group-hover:border-[#D4AF37] transition-colors duration-500"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]/40 group-hover:border-[#D4AF37] transition-colors duration-500"></div>
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]/40 group-hover:border-[#D4AF37] transition-colors duration-500"></div>

                        <p className="text-xl font-khmer mb-6 text-gray-500 uppercase tracking-[0.2em]">សិរីសួស្តីអាពាហ៍ពិពាហ៍</p>

                        <div className="flex flex-col md:flex-row items-center justify-around gap-12 my-12">
                            <div className="space-y-4">
                                <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">{labels.groom_label}</p>
                                <h2 className="text-3xl md:text-4xl font-serif text-[#4A4A4A]">{wedding.groomName}</h2>
                                <div className="text-sm text-gray-500 font-khmer leading-relaxed">
                                    កូនប្រុស លោក {wedding.themeSettings?.parents?.groomFather || "..."} <br />
                                    និង លោកស្រី {wedding.themeSettings?.parents?.groomMother || "..."}
                                </div>
                            </div>

                            <div className="text-4xl font-script text-[#D4AF37] opacity-60">&</div>

                            <div className="space-y-4">
                                <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">{labels.bride_label}</p>
                                <h2 className="text-3xl md:text-4xl font-serif text-[#4A4A4A]">{wedding.brideName}</h2>
                                <div className="text-sm text-gray-500 font-khmer leading-relaxed">
                                    កូនស្រី លោក {wedding.themeSettings?.parents?.brideFather || "..."} <br />
                                    និង លោកស្រី {wedding.themeSettings?.parents?.brideMother || "..."}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mt-8">
                            <p className="text-xl font-khmer text-gray-700">
                                នឹងរៀបចំនៅថ្ងៃ {new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {guestName && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                className="mt-10 pt-8 border-t border-[#D4AF37]/20"
                            >
                                <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">សូមគោរពអញ្ជើញ</p>
                                <p className="text-3xl font-bold text-[#D4AF37] font-header tracking-tight">{guestName}</p>
                            </motion.div>
                        )}
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-12 space-y-6">
                    <button className="px-12 py-4 bg-[#D4AF37] text-white hover:bg-[#C5A028] transition-all duration-300 rounded-full shadow-[0_10px_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(212,175,55,0.5)] font-serif tracking-widest text-xs uppercase font-bold active:scale-95">
                        Download Invitation
                    </button>
                    <p className="text-[10px] text-gray-400 italic">
                        By clicking, you can save the image to your gallery.
                    </p>
                </motion.div>
            </motion.div>
        </section>
    );
}
