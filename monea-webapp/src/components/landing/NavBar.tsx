import * as React from "react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Star, Menu, X } from "lucide-react";
import { AUTH_URLS } from "@/lib/constants";

export function NavBar() {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 15);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-4 sm:px-6 transition-all duration-300 pointer-events-none">
            <div className="relative max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
                <div className={cn(
                    "w-full flex items-center justify-between rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5",
                    "bg-white/90 dark:bg-[#121216]/90 backdrop-blur-xl border border-border/80 shadow-md shadow-slate-900/5 dark:shadow-black/40",
                    isScrolled ? "shadow-lg border-border" : ""
                )}>
                    {/* Brand Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center gap-2.5 group shrink-0"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 via-teal-500 to-amber-400 p-[1.5px] shadow-xs group-hover:scale-105 transition-transform">
                            <div className="w-full h-full rounded-full bg-white dark:bg-[#121216] flex items-center justify-center">
                                <Star size={14} strokeWidth={1.9} className="text-teal-800 dark:text-teal-300 origin-center animate-[spin_6s_linear_infinite]" />
                            </div>
                        </div>
                        <span className="font-outfit font-black text-sm tracking-[0.2em] text-foreground uppercase select-none">
                            MONEA
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-3 font-kantumruy text-xs font-bold text-muted-foreground sm:flex">
                        <Link to="/" className="transition-colors hover:text-teal-800 dark:hover:text-teal-300">
                            ទំព័រដើម
                        </Link>
                        <a href="/#how-it-works" className="transition-colors hover:text-teal-800 dark:hover:text-teal-300">
                            របៀបប្រើប្រាស់
                        </a>
                        <Link to="/contact" className="transition-colors hover:text-teal-800 dark:hover:text-teal-300">
                            ទំនាក់ទំនង និងជំនួយ
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2 shrink-0 font-kantumruy">
                        <Link
                            to={AUTH_URLS.SIGN_UP}
                            className="inline-flex min-h-9 items-center justify-center rounded-full bg-gradient-to-r from-teal-700 to-teal-600 px-4 text-[11px] font-bold text-white shadow-sm transition hover:from-teal-800 hover:to-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:px-5 sm:text-xs"
                        >
                            ចុះឈ្មោះ
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((open) => !open)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-foreground transition-colors hover:bg-muted sm:hidden"
                            aria-label={isMenuOpen ? "បិទម៉ឺនុយ" : "បើកម៉ឺនុយ"}
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X size={17} /> : <Menu size={17} />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <nav className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-2xl border border-border/80 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:bg-[#121216]/95 sm:hidden">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-foreground hover:bg-muted">
                            ទំព័រដើម
                        </Link>
                        <a href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-foreground hover:bg-muted">
                            របៀបប្រើប្រាស់
                        </a>
                        <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-foreground hover:bg-muted">
                            ទំនាក់ទំនង និងជំនួយ
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    );
}
