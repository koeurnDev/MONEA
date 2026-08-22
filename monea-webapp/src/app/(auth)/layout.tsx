import { ToastProvider } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
                {children}
            </div>
        </ToastProvider>
    );
}
