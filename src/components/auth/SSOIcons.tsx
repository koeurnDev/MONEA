
'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SSOIconsProps {
    className?: string;
}

const SSOIcons: React.FC<SSOIconsProps> = ({ className }) => {
    const telegramWrapperRef = useRef<HTMLDivElement>(null);

    const handleGoogleLogin = () => {
        window.location.href = "/api/auth/sso/google";
    };

    useEffect(() => {
        // Load Telegram Widget Script
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-login', "eza_ocr_bot");
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '10');
        script.setAttribute('data-auth-url', '/api/auth/sso/telegram');
        script.setAttribute('data-request-access', 'write');
        script.async = true;

        // Since the user wants an ICON, we'll hide the actual widget and trigger it
        // Note: Telegram widget is an iframe, hard to style. 
        // A better premium way is to use a custom button and the redirect auth.
        
        if (telegramWrapperRef.current) {
            // telegramWrapperRef.current.appendChild(script);
        }
    }, []);

    // Custom Telegram Link for Icon (using their redirect auth flow)
    const handleTelegramLogin = () => {
        const botName = "eza_ocr_bot";
        const authUrl = `${window.location.origin}/api/auth/sso/telegram`;
        const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=8289587681&origin=${encodeURIComponent(window.location.origin)}&return_to=${encodeURIComponent(authUrl)}`;
        // Note: bot_id is the first part of the token
        window.location.href = telegramAuthUrl;
    };

    return (
        <div className={`flex items-center justify-center gap-4 ${className}`}>
            {/* Google Icon Button */}
            <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleLogin}
                className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group relative overflow-hidden"
                title="Google"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg className="w-6 h-6 z-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
            </motion.button>

            {/* Telegram Icon Button */}
            <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTelegramLogin}
                className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group relative overflow-hidden"
                title="Telegram"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg className="w-6 h-6 z-10 text-[#229ED9] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.28.28-.54.28l.21-3.04 5.485-4.96c.238-.21-.052-.33-.37-.12l-6.78 4.27-2.95-.92c-.64-.2-.65-.64.134-.943l11.53-4.44c.535-.196 1.004.126.81 1.001z"/>
                </svg>
            </motion.button>
        </div>
    );
};

export default SSOIcons;
