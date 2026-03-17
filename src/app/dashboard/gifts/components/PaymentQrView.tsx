"use client";

import Image from "next/image";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PaymentQrViewProps {
    paymentQrUrl: string | null;
}

export function PaymentQrView({ paymentQrUrl }: PaymentQrViewProps) {
    if (!paymentQrUrl) return null;

    return (
        <div className="mt-6 border-t border-border pt-6">
            <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col items-center shadow-sm">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 font-kantumruy">
                    <span>ឰ QR សម្រាប់ស្កេន</span>
                </p>

                {/* Click to Expand/Zoom */}
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="relative w-48 h-48 bg-white rounded-lg overflow-hidden border border-border cursor-zoom-in hover:opacity-90 transition-opacity">
                            <Image
                                src={paymentQrUrl}
                                alt="Payment QR"
                                fill
                                className="object-contain p-2"
                            />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 bg-card">
                        <VisuallyHidden.Root>
                            <DialogTitle>ស្កេន QR កូដ (Scan Payment QR)</DialogTitle>
                            <DialogDescription>
                                ពង្រីក QR កូដសម្រាប់ការទូទាត់ (Enlarged QR code for payment)
                            </DialogDescription>
                        </VisuallyHidden.Root>
                        <div className="relative w-full max-w-[300px] aspect-square bg-white rounded-xl p-4">
                            <Image
                                src={paymentQrUrl}
                                alt="Payment QR Full"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="mt-4 text-center font-bold text-lg font-kantumruy text-foreground">ស្កេនដើម្បីទូទាត់</p>
                    </DialogContent>
                </Dialog>

                <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px] font-kantumruy">
                    បង្ហាញ QR នេះជូនភ្ញៀវប្រសិនបើពួកគាត់ចង់វេរលុយ
                </p>
            </div>
        </div>
    );
}
