import * as React from "react";
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { AUTH_URLS } from "@/lib/constants";

export function NavBar() {
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 15);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-4 sm:px-6 transition-all duration-300 pointer-events-none">
            <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 p-[1.5px] shadow-xs group-hover:scale-105 transition-transform">
                            <div className="w-full h-full rounded-full bg-white dark:bg-[#121216] flex items-center justify-center">
                                <Sparkles size={14} className="text-rose-600 dark:text-rose-400" />
                            </div>
                        </div>
                        <span className="font-outfit font-black text-sm tracking-[0.2em] text-foreground uppercase select-none">
                            MONEA
                        </span>
                    </Link>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-kantumruy">
                        <LanguageToggle className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted border-none text-foreground" />
                        <ThemeToggle className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted border-none text-foreground" />

                        <Link
                            to={AUTH_URLS.SIGN_IN}
                            className="hidden xs:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                        >
                            ចូលប្រើប្រាស់
                        </Link>

                        <Link
                            to={AUTH_URLS.SIGN_UP}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                        >
                            <span>ចាប់ផ្តើម</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
