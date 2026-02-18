import React from 'react';
import { WeddingData } from "../types";
import { cn } from './shared';

interface GiftRegistrySectionProps {
    wedding: WeddingData;
    labels: any;
    primaryColor: string;
    hero_title: string;
    setSelectedImg: (index: number) => void;
}

export default function GiftRegistrySection({ wedding, labels, primaryColor, hero_title, setSelectedImg }: GiftRegistrySectionProps) {
    if (!wedding.themeSettings?.giftRegistry || wedding.themeSettings.giftRegistry.length === 0) {
        return null;
    }

    return (
        <section className="p-8">
            <h3 className="text-center text-2xl mb-8 font-kantumruy font-bold" style={{ color: primaryColor }}>{labels.gift_label}</h3>
            <div className="grid gap-4">
                {wedding.themeSettings.giftRegistry.map((gift) => (
                    <div key={gift.id} className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between border border-pink-50">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs",
                                gift.type === 'ABA' ? 'bg-[#005F7F]' :
                                    gift.type === 'ACLEDA' ? 'bg-[#C19B2C]' :
                                        gift.type === 'WING' ? 'bg-[#5BBF21]' : 'bg-gray-400'
                            )}>
                                {gift.type}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{gift.accountName}</p>
                                <p className="text-xs text-gray-500 font-mono tracking-wider">{gift.accountNumber}</p>
                            </div>
                        </div>
                        {gift.qrCodeUrl && (
                            <button
                                onClick={() => setSelectedImg(100 + wedding.themeSettings!.giftRegistry!.indexOf(gift))}
                                className="px-3 py-1 bg-gray-100 rounded-md text-xs font-medium hover:bg-gray-200"
                            >
                                QR Code
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
