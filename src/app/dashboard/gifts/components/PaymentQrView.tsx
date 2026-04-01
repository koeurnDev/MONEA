"use client";

import Image from "next/image";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/LanguageProvider";

interface PaymentQrViewProps {
    paymentQrUrl: string | null;
    isLoading?: boolean;
}

export function PaymentQrView({ paymentQrUrl, isLoading }: PaymentQrViewProps) {
    const { t } = useTranslation();
    if (!paymentQrUrl && !isLoading) return null;

    return (
        <div className="mt-6 border-t border-border pt-6">
            <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col items-center shadow-sm">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 font-kantumruy">
                    <span>{t("gifts.qr.title")}</span>
                </p>

                {/* Click to Expand/Zoom */}
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="relative w-48 h-48 bg-white rounded-lg overflow-hidden border border-border cursor-zoom-in hover:opacity-90 transition-opacity flex items-center justify-center">
                            {paymentQrUrl && (
                                <Image
                                    src={paymentQrUrl}
                                    alt="Payment QR"
                                    fill
                                    className="object-contain p-2"
                                />
                            )}
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 bg-card">
                        <VisuallyHidden.Root>
                            <DialogTitle>{t("gifts.qr.enlarge")}</DialogTitle>
                            <DialogDescription>
                                {t("gifts.qr.zoom")}
                            </DialogDescription>
                        </VisuallyHidden.Root>
                        <div className="relative w-full max-w-[300px] aspect-square bg-white rounded-xl p-4">
                            {paymentQrUrl && (
                                <Image
                                    src={paymentQrUrl}
                                    alt="Payment QR Full"
                                    fill
                                    className="object-contain"
                                />
                            )}
                        </div>
                        <p className="mt-4 text-center font-bold text-lg font-kantumruy text-foreground">{t("gifts.qr.scan")}</p>
                    </DialogContent>
                </Dialog>

                <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px] font-kantumruy">
                    {t("gifts.qr.description")}
                </p>
            </div>
        </div>
    );
}
