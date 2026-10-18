import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { CalendarDays, MapPin, MessageSquare, Send, Home } from 'lucide-react';

export function CelebrationNavigator() {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalTarget(document.body);

        const handleScroll = () => {
            const sections = ['hero', 'invitation-khmer', 'schedule-khmer', 'location', 'gift', 'guestbook', 'gallery-sections'];
            const currentSection = sections
                .map((id) => ({ id, element: document.getElementById(id) }))
                .filter((section): section is { id: string; element: HTMLElement } => section.element !== null)
                .findLast(({ element }) => element.getBoundingClientRect().top <= 200);
            const heroTop = document.getElementById('hero')?.getBoundingClientRect().top ?? 0;

            setScrolled(window.scrollY > 500 || heroTop < -500);
            if (currentSection) {
                const navSection = currentSection.id === 'guestbook' ? 'gift' : currentSection.id;
                setActiveSection(navSection);
            }
        };

        handleScroll();
        document.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    const navItems = [
        { id: 'hero', icon: Home, label: "ទំព័រដើម" },
        { id: 'invitation-khmer', icon: Send, label: "សំបុត្រ" },
        { id: 'schedule-khmer', icon: CalendarDays, label: "កម្មវិធី" },
        { id: 'location', icon: MapPin, label: "ទីតាំង" },
        { id: 'gift', icon: MessageSquare, label: "ចងដៃ" },
    ];

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const offsetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    if (!portalTarget) return null;

    return createPortal(
        <AnimatePresence>
            {scrolled && (
                <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] flex w-[min(100vw,430px)] -translate-x-1/2 justify-center pb-[env(safe-area-inset-bottom,0px)]">
                    <m.nav
                        aria-label="ការរុករកធៀប"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="pointer-events-auto w-auto max-w-[96vw] px-2"
                    >
                        <div className="flex items-center gap-1 rounded-full border border-[#E8DCC2] bg-[#FFFEFA]/95 px-2 py-1.5 shadow-[0_6px_24px_rgba(84,64,25,0.14)] backdrop-blur-xl">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;

                                return (
                                    <m.button
                                        key={item.id}
                                        type="button"
                                        whileHover={{ y: -2, scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => scrollTo(item.id)}
                                        aria-label={item.label}
                                        aria-current={isActive ? "location" : undefined}
                                        className={`relative flex h-10 items-center justify-center rounded-full px-3 transition-all duration-300 ${
                                            isActive
                                                ? 'bg-[#A27A1E] text-white shadow-sm'
                                                : 'text-[#80652F] hover:bg-[#F5EEDC] hover:text-[#654B15]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                                            <AnimatePresence>
                                                {isActive && (
                                                    <m.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: 'auto' }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        className="overflow-hidden whitespace-nowrap font-kantumruy text-[11px] font-semibold"
                                                    >
                                                        {item.label}
                                                    </m.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </m.button>
                                );
                            })}
                        </div>
                    </m.nav>
                </div>
            )}
        </AnimatePresence>,
        portalTarget,
    );
}
