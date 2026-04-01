"use client";
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
            
            const sections = ['hero', 'event-info', 'location', 'rsvp', 'guestbook'];
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
        { id: 'hero', icon: Home, label: t("common.home") },
        { id: 'event-info', icon: Calendar, label: t("common.schedule") },
        { id: 'location', icon: MapPin, label: t("common.map") },
        { id: 'rsvp', icon: Send, label: t("common.rsvp") },
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
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] px-4 w-auto"
                >
                    <div className="bg-[#1c1917]/90 backdrop-blur-2xl border border-white/10 rounded-full py-2 px-3 flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-gold-main/30">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            
                            return (
                                <m.button
                                    key={item.id}
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => scrollTo(item.id)}
                                    className={`relative flex items-center justify-center h-12 md:h-14 rounded-full transition-all duration-500 px-4 ${
                                        isActive 
                                        ? 'bg-gold-main text-white shadow-lg shadow-gold-main/20 min-w-[100px] md:min-w-[120px]' 
                                        : 'text-gold-main/60 hover:text-gold-main hover:bg-white/5 w-12 md:w-14'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon size={isActive ? 20 : 20} strokeWidth={isActive ? 2.5 : 2} />
                                        <AnimatePresence>
                                            {isActive && (
                                                <m.span
                                                    initial={{ opacity: 0, width: 0, x: -10 }}
                                                    animate={{ opacity: 1, width: 'auto', x: 0 }}
                                                    exit={{ opacity: 0, width: 0, x: -10 }}
                                                    className="font-playfair text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
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
