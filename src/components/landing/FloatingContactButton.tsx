"use client";

import Link from "next/link";
import { m } from 'framer-motion';
import { MessageCircle } from "lucide-react";

export function FloatingContactButton() {
    return (
        <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
        >
            <Link href="https://t.me/monea_support" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] hover:-translate-y-1 transition-all duration-300">
                <MessageCircle className="w-6 h-6" />
            </Link>
        </m.div>
    );
}
