import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50 text-center">
            <h2 className="text-4xl font-bold text-gray-900">404</h2>
            <p className="text-xl text-gray-600">រកមិនឃើញទំព័រដែលអ្នកកំពុងស្វែងរកទេ។</p>
            <Link href="/">
                <Button>ត្រឡប់ទៅទំព័រដើម</Button>
            </Link>
        </div>
    );
}
