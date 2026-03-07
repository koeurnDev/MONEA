"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HeartOff } from "lucide-react";
import Link from "next/link";

export default function WeddingError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
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
                សូមអភ័យទោស (Oops!)
            </h1>

            <p className="text-white/60 font-khmer max-w-sm mb-12">
                មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួចនៅពេលកំពុងទាញយកទិន្នន័យ។ សូមព្យាយាមម្តងទៀត។
            </p>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button
                    onClick={() => reset()}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 font-bold"
                >
                    ព្យាយាមម្តងទៀត (Try Again)
                </Button>

                <Link
                    href="/"
                    className="text-white/40 hover:text-white transition-colors text-xs font-khmer uppercase tracking-widest py-2"
                >
                    ត្រឡប់ទៅទំព័រដើម
                </Link>
            </div>

            <div className="mt-20 opacity-20 filter grayscale">
                <img src="/favicon.png" alt="MONEA" className="w-12 h-12 mx-auto grayscale" />
            </div>
        </div>
    );
}
