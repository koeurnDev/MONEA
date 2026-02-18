"use client";
import { motion } from "framer-motion";
import { ShieldAlert, Clock, Sparkles, Heart } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 text-center">
            <div className="max-w-2xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-600 mx-auto mb-8 relative z-10">
                        <ShieldAlert size={48} />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-100/50 rounded-full blur-3xl opacity-50" />

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
                        System Under <br /> <span className="text-red-600">Maintenance</span>
                    </h1>

                    <p className="text-slate-500 font-medium font-kantumruy text-lg mb-12 max-w-md mx-auto">
                        យើងខ្ញុំកំពុងធ្វើការអភិវឌ្ឍន៍ប្រព័ន្ធដើម្បីផ្តល់ជូននូវបទពិសោធន៍កាន់តែប្រសើរ។ សូមអភ័យទោសចំពោះការរំខាននេះ។
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-12">
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                            <Clock className="text-blue-500 mb-3" size={20} />
                            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight">Expected Back</h4>
                            <p className="text-xs text-slate-400 font-medium">Within 30-60 minutes</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                            <Sparkles className="text-amber-500 mb-3" size={20} />
                            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight">Support</h4>
                            <p className="text-xs text-slate-400 font-medium">t.me/monea_support</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            <Heart size={10} className="text-red-400" /> Powered by MONEA System
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
