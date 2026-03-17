"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Ghost } from 'lucide-react';
import { motion as m } from "framer-motion";
import { AnimationProvider } from "@/components/providers/AnimationProvider";

export default function NotFound() {
    return (
        <AnimationProvider>
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black font-kantumruy p-6">
                {/* Background Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
                </div>

                <m.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <m.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10"
                        >
                            <Ghost className="w-10 h-10 text-white/20" />
                        </m.div>

                        <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter">404</h1>
                        <h2 className="text-xl font-bold text-white mb-4">រកមិនឃើញទំព័រនេះទេ</h2>
                        <p className="text-white/40 text-sm leading-relaxed mb-10 px-4">
                            ទំព័រដែលអ្នកកំពុងស្វែងរកប្រហែលជាត្រូវបានលុប ឬប្តូរទីតាំងថ្មី។ សូមពិនិត្យមើលអាសយដ្ឋានម្តងទៀត។
                        </p>

                        <Link href="/">
                            <Button className="w-full h-14 rounded-full bg-white text-black hover:bg-gold hover:text-white transition-all duration-300 font-bold text-base gap-2 group shadow-xl">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                ត្រឡប់ទៅទំព័រដើម
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-8 text-white/20 text-[10px] uppercase font-black tracking-[0.3em] text-center">
                        MONEA PREMIUM EXPERIENCE
                    </p>
                </m.div>
            </div>
        </AnimationProvider>
    );
}
