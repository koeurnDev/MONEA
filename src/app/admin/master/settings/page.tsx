"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, ShieldAlert, ArrowLeft, Save, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MasterSettingsPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/master/settings")
            .then(res => res.json())
            .then(setConfig)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/admin/master/settings", {
                method: "POST",
                body: JSON.stringify(config),
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
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
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-slate-200"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Save System Configuration
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
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
