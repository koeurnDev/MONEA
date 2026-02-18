'use client';

import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-white text-center">
                <h2 className="text-3xl font-bold text-red-600">មានបញ្ហាធ្ងន់ធ្ងរ!</h2>
                <p className="text-gray-600">កម្មវិធីបានជួបបញ្ហាមិនអាចដំណើរការបាន។</p>
                <Button onClick={() => reset()}>ព្យាយាមម្តងទៀត</Button>
            </body>
        </html>
    );
}
