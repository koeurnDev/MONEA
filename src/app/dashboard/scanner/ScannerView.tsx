"use client";

import { useState, useRef, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    QrCode,
    CheckCircle2,
    XCircle,
    Loader2,
    Camera,
    RefreshCcw,
    UserCheck,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScannerView({ weddingId }: { weddingId?: string }) {
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastGuest, setLastGuest] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleScan = async (data: any) => {
        if (data && data.text && !loading) {
            const guestId = data.text;
            setResult(guestId);
            await processCheckIn(guestId);
        }
    };

    const processCheckIn = async (guestId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/guests/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ guestId, weddingId })
            });

            const data = await response.json();

            if (response.ok) {
                setLastGuest(data.guest);
                // Vibrate if supported
                if (window.navigator?.vibrate) {
                    window.navigator.vibrate([100, 50, 100]);
                }
                showToast(`ស្វាគមន៍ ${data.guest.name}!`, 'success');
            } else {
                setError(data.error || "ការឆែកចូលមិនបានសម្រេច");
                showToast(data.error || "បញ្ហាឆែកចូល", 'error');
            }
        } catch (err) {
            setError("បញ្ហាភ្ជាប់ប្រព័ន្ធ");
            showToast("Network Error", 'error');
        } finally {
            setLoading(false);
            // Reset scanner after 2 seconds to allow next scan
            setTimeout(() => setResult(null), 2000);
        }
    };

    const handleError = (err: any) => {
        console.error(err);
        setError("មិនអាចបើកកាមេរ៉ាបានទេ");
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4 safe-bottom">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black font-kantumruy tracking-tight flex items-center justify-center gap-3">
                    <QrCode className="w-8 h-8 text-red-600" />
                    ស្កេន QR ភ្ញៀវ
                </h1>
                <p className="text-muted-foreground font-medium font-kantumruy">
                    សូមដាក់ QR ឱ្យចំកណ្តាលកាមេរ៉ា
                </p>
            </div>

            {/* Scanner Container */}
            <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border-4 border-card group">
                {isCameraActive ? (
                    <QrScanner
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        constraints={{
                            video: { facingMode: "environment" }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-4">
                        <Camera className="w-16 h-16 opacity-20" />
                        <span className="font-kantumruy font-bold">កាមេរ៉ាកំពុងបិទ</span>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Corner Borders */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-white/50 rounded-tl-xl" />
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-white/50 rounded-tr-xl" />
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-white/50 rounded-bl-xl" />
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-white/50 rounded-br-xl" />

                    {/* Scanning Line */}
                    {isCameraActive && !loading && !lastGuest && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50 blur-[2px] animate-scanline" />
                    )}
                </div>

                {/* Loading/Result Overlay */}
                {(loading || lastGuest || error) && (
                    <div className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300",
                        loading ? "bg-black/20" :
                            lastGuest ? "bg-emerald-500/20" :
                                "bg-red-500/20"
                    )}>
                        {loading && <Loader2 className="w-16 h-16 text-white animate-spin" />}
                        {lastGuest && !loading && (
                            <div className="animate-in zoom-in-50 duration-300 flex flex-col items-center">
                                <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4 fill-white" />
                                <span className="bg-white px-6 py-2 rounded-full font-black text-emerald-600 shadow-xl font-kantumruy">
                                    ជោគជ័យ!
                                </span>
                            </div>
                        )}
                        {error && !loading && (
                            <div className="animate-in bounce-in duration-300 flex flex-col items-center">
                                <XCircle className="w-20 h-20 text-red-500 mb-4 fill-white" />
                                <span className="bg-white px-6 py-2 rounded-full font-black text-red-600 shadow-xl font-kantumruy">
                                    បរាជ័យ
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Last Scanned Status */}
            <Card className="w-full p-6 bg-card/50 backdrop-blur-xl border-none shadow-xl rounded-[2rem]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest font-kantumruy">ស្ថានភាពចុងក្រោយ</span>
                    {lastGuest && <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500"><UserCheck className="w-4 h-4" /></div>}
                </div>

                {lastGuest ? (
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-black text-foreground font-kantumruy line-clamp-1">{lastGuest.name}</span>
                        <div className="flex items-center gap-2 text-muted-foreground font-bold font-kantumruy">
                            <Users className="w-4 h-4" />
                            <span>{lastGuest.group || 'ទូទៅ'}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground font-medium font-kantumruy italic">
                        មិនទាន់មានទិន្នន័យ...
                    </p>
                )}
            </Card>

            <div className="flex gap-4 w-full">
                <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-bold font-kantumruy border-2"
                    onClick={() => setIsCameraActive(!isCameraActive)}
                >
                    <RefreshCcw className={cn("mr-2 h-4 w-4", !isCameraActive && "animate-spin")} />
                    {isCameraActive ? "បិទកាមេរ៉ា" : "បើកកាមេរ៉ា"}
                </Button>
            </div>

            {/* Custom Toast Notification */}
            {toast && (
                <div className={cn(
                    "fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl font-bold font-kantumruy animate-in fade-in slide-in-from-bottom-10 duration-300 z-[100]",
                    toast.type === 'success' ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                )}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
