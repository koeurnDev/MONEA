export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
            {children}
        </div>
    );
}
