"use client";

import { Heart } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

export default function Loading() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 bg-pink-200 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-white p-4 rounded-full shadow-xl">
                    <Heart className="w-8 h-8 text-pink-500 animate-pulse fill-pink-500" />
                </div>
            </div>
            <p className="text-pink-800 font-serif animate-pulse">{t("common.loadingInvitation")}</p>
        </div>
    );
}
