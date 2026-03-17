'use client';

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion as m } from "framer-motion";
import { AnimationProvider } from "@/components/providers/AnimationProvider";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-black font-kantumruy">
                <AnimationProvider>
                    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6">
                        {/* Background Glow */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[150px] rounded-full" />
                        </div>

                        <m.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative z-10 w-full max-w-md"
                        >
                            <div className="bg-zinc-900/60 backdrop-blur-2xl border border-red-500/20 rounded-[32px] p-8 md:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                                    <AlertTriangle className="w-10 h-10 text-red-500" />
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-4">មានបញ្ហាធ្ងន់ធ្ងរ!</h2>
                                <p className="text-white/40 text-sm leading-relaxed mb-10">
                                    កម្មវិធីបានជួបបញ្ហាមិនអាចដំណើរការបាន។ សូមព្យាយាមម្តងទៀត ឬទាក់ទងមកកាន់ពួកយើងប្រសិនបើនៅតែមានបញ្ហា។
                                </p>

                                <Button 
                                    onClick={() => reset()}
                                    className="w-full h-14 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all duration-300 font-bold text-base gap-2 shadow-[0_10px_20px_rgba(220,38,38,0.3)]"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                    ព្យាយាមម្តងទៀត
                                </Button>
                            </div>
                        </m.div>
                    </div>
                </AnimationProvider>
            </body>
        </html>
    );
}
