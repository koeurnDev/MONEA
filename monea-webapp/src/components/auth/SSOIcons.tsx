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
        // Only disable in actual development (localhost + dev mode)
        const isLocalDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && import.meta.env.DEV;
        
        if (isLocalDev) {
            showToast({ 
                title: isKm ? "អភិវឌ្ឍន៍" : "Development Mode", 
                description: isKm ? "Google SSO មិនដំណើរការនៅក្នុង localhost ទេ។ សូមប្រើការចុះឈ្មោះធម្មតា។" : "Google SSO is disabled in development. Please use regular sign up/in.", 
                type: "info" 
            });
            return;
        }
        
        if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
             showToast({ title: "SSO Unavailable", description: "Google SSO is not configured on this server.", type: "info" });
             return;
        }
        window.location.href = getApiUrl("api/auth/sso/google");
    };

    const handleTelegramLogin = () => {
        // Only disable in actual development (localhost + dev mode)
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
        <div className={`grid grid-cols-2 gap-2.5 ${className || ''}`}>
            {/* Telegram Button */}
            <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTelegramLogin}
                className="h-11 flex items-center justify-center gap-2 bg-card hover:bg-muted border border-border rounded-xl transition-all shadow-xs group px-3 select-none"
            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                    alt="Telegram"
                    className="w-5 h-5 object-contain shrink-0"
                    width="20"
                    height="20"
                />
                <span className="font-bold text-foreground text-xs">
                    Telegram
                </span>
            </motion.button>

            {/* Google Button */}
            <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                className="h-11 flex items-center justify-center gap-2 bg-card hover:bg-muted border border-border rounded-xl transition-all shadow-xs group px-3 select-none"
            >
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5 object-contain shrink-0"
                    width="20"
                    height="20"
                />
                <span className="font-bold text-foreground text-xs">
                    Google
                </span>
            </motion.button>
        </div>
    );
};

export default SSOIcons;
