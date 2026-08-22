"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Copy, Download, RefreshCw, CheckCircle2, AlertCircle, Lock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TwoFactorSetupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function TwoFactorSetup({ open, onOpenChange, onSuccess }: TwoFactorSetupProps) {
    const [step, setStep] = useState(1); // 1: QR & Codes, 2: Verification
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [setupData, setSetupData] = useState<{ qrCodeDataUrl: string, recoveryCodes: string[] } | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [password, setPassword] = useState("");

    const fetchSetupData = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/2fa/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.error) {
                const msg = data.details ? `${data.error}: ${data.details}` : data.error;
                throw new Error(msg);
            }
            setSetupData(data);
            setStep(1); // Move to QR step on success
        } catch (err: any) {
            setError(err.message || "Failed to load setup data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            setStep(0); // Start with password verification
            setVerificationCode("");
            setPassword("");
            setError("");
            setSetupData(null);
        }
    }, [open]);

    const handleVerify = async () => {
        if (!verificationCode) return;
        setVerifying(true);
        setError("");
        try {
            const res = await fetch("/api/auth/2fa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: verificationCode })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (onSuccess) onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ");
        } finally {
            setVerifying(false);
        }
    };

    const copyRecoveryCodes = () => {
        if (!setupData) return;
        const text = setupData.recoveryCodes.join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!setupData) return;
        const formattedDate = new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            timeZone: 'Asia/Phnom_Penh'
        });
        const content = `MONEA RECOVERY CODES\n\nGenerated: ${formattedDate}\n\nKeep these codes in a safe place. Each code can be used once.\n\n${setupData.recoveryCodes.join("\n")}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `monea-recovery-codes-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                <div className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Lock size={120} />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-kantumruy flex items-center gap-3">
                            <Shield className="text-red-500" />
                            រៀបចំប្រព័ន្ធការពារ ២ ជាន់ (2FA)
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-kantumruy text-base mt-2">
                            បង្កើនសុវត្ថិភាពខ្ពស់បំផុតសម្រាប់គណនីរបស់អ្នក។
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8 bg-white max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <RefreshCw className="w-10 h-10 animate-spin text-red-600" />
                            <p className="font-kantumruy text-slate-500">កំពុងរៀបចំទិន្នន័យសុវត្ថិភាព...</p>
                        </div>
                    ) : step === 0 ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                fetchSetupData();
                            }}
                            className="space-y-6 py-4"
                        >
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-900 font-kantumruy">សូមបញ្ជាក់ពាក្យសម្ងាត់របស់អ្នក ដើម្បីបន្ត៖</Label>
                                {/* Accessibility: Hidden username field */}
                                <input type="text" name="username" defaultValue={""} autoComplete="username" className="hidden" aria-hidden="true" />
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="បញ្ចូលពាក្យសម្ងាត់"
                                        className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-red-600/20 text-lg"
                                        autoFocus
                                        autoComplete="current-password"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 font-kantumruy italic">
                                    * នេះគឺជាការតម្រូវផ្នែកសុវត្ថិភាព មុននឹងបង្ហាញលេខកូដសម្ងាត់ 2FA។
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold animate-shake">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={!password || loading}
                                className="w-full bg-slate-900 text-white hover:bg-black rounded-xl h-14 font-black text-base font-kantumruy transition-all shadow-lg active:scale-[0.98]"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                                បន្តទៅមុខទៀត
                            </Button>
                        </form>
                    ) : setupData ? (
                        <div className="space-y-8">
                            {/* Step 1 Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900 font-kantumruy flex items-center gap-2">
                                        <Badge variant="outline" className="rounded-full w-6 h-6 p-0 flex items-center justify-center border-slate-900 text-slate-900">1</Badge>
                                        ស្កេន QR Code
                                    </h4>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-4">
                                        {setupData.qrCodeDataUrl && (
                                            <Image src={setupData.qrCodeDataUrl} alt="2FA QR Code" width={192} height={192} className="w-48 h-48" unoptimized />
                                        )}
                                        <p className="text-[10px] text-slate-500 text-center font-kantumruy">ប្រើកម្មវិធី Google Authenticator ឬ Telegram ដើម្បីស្កេន។</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900 font-kantumruy flex items-center gap-2">
                                        <Badge variant="outline" className="rounded-full w-6 h-6 p-0 flex items-center justify-center border-slate-900 text-slate-900">2</Badge>
                                        រក្សាទុកលេខកូដបម្រុង
                                    </h4>
                                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100 space-y-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {setupData.recoveryCodes.map((code, idx) => (
                                                <code key={idx} className="text-[11px] font-mono text-red-700 bg-white p-1.5 rounded-lg border border-red-50 text-center uppercase tracking-wider">
                                                    {code}
                                                </code>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-[11px] h-9 rounded-xl font-kantumruy gap-2 border-red-200 text-red-700 hover:bg-red-100/50"
                                                onClick={copyRecoveryCodes}
                                            >
                                                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                                {copied ? "បានចម្លង" : "ចម្លងទុក"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-[11px] h-9 rounded-xl font-kantumruy gap-2 border-red-200 text-red-700 hover:bg-red-100/50"
                                                onClick={handleDownload}
                                            >
                                                {downloaded ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                                                {downloaded ? "បានទាញយក" : "ទាញយក .txt"}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-red-600 font-bold font-kantumruy italic">
                                        * សំខាន់៖ លេខកូដទាំងនេះប្រើសម្រាប់ Login នៅពេលអ្នកបាត់ទូរស័ព្ទ។ សូមរក្សាវាទុកឱ្យបានល្អបំផុត!
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex flex-col items-center space-y-4">
                                <h4 className="font-bold text-slate-900 font-kantumruy flex items-center gap-2">
                                    <Badge variant="outline" className="rounded-full w-6 h-6 p-0 flex items-center justify-center border-slate-900 text-slate-900">3</Badge>
                                    ផ្ទៀងផ្ទាត់លេខកូដ
                                </h4>
                                <div className="w-full max-w-xs space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 font-kantumruy">បញ្ចូលលេខកូដ ៦ខ្ទង់ ពីទូរស័ព្ទរបស់អ្នក៖</Label>
                                        <Input
                                            value={verificationCode}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                const val = raw.replace(/[០-៩]/g, (d) =>
                                                    (d.charCodeAt(0) - 6112).toString()
                                                ).replace(/[^0-9]/g, "");
                                                console.log("[2FA] Typing:", val); // Log on client to see what's being captured
                                                setVerificationCode(val);
                                            }}
                                            placeholder="000000"
                                            className="h-14 text-center text-3xl font-black rounded-2xl bg-white border-2 border-slate-200 focus:border-red-500 focus-visible:ring-red-600/20 text-blue-600 placeholder:text-slate-300"
                                            maxLength={6}
                                            inputMode="numeric"
                                        />
                                    </div>
                                    {error && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold animate-shake">
                                            <AlertCircle size={14} />
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 space-y-4">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                            <p className="font-kantumruy text-red-600 font-bold">{error || "មានបញ្ហានៅក្នុងដំឡើង។"}</p>
                            <Button variant="outline" onClick={fetchSetupData} className="rounded-xl">ព្យាយាមម្ដងទៀត</Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex sm:justify-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-12 font-bold font-kantumruy"
                        disabled={verifying}
                    >
                        បោះបង់
                    </Button>
                    <Button
                        onClick={handleVerify}
                        disabled={!verificationCode || loading || verifying || !setupData}
                        className="bg-slate-900 text-white hover:bg-black rounded-xl h-12 px-8 font-bold font-kantumruy flex items-center gap-2"
                    >
                        {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        បញ្ជាក់ និងបើកដំណើរការ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
