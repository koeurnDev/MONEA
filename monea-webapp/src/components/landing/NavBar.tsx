import * as React from "react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ArrowRight, Globe } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/i18n/LanguageProvider";
import { AUTH_URLS } from "@/lib/constants";

export function NavBar() {
    const { t, locale } = useTranslation();
    const isKm = locale === 'km';
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState("home");

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { id: "home", name: t("nav.home", { defaultValue: "ទំព័រដើម" }), href: "#" },
        { id: "features", name: t("nav.features", { defaultValue: "លក្ខណៈពិសេស" }), href: "#features" },
        { id: "how-it-works", name: t("nav.howItWorks", { defaultValue: "របៀបប្រើប្រាស់" }), href: "#how-it-works" },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            setActiveSection(id);
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
            {/* Ultra-Modern Floating Island Header */}
            <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 transition-all duration-300 pointer-events-none">
                <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">
                    {/* Floating Pill Container */}
                    <div className={cn(
                        "w-full flex items-center justify-between rounded-full transition-all duration-300 px-4 sm:px-5 py-2",
                        "bg-white/85 dark:bg-[#121216]/85 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-slate-900/5 dark:shadow-black/40",
                        isScrolled ? "shadow-xl border-slate-200/80 dark:border-white/15" : ""
                    )}>
                        {/* Logo with Emblem */}
                        <Link 
                            to="/" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="flex items-center gap-2 group shrink-0"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 p-[1.5px] shadow-sm shadow-rose-500/20 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-full bg-white dark:bg-[#121216] flex items-center justify-center">
                                    <Sparkles size={14} className="text-rose-600 dark:text-rose-400" />
                                </div>
                            </div>
                            <span className="font-outfit font-black text-sm tracking-[0.2em] text-slate-900 dark:text-white uppercase select-none">
                                MONEA
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-1 font-kantumruy">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.href}
                                        onClick={(e) => handleNavClick(e, item.href, item.id)}
                                        className={cn(
                                            "relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200",
                                            isActive
                                                ? "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                                                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Cluster: Controls + Auth Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Theme & Language Toggles */}
                            <div className="hidden sm:flex items-center gap-1.5 border-r border-slate-200 dark:border-white/10 pr-2 mr-1">
                                <LanguageToggle className="h-8 w-8 rounded-full bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border-none text-slate-700 dark:text-slate-200" />
                                <ThemeToggle className="h-8 w-8 rounded-full bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border-none text-slate-700 dark:text-slate-200" />
                            </div>

                            {/* Sign In Link */}
                            <Link
                                to={AUTH_URLS.SIGN_IN}
                                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-kantumruy"
                            >
                                {t("nav.signIn", { defaultValue: "ចូលប្រើប្រាស់" })}
                            </Link>

                            {/* Get Started / Sign Up Button (Hidden on extra-small mobile, available in drawer) */}
                            <Link
                                to={AUTH_URLS.SIGN_UP}
                                className="hidden sm:inline-flex group relative items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 hover:scale-105 active:scale-95 transition-all font-kantumruy"
                            >
                                <span>{t("nav.signUp", { defaultValue: "ចុះឈ្មោះ" })}</span>
                                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>

                            {/* Mobile Hamburger Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sheet Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-3 top-16 z-40 md:hidden bg-white/95 dark:bg-[#121216]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20 font-kantumruy"
                    >
                        <div className="flex flex-col gap-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.id}
                                    to={item.href}
                                    onClick={(e) => handleNavClick(e, item.href, item.id)}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2.5">
                                <div className="flex items-center justify-between px-2 py-1">
                                    <span className="text-xs text-muted-foreground font-bold">រូបរាង & ភាសា</span>
                                    <div className="flex items-center gap-2">
                                        <LanguageToggle className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-border" />
                                        <ThemeToggle className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-border" />
                                    </div>
                                </div>

                                <Link
                                    to={AUTH_URLS.SIGN_IN}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    {t("nav.signIn", { defaultValue: "ចូលប្រើប្រាស់" })}
                                </Link>

                                <Link
                                    to={AUTH_URLS.SIGN_UP}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md shadow-rose-600/25"
                                >
                                    {t("nav.signUp", { defaultValue: "បង្កើតគណនីឥតគិតថ្លៃ" })}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
