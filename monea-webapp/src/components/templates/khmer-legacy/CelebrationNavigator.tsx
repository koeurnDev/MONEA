import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, MessageSquare, Send, Home } from 'lucide-react';
import { WeddingData } from '../types';

import { useTranslation } from '@/i18n/LanguageProvider';

interface CelebrationNavigatorProps {
    wedding: WeddingData;
}

export function CelebrationNavigator({ wedding }: CelebrationNavigatorProps) {
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 500);
            
            const sections = ['hero', 'invitation-khmer', 'schedule', 'location', 'gift-section', 'gallery-sections'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 200 && rect.bottom >= 200) {
                        setActiveSection(section);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'hero', icon: Home, label: "ទំព័រដើម" },
        { id: 'invitation-khmer', icon: Send, label: "សំបុត្រ" },
        { id: 'location', icon: MapPin, label: "ទីតាំង" },
        { id: 'gift-section', icon: MessageSquare, label: "ចងដៃ" },
    ];

    if ((wedding.themeSettings?.visibility as any)?.showGuestbook !== false) {
        navItems.push({ id: 'guestbook', icon: MessageSquare, label: t("common.guestbook") });
    }

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <AnimatePresence>
            {scrolled && (
                <m.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 pb-[env(safe-area-inset-bottom,0px)] left-1/2 -translate-x-1/2 z-[80] px-2 w-auto max-w-[96vw]"
                >
                    <div className="bg-[#1c1917]/95 backdrop-blur-2xl border border-white/10 rounded-full py-1.5 px-2.5 flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-1 ring-gold-main/30">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            
                            return (
                                <m.button
                                    key={item.id}
                                    whileHover={{ y: -2, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => scrollTo(item.id)}
                                    className={`relative flex items-center justify-center h-10 md:h-12 rounded-full transition-all duration-300 px-3 ${
                                        isActive 
                                        ? 'bg-gold-main text-white shadow-lg shadow-gold-main/30' 
                                        : 'text-gold-main/70 hover:text-gold-main hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <AnimatePresence>
                                            {isActive && (
                                                <m.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="font-kantumruy text-[11px] font-bold tracking-wide whitespace-nowrap overflow-hidden"
                                                >
                                                    {item.label}
                                                </m.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    {isActive && (
                                        <m.div
                                            layoutId="active-nav-dot"
                                            className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                                        />
                                    )}
                                </m.button>
                            );
                        })}
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
}
