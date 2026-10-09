import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { AUTH_URLS } from "@/lib/constants";

export function Hero() {
    return (
        <section className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-gradient-to-br from-[#F0FDFA] via-[#F8FAFC] to-[#FFFBEB] font-kantumruy transition-colors duration-300 dark:from-[#09090B] dark:via-[#0C1716] dark:to-[#09090B]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -left-[10%] -top-[20%] h-[60vw] w-[60vw] rounded-full bg-teal-400/20 blur-[130px] dark:bg-teal-600/15" />
                <div className="absolute -bottom-[20%] -right-[10%] h-[55vw] w-[55vw] rounded-full bg-teal-300/20 blur-[130px] dark:bg-teal-900/15" />
                <div className="absolute right-[20%] top-[30%] h-[35vw] w-[35vw] rounded-full bg-violet-300/10 blur-[110px] dark:bg-violet-900/15" />
                <div className="absolute inset-0 bg-[radial-gradient(#f9a8d4_1px,transparent_1px)] opacity-25 [background-size:28px_28px] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] dark:opacity-30" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-28 text-center sm:px-8 sm:py-32">
                <div className="mx-auto flex max-w-4xl flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-5 sm:mb-7"
                    >
                        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-teal-700/25">
                            <Sparkles className="h-3.5 w-3.5 origin-center animate-[spin_3s_linear_infinite]" aria-hidden="true" />
                            MONEA · ធៀបការឌីជីថល
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.45, delay: 0.05 }}
                        className="mb-4 sm:mb-6"
                    >
                        <span className="block text-[26px] font-bold leading-[1.4] tracking-normal text-slate-900 dark:text-white sm:whitespace-nowrap sm:text-5xl lg:text-6xl">
                            បង្កើតធៀបការរបស់អ្នក
                        </span>
                        <span className="mt-1 block text-[24px] font-bold leading-[1.4] tracking-normal sm:whitespace-nowrap sm:text-4xl lg:text-5xl">
                            <span className="bg-gradient-to-r from-teal-800 via-teal-600 to-amber-500 bg-clip-text text-transparent dark:from-teal-300 dark:via-teal-200 dark:to-amber-300">
                                ឱ្យស្រស់ស្អាត
                            </span>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.2 }}
                        className="mb-7 max-w-2xl text-[12px] leading-[1.9] text-slate-500 dark:text-slate-400 sm:mb-9 sm:text-base"
                    >
                        បង្កើតធៀបការឌីជីថលបានយ៉ាងងាយស្រួល។ ភ្ជាប់{" "}
                        <strong className="text-slate-700 dark:text-slate-200">Google Maps</strong>,{" "}
                        <strong className="text-slate-700 dark:text-slate-200">KHQR</strong> និង{" "}
                        <strong className="text-slate-700 dark:text-slate-200">Telegram</strong> ក្នុងមួយចុច។
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex w-full max-w-xs flex-col items-center sm:max-w-none sm:flex-row sm:justify-center"
                    >
                        <Link
                            to={AUTH_URLS.SIGN_UP}
                            className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 px-6 text-sm font-bold text-white shadow-xl shadow-teal-700/30 transition-all duration-200 hover:scale-[1.03] hover:shadow-teal-700/50 active:scale-[0.98] touch-manipulation sm:h-14 sm:w-auto sm:px-9"
                        >
                            <span>បង្កើតធៀបឥឡូវ</span>
                            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
