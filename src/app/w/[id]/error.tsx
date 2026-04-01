"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HeartOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n/LanguageProvider";

export default function WeddingError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useTranslation();
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-8 border border-rose-500/20">
                <HeartOff className="text-rose-500 w-10 h-10" />
            </div>

            <h1 className="font-moul text-2xl md:text-3xl text-white mb-4">
                {t("common.errors.oops")}
            </h1>

            <p className="text-white/60 font-khmer max-w-sm mb-12">
                {t("common.errors.unexpected")}
            </p>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button
                    onClick={() => reset()}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 font-bold"
                >
                    {t("common.actions.tryAgain")}
                </Button>

                <Link
                    href="/"
                    className="text-white/40 hover:text-white transition-colors text-xs font-khmer uppercase tracking-widest py-2"
                >
                    {t("common.auth.backToHome")}
                </Link>
            </div>

            <div className="mt-20 opacity-20 filter grayscale">
                <Image src="/favicon.png" alt="MONEA" width={48} height={48} className="mx-auto grayscale" />
            </div>
        </div>
    );
}
