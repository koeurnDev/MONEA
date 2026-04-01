'use client';

import { Button } from '@/components/ui/button';
import { motion as m } from 'framer-motion';
import { AlertCircle, RefreshCcw, MessageCircle, WifiOff, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    title?: string;
    message?: string;
    type?: 'generic' | 'connection' | 'database';
    onRetry?: () => void;
    className?: string;
    showContact?: boolean;
}

export default function ErrorState({
    title,
    message,
    type = 'generic',
    onRetry,
    className,
    showContact = true,
}: ErrorStateProps) {
    const getContent = () => {
        switch (type) {
            case 'connection':
                return {
                    icon: <WifiOff className="w-10 h-10 text-red-400" />,
                    defaultTitle: 'មានបញ្ហាការភ្ជាប់!',
                    defaultMessage: 'យើងកំពុងមានបញ្ហាក្នុងការភ្ជាប់។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។',
                    iconBg: 'bg-red-500/10',
                    iconBorder: 'border-red-500/20',
                    glow: 'bg-red-500/5',
                };
            case 'database':
                return {
                    icon: <Database className="w-10 h-10 text-red-500" />,
                    defaultTitle: 'សេវាកម្មមិនអាចប្រើប្រាស់បាន!',
                    defaultMessage: 'សេវាកម្មមិនអាចប្រើប្រាស់បានជាបណ្តោះអាសន្ន។ យើងខ្ញុំកំពុងដោះស្រាយបញ្ហានេះ។',
                    iconBg: 'bg-red-500/10',
                    iconBorder: 'border-red-500/20',
                    glow: 'bg-red-500/5',
                };
            default:
                return {
                    icon: <AlertCircle className="w-10 h-10 text-red-500" />,
                    defaultTitle: 'មានបញ្ហាអ្វីមួយកើតឡើង!',
                    defaultMessage: 'មានបញ្ហាអ្វីមួយកើតឡើង។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។',
                    iconBg: 'bg-red-500/10',
                    iconBorder: 'border-red-500/20',
                    glow: 'bg-red-500/5',
                };
        }
    };

    const content = getContent();

    return (
        <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative flex flex-col items-center justify-center p-7 md:p-12 text-center rounded-[24px] md:rounded-[40px] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden",
                className
            )}
        >
            {/* Subtle Glow */}
            <div className={cn("absolute inset-0 pointer-events-none blur-[60px]", content.glow)} />

            <div className={cn("relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 border shadow-inner transition-all", content.iconBg, content.iconBorder)}>
                {/* Scale icon for mobile */}
                <div className="scale-90 md:scale-100">
                    {content.icon}
                </div>
            </div>

            <h3 className="relative z-10 text-xl md:text-2xl font-bold text-white mb-3 tracking-tight px-2">
                {title || content.defaultTitle}
            </h3>
            <p className="relative z-10 text-white/50 text-sm md:text-base leading-relaxed mb-8 md:mb-10 max-w-[280px] md:max-w-xs font-kantumruy px-4">
                {message || content.defaultMessage}
            </p>

            <div className="relative z-10 flex flex-col w-full gap-3 px-2">
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        className="h-12 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-bold text-sm gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        ព្យាយាមម្តងទៀត
                    </Button>
                )}
                {showContact && (
                    <Button
                        variant="ghost"
                        onClick={() => window.open('https://t.me/monea_support', '_blank')}
                        className="h-12 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all font-medium text-sm gap-2"
                    >
                        <MessageCircle className="w-4 h-4" />
                        ទាក់ទងផ្នែកគាំទ្រ
                    </Button>
                )}
            </div>
        </m.div>
    );
}
