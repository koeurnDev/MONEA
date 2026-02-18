'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
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
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50 text-center">
            <h2 className="text-2xl font-bold text-gray-900">មានបញ្ហាបច្ចេកទេស!</h2>
            <p className="text-gray-500">សូមអភ័យទោស យើងកំពុងជួបបញ្ហាបន្តិចបន្តួច។</p>
            <div className="flex gap-4">
                <Button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                >
                    ព្យាយាមម្តងទៀត
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    ត្រឡប់ទៅទំព័រដើម
                </Button>
            </div>
        </div>
    );
}
