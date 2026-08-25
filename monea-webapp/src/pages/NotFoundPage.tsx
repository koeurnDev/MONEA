import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4">404</h1>
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">រកមិនឃើញទំព័រនេះទេ</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 font-kantumruy">
                ទំព័រដែលអ្នកកំពុងស្វែងរកប្រហែលជាត្រូវបានលុប ប្ដូរឈ្មោះ ឬមិនមានតាំងពីដំបូង។
            </p>
            <Link to="/">
                <Button size="lg" className="font-kantumruy font-bold rounded-full px-8">
                    ត្រឡប់ទៅទំព័រដើម
                </Button>
            </Link>
        </div>
    );
}
