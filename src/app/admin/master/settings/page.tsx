"use client";
import React, { useState, useEffect } from 'react';
import { moneaClient } from "@/lib/api-client";
import Image from "next/image";
import Link from "next/link";
import { 
    ArrowLeft, 
    Save, 
    Loader2, 
    ShieldAlert, 
    History as HistoryIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function MasterSettingsPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 2FA States
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [secret, setSecret] = useState<string | null>(null);
    const [is2FASetupLoading, setIs2FASetupLoading] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false); // We should ideally get this from an API, assuming false for now if not setup

    useEffect(() => {
        moneaClient.get("/api/admin/master/settings")
            .then(res => setConfig(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await moneaClient.post("/api/admin/master/settings", config);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleSetup2FA = async () => {
        setIs2FASetupLoading(true);
        try {
            const res = await moneaClient.post<any>("/api/auth/2fa/setup", {});
            if (res.data?.qrCodeDataUrl) {
                setQrCode(res.data.qrCodeDataUrl);
                setSecret(res.data.secret);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIs2FASetupLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        setIs2FASetupLoading(true);
        try {
            const res = await moneaClient.post<any>("/api/auth/2fa/verify", { token: twoFactorToken });
            if (res.data?.success) {
                setIs2FAEnabled(true);
                setQrCode(null);
            } else {
                alert(res.data?.error || "Invalid Token");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIs2FASetupLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global Feature Control</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">System-Wide Authority</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/admin/governance">
                            <Button variant="outline" className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 border-slate-200">
                                <HistoryIcon size={16} />
                                Governance & Versions
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-slate-200"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                            Save System Configuration
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">

                    {/* Master Account 2FA */}
                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex flex-col space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="w-5 h-5 text-indigo-500" />
                                        <Label className="text-lg font-black text-slate-900">Two-Factor Authentication (2FA)</Label>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium w-3/4">
                                        Protect your Master Admin account with an additional layer of security using an Authenticator app (e.g., Google Authenticator).
                                    </p>
                                </div>

                                {is2FAEnabled ? (
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-bold text-green-800">2FA is currently ENABLED and protecting your account.</span>
                                    </div>
                                ) : !qrCode ? (
                                    <div>
                                        <Button
                                            onClick={handleSetup2FA}
                                            disabled={is2FASetupLoading}
                                            className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
                                        >
                                            {is2FASetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set up 2FA"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col md:flex-row gap-8 items-center">
                                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 relative w-32 h-32">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <Image src={qrCode} alt="2FA QR Code" fill className="rounded-xl object-contain p-1" unoptimized />
                                        </div>
                                        <div className="space-y-3 flex-1 flex flex-col">
                                            <p className="text-xs text-slate-500 font-medium">1. Scan this QR Code with your Authenticator app.</p>
                                            <p className="text-xs text-slate-500 font-medium">2. Enter the 6-digit code below to verify and enable 2FA.</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter 6-digit code"
                                                    className="h-10 px-4 w-48 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                                                    value={twoFactorToken}
                                                    onChange={(e) => setTwoFactorToken(e.target.value)}
                                                    maxLength={6}
                                                />
                                                <Button
                                                    onClick={handleVerify2FA}
                                                    disabled={is2FASetupLoading || twoFactorToken.length < 6}
                                                    className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
                                                >
                                                    {is2FASetupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Maintenance Mode */}
                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 pr-12">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <Label className="text-lg font-black text-slate-900">Maintenance Mode</Label>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">
                                        When active, all public routes and customer dashboards will show a maintenance page.
                                        Only <span className="text-red-600 font-bold italic">Superadmins</span> can bypass this.
                                    </p>
                                </div>
                                <Switch
                                    checked={config?.maintenanceMode}
                                    onCheckedChange={(val) => setConfig({ ...config, maintenanceMode: val })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* New Signups */}
                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 pr-12">
                                    <Label className="text-lg font-black text-slate-900">Restrict New Signups</Label>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Stop the public from creating new wedding accounts. Existing users remain unaffected.
                                    </p>
                                </div>
                                <Switch
                                    checked={!config?.allowNewSignups}
                                    onCheckedChange={(val) => setConfig({ ...config, allowNewSignups: !val })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Global Check-in */}
                    <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 pr-12">
                                    <Label className="text-lg font-black text-slate-900">Global Check-in Freeze</Label>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Disable QR check-in capabilities for ALL staff across the entire platform.
                                        Useful for emergency system lockouts.
                                    </p>
                                </div>
                                <Switch
                                    checked={!config?.globalCheckIn}
                                    onCheckedChange={(val) => setConfig({ ...config, globalCheckIn: !val })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100 flex gap-4">
                    <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                    <div>
                        <h4 className="font-black text-amber-900 text-sm uppercase tracking-tight mb-1">Warning: Master Overrides</h4>
                        <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
                            Changes made here take effect globally and immediately. Maintenance mode will disconnect active users and may disrupt ongoing wedding events. Use with extreme caution.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
