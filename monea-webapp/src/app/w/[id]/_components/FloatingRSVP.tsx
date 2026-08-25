import React, { lazy, Suspense } from 'react';
import { useTranslation } from "@/i18n/LanguageProvider";

const RSVPForm = lazy<React.ComponentType<any>>(() => import("./RSVPForm").then(m => ({ default: (m as any).RSVPForm })));
const RevealSection = lazy<React.ComponentType<any>>(() => import("@/components/templates/shared/CinematicComponents").then(m => ({ default: (m as any).RevealSection })));

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
                <Suspense fallback={null}>
                    <RevealSection>
                        <div className="text-center mb-12">
                            <h2 className="font-khmer text-3xl font-black text-white mb-4 uppercase tracking-widest">
                                {t("invitation.rsvp.title")}
                            </h2>
                            <div className="h-1 w-20 bg-gold-main mx-auto rounded-full" style={{ backgroundColor: primaryColor }} />
                        </div>
                        <RSVPForm weddingId={weddingId} guestId={guestId} primaryColor={primaryColor} />
                    </RevealSection>
                </Suspense>
            </div>
        </div>
    );
}
