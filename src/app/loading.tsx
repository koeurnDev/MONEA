import { MoneaBranding } from "@/components/MoneaBranding";

export default function GlobalLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="scale-150">
                <MoneaBranding />
            </div>
        </div>
    );
}
