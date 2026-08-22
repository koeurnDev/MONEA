"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from "@/i18n/LanguageProvider";

const RSVPForm = dynamic(() => import("./RSVPForm").then(mod => mod.RSVPForm), {
    ssr: false
});

const RevealSection = dynamic(() => import("@/components/templates/shared/CinematicComponents").then(mod => mod.RevealSection), {
    ssr: false
});

interface FloatingRSVPProps {
    weddingId: string;
    guestId?: string;
    primaryColor?: string;
}

export function FloatingRSVP({ weddingId, guestId, primaryColor = "#D4AF37" }: FloatingRSVPProps) {
    const { t } = useTranslation();

    return (
        <div className="fixed bottom-24 right-6 z-50">
            <div className="max-w-4xl mx-auto">
                <RevealSection>
                    <div className="text-center mb-12">
                        <h2 className="font-khmer text-3xl font-black text-white mb-4 uppercase tracking-widest">
                            {t("invitation.rsvp.title")}
                        </h2>
                        <div className="h-1 w-20 bg-gold-main mx-auto rounded-full" style={{ backgroundColor: primaryColor }} />
                    </div>
                    <RSVPForm weddingId={weddingId} guestId={guestId} primaryColor={primaryColor} />
                </RevealSection>
            </div>
        </div>
    );
}
