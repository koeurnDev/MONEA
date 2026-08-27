import React from 'react';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/Toast";
import { useTranslation } from "@/i18n/LanguageProvider";

import { getApiUrl } from "@/lib/api-url";

interface SSOIconsProps {
    className?: string;
}

const SSOIcons: React.FC<SSOIconsProps> = ({ className }) => {
    const { showToast } = useToast();
    const { locale } = useTranslation();
    const isKm = locale === 'km';

    const handleGoogleLogin = () => {
        window.location.href = getApiUrl("api/auth/sso/google");
    };

    const handleTelegramLogin = () => {
        // Telegram SSO - keep as is
        const isLocalDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && import.meta.env.DEV;
        
        if (isLocalDev) {
            showToast({ 
                title: isKm ? "អភិវឌ្ឍន៍" : "Development Mode", 
                description: isKm ? "Telegram SSO មិនដំណើរការនៅក្នុង localhost ទេ។ សូមប្រើការចុះឈ្មោះធម្មតា។" : "Telegram SSO is disabled in development. Please use regular sign up/in.", 
                type: "info" 
            });
            return;
        }
        
        const botId = import.meta.env.VITE_TELEGRAM_BOT_ID;
        if (!botId) {
             showToast({ title: "SSO Unavailable", description: "Telegram SSO is not configured on this server.", type: "info" });
             return;
        }
        const safeBotId = botId || '8289587681'; 
        const authUrl = getApiUrl("api/auth/sso/telegram");
        const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=${safeBotId}&origin=${encodeURIComponent(window.location.origin)}&return_to=${encodeURIComponent(authUrl)}`;
        
        window.location.href = telegramAuthUrl;
    };

    return (
        <div className={`grid grid-cols-2 gap-3 md:gap-2.5 ${className || ''}`}>
            {/* Telegram Button - Mobile Optimized */}
            <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTelegramLogin}
                className="h-14 md:h-11 flex items-center justify-center gap-2.5 md:gap-2 bg-card hover:bg-muted active:bg-muted/80 border-2 md:border border-border rounded-2xl md:rounded-xl transition-all shadow-sm group px-4 md:px-3 select-none active:scale-[0.98]"
            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                    alt="Telegram"
                    className="w-6 h-6 md:w-5 md:h-5 object-contain shrink-0"
                    width="24"
                    height="24"
                />
                <span className="font-bold text-foreground text-sm md:text-xs">
                    Telegram
                </span>
            </motion.button>

            {/* Google Button - Mobile Optimized */}
            <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                className="h-14 md:h-11 flex items-center justify-center gap-2.5 md:gap-2 bg-card hover:bg-muted active:bg-muted/80 border-2 md:border border-border rounded-2xl md:rounded-xl transition-all shadow-sm group px-4 md:px-3 select-none active:scale-[0.98]"
            >
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-6 h-6 md:w-5 md:h-5 object-contain shrink-0"
                    width="24"
                    height="24"
                />
                <span className="font-bold text-foreground text-sm md:text-xs">
                    Google
                </span>
            </motion.button>
        </div>
    );
};

export default SSOIcons;
