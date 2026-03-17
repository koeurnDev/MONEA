"use client";
import { m } from 'framer-motion';
import { ShieldAlert, Clock, Sparkles, Heart } from "lucide-react";
import PageTransition from '@/components/layout/PageTransition';

export default function MaintenancePage() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center selection:bg-red-500/30">
                <div className="max-w-2xl w-full">
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Premium Glow Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-red-600/10 rounded-full blur-[120px] opacity-40 pointer-events-none" />

                        <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex items-center justify-center text-red-500 mx-auto mb-10 relative z-10 shadow-2xl">
                            <ShieldAlert size={48} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 uppercase leading-tight">
                            System Under <br /> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient-x">
                                Maintenance
                            </span>
                        </h1>

                        <p className="text-white/60 font-medium font-kantumruy text-lg mb-12 max-w-md mx-auto leading-relaxed">
                            យើងខ្ញុំកំពុងធ្វើការអភិវឌ្ឍន៍ប្រព័ន្ធដើម្បីផ្តល់ជូននូវបទពិសោធន៍កាន់តែប្រសើរ។ <br />
                            <span className="text-white/40 text-sm">សូមអភ័យទោសចំពោះការរំខាននេះ។</span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-12 relative z-20">
                            <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:border-red-500/30 transition-all group shadow-2xl">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Clock className="text-blue-400" size={20} />
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1 uppercase tracking-widest">Expected Back</h4>
                                <p className="text-xs text-white/40 font-medium">Within 30-60 minutes</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:border-red-500/30 transition-all group shadow-2xl">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Sparkles className="text-amber-400" size={20} />
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1 uppercase tracking-widest">Support</h4>
                                <p className="text-xs text-white/40 font-medium">t.me/monea_support</p>
                            </div>
                        </div>

                        <m.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                <Heart size={10} className="text-red-500 animate-pulse" /> 
                                Powered by MONEA Premium
                            </div>
                        </m.div>
                    </m.div>
                </div>
            </div>
        </PageTransition>
    );
}
