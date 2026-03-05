"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from 'framer-motion';
import { Menu, X } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

export function NavBar() {
    const { theme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "ទំព័រដើម", href: "#" },
        { name: "លក្ខណៈពិសេស", href: "#features" },
        { name: "របៀបប្រើប្រាស់", href: "#how-it-works" },
        { name: "ពុម្ពគំរូ", href: "#templates" },
        { name: "តម្លៃ", href: "#pricing" },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            if (href === "#") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }
            setIsMenuOpen(false);
        }
    };

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out pt-6 px-4 md:px-0",
                    (isScrolled && !isMenuOpen) ? "pt-4" : ""
                )}
            >
                <div className={cn(
                    "max-w-6xl mx-auto flex items-center justify-between rounded-full transition-all duration-300",
                    (isScrolled && !isMenuOpen)
                        ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 py-3 px-6 shadow-2xl shadow-black/5 dark:shadow-black/50"
                        : "bg-transparent border-transparent py-2 px-6",
                    isMenuOpen && "!bg-transparent !backdrop-blur-none border-transparent shadow-none"
                )}>
                    {/* Logo Section */}
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="relative z-50 flex items-center shrink-0">
                        <MoneaLogo
                            showText={!isScrolled || isMenuOpen}
                            size={isScrolled && !isMenuOpen ? "sm" : "md"}
                            variant={isMenuOpen ? (theme === "dark" ? "dark" : "light") : "dark"}
                            className="transition-all duration-300"
                        />
                        {isScrolled && !isMenuOpen && (
                            <span className="ml-3 font-kantumruy font-bold text-slate-900 dark:text-white tracking-[0.2em] transform translate-y-[1px]">MONEA</span>
                        )}
                    </Link>

                    {/* Desktop Nav - Centered */}
                    <nav className="hidden md:flex items-center justify-center gap-8 flex-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className={cn(
                                    "text-sm font-medium transition-all font-kantumruy hover:-translate-y-0.5",
                                    isScrolled
                                        ? "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                                        : "text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center justify-end gap-3 shrink-0">
                        <ThemeToggle className="mr-2" />
                        <Link href="/login" className={cn(
                            "text-sm font-bold transition-colors font-kantumruy px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full",
                            isScrolled
                                ? "text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white"
                                : "text-slate-800 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
                        )}>
                            ចូលប្រើប្រាស់
                        </Link>
                        <Link href="/register">
                            <span className={cn(
                                "group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full px-6 font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,192,203,0.3)]",
                                isScrolled
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                                    : "bg-slate-900 text-white dark:bg-white dark:text-black border border-slate-800 dark:border-transparent"
                            )}>
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-pink-500 to-rose-500 dark:from-pink-200 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className={cn(
                                    "font-kantumruy text-sm font-bold relative z-10 pt-0.5",
                                    "group-hover:text-white dark:group-hover:text-black"
                                )}>ចុះឈ្មោះ</span>
                            </span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button  */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={cn(
                            "md:hidden relative z-50 p-2 transition-colors ml-auto",
                            isMenuOpen
                                ? "text-slate-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400"
                                : "text-slate-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400"
                        )}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Full Screen Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-3xl flex items-center justify-center"
                    >
                        <div className="flex flex-col gap-8 text-center w-full max-w-sm px-6">
                            {navItems.map((item, idx) => (
                                <m.a
                                    key={item.name}
                                    href={item.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={(e) => handleNavClick(e, item.href)}
                                    className="text-3xl font-kantumruy text-slate-800 dark:text-white/80 hover:text-pink-600 dark:hover:text-white hover:scale-105 transition-all"
                                >
                                    {item.name}
                                </m.a>
                            ))}
                            <div className="mt-8 flex flex-col gap-4">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-900 dark:text-white font-kantumruy border border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 py-4 rounded-2xl transition-all shadow-sm">ចូលប្រើប្រាស់</Link>
                                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-lg bg-pink-600 text-white border border-transparent font-kantumruy font-bold py-4 rounded-2xl hover:scale-105 transition-all shadow-[0_4px_20px_rgba(219,39,119,0.3)] dark:shadow-[0_0_30px_rgba(219,39,119,0.4)]">ចុះឈ្មោះឥឡូវនេះ</Link>
                            </div>
                            <div className="mt-4 flex flex-col items-center justify-center gap-3">
                                <span className="text-slate-500 dark:text-white/50 text-xs font-kantumruy">ផ្លាស់ប្តូររូបរាង</span>
                                <ThemeToggle className="scale-110 !bg-slate-100 dark:!bg-white/10 hover:!bg-slate-200 dark:hover:!bg-white/20 border border-slate-200 dark:border-white/20 [&_svg]:!text-slate-800 dark:[&_svg]:!text-white" />
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </>
    );
}
