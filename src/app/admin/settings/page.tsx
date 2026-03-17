"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Shield, Globe, Save, AlertTriangle, RefreshCw, Sliders, Lock, Megaphone, CheckCircle, LogOut, History, MapPin, Monitor, Smartphone, Fingerprint } from "lucide-react";
import { m } from 'framer-motion';
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";
import { useEffect, useCallback } from "react";

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saveToast, setSaveToast] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    // Security Logs & Revocation State
    const [securityLogs, setSecurityLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const fetchLogs = useCallback(async () => {
        setLoadingLogs(true);
        try {
            const res = await fetch("/api/admin/security/logs");
            const data = await res.json();
            if (Array.isArray(data)) setSecurityLogs(data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "security") {
            fetchLogs();
        }
    }, [activeTab, fetchLogs]);

    const handleRevokeSessions = async () => {
        if (!confirm("តើអ្នកពិតជាចង់ចាកចេញពីគ្រប់ឧបករណ៍ទាំងអស់មែនទេ?")) return;
        setRevoking(true);
        try {
            const res = await fetch("/api/admin/security/revoke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "SELF" })
            });
            const data = await res.json();
            if (data.success) {
                alert("បានផ្ដាច់ Session ពីគ្រប់ឧបករណ៍ដោយជោគជ័យ។ លោកអ្នកនឹងត្រូវ Login ម្ដងទៀត។");
                window.location.reload();
            }
        } catch (err) {
            alert("មានបញ្ហាក្នុងការផ្ដាច់ Session។");
        } finally {
            setRevoking(false);
        }
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaveToast(true);
            setTimeout(() => setSaveToast(false), 2500);
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <TwoFactorSetup
                open={show2FASetup}
                onOpenChange={setShow2FASetup}
                onSuccess={() => setIs2FAEnabled(true)}
            />
            {saveToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
                    ✅ រក្សាទុកការកំណត់ដោយជោគជ័យ!
                </div>
            )}

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2">
                        <Sliders size={12} />
                        Administrative Control
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground font-kantumruy">
                        ការកំណត់ប្រព័ន្ធ (System Settings)
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm font-kantumruy max-w-lg mt-2">
                        គ្រប់គ្រងស្ថានភាពគេហទំព័រ និងការកំណត់សកលសម្រាប់វេទិកា MONEA ។ អ្នកអាចកែប្រែការកំណត់តាមផ្នែកនីមួយៗបានយ៉ាងងាយស្រួល។
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 px-8 font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="font-kantumruy">រក្សាទុកការប្រែប្រួល</span>
                </Button>
            </div>

            {/* Main Tabs Layout */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-muted border text-center h-auto border-border p-1 rounded-2xl inline-flex flex-wrap shadow-sm">
                    <TabsTrigger value="general" className="rounded-xl px-6 py-3 font-semibold text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2 font-kantumruy">
                        <Globe size={16} /> ទូទៅ (General)
                    </TabsTrigger>
                    <TabsTrigger value="status" className="rounded-xl px-6 py-3 font-semibold text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-2 font-kantumruy">
                        <AlertTriangle size={16} /> ស្ថានភាព (Status)
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl px-6 py-3 font-semibold text-sm data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all gap-2 font-kantumruy">
                        <Shield size={16} /> សុវត្ថិភាព (Security)
                    </TabsTrigger>
                </TabsList>

                {/* Tab: General Preferences */}
                <TabsContent value="general" className="mt-0 outline-none">
                    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden border">
                            <CardHeader className="border-b border-border/50 p-8">
                                <CardTitle className="text-xl font-black text-foreground font-kantumruy">ចំណូលចិត្តសកល (Global Preferences)</CardTitle>
                                <CardDescription className="font-kantumruy text-sm mt-2">
                                    កំណត់ភាសា រូបិយប័ណ្ណ និងមុខងារគោលរបស់ប្រព័ន្ធ។
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">រូបិយប័ណ្ណលំនាំដើម (Default Currency)</Label>
                                        <Select defaultValue="usd">
                                            <SelectTrigger className="h-14 bg-muted/50 border-border focus:ring-red-500 focus:border-red-500 rounded-xl text-foreground font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border">
                                                <SelectItem value="usd">USD ($) - ដុល្លារអាមេរិក</SelectItem>
                                                <SelectItem value="khr">KHR (៛) - ប្រាក់រៀល</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground font-kantumruy">រូបិយប័ណ្ណគោលដែលនឹងបង្ហាញនៅទូទាំងប្រព័ន្ធ Chinar ។</p>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ភាសាលំនាំដើម (Default Language)</Label>
                                        <Select defaultValue="kh">
                                            <SelectTrigger className="h-14 bg-muted/50 border-border focus:ring-red-500 focus:border-red-500 rounded-xl text-foreground font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border">
                                                <SelectItem value="kh">ភាសាខ្មែរ (Khmer)</SelectItem>
                                                <SelectItem value="en">English (អង់គ្លេស)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground font-kantumruy">ភាសាដែលប្រព័ន្ធនឹងជ្រើសរើសដោយស្វ័យប្រវត្តិសម្រាប់អ្នកប្រើប្រាស់ថ្មី។</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-base font-bold text-foreground font-kantumruy">អនុញ្ញាតការចុះឈ្មោះ (Enable Signups)</Label>
                                            <p className="text-sm text-muted-foreground font-kantumruy max-w-md">បើកឱ្យអ្នកប្រើប្រាស់ថ្មីអាចបង្កើតគណនី និងសាកល្បងវេទិកានេះដោយខ្លួនឯង។</p>
                                        </div>
                                        <Switch defaultChecked className="data-[state=checked]:bg-blue-600 scale-110 shrink-0" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>
                </TabsContent>

                {/* Tab: Status & Announcements */}
                <TabsContent value="status" className="mt-0 outline-none">
                    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden border">
                            <CardHeader className="border-b border-border/50 p-8">
                                <CardTitle className="text-xl font-black text-foreground font-kantumruy">ស្ថានភាព និងការជូនដំណឹង</CardTitle>
                                <CardDescription className="font-kantumruy text-sm mt-2">
                                    គ្រប់គ្រងការជូនដំណឹងដល់អ្នកប្រើប្រាស់ និងបិទប្រព័ន្ធបណ្តោះអាសន្ន។
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <Megaphone size={14} /> សេចក្តីជូនដំណឹងសកល (Global Banner)
                                    </Label>
                                    <Input
                                        placeholder="ឧទាហរណ៍៖ ប្រព័ន្ធនឹងធ្វើការអាប់ដេតនៅម៉ោង ១២ យប់នេះ..."
                                        className="h-14 bg-muted/50 border-border rounded-xl text-foreground font-kantumruy focus-visible:ring-red-600/20 px-4"
                                    />
                                    <p className="text-xs text-muted-foreground font-kantumruy mt-2">
                                        បើទុកចោលទទេ សារជូនដំណឹងនឹងមិនត្រូវបានបង្ហាញនោះទេ។ វាជួយប្រាប់អ្នកប្រើប្រាស់ពីព័ត៌មានសំខាន់ៗ។
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 gap-4">
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle size={18} className="text-orange-500" />
                                                <Label className="text-base font-bold text-foreground font-kantumruy">របៀបថែទាំប្រព័ន្ធ (Maintenance Mode)</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-kantumruy">
                                                បិទការចូលប្រើប្រាស់គេហទំព័រជាបណ្ដោះអាសន្នសម្រាប់អ្នកប្រើប្រាស់ទូទៅ។ មានតែគណនីគ្រប់គ្រង (Admin) ប៉ុណ្ណោះដែលអាចចូលបាន។
                                            </p>
                                        </div>
                                        <Switch className="data-[state=checked]:bg-orange-600 scale-110 shrink-0" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>
                </TabsContent>

                {/* Tab: Security */}
                <TabsContent value="security" className="mt-0 outline-none">
                    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden border">
                            <CardHeader className="border-b border-border/50 p-8">
                                <CardTitle className="text-xl font-black text-foreground font-kantumruy flex items-center gap-2">
                                    <Lock size={20} className="text-foreground" />
                                    សុវត្ថិភាពកម្រិតខ្ពស់ (Security)
                                </CardTitle>
                                <CardDescription className="font-kantumruy text-sm mt-2">
                                    ការកំណត់ដែលទាក់ទងនឹងសុវត្ថិភាពនៃការភ្ជាប់ និងការសម្គាល់អត្តសញ្ញាណ។
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-muted/50 border border-border gap-6">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-base font-bold text-foreground font-kantumruy">រៀបចំប្រព័ន្ធការពារ ២ ជាន់ (2FA)</Label>
                                            {is2FAEnabled && (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none px-2 py-0 h-5 text-[10px] font-bold">
                                                    សកម្ម (Active)
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground font-kantumruy">
                                            បង្កើនសុវត្ថិភាពខ្ពស់បំផុតសម្រាប់គណនីរបស់អ្នក។
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        {is2FAEnabled ? (
                                            <Button variant="outline" className="rounded-xl border-border text-muted-foreground font-bold font-kantumruy gap-2" disabled>
                                                <CheckCircle size={16} /> បានបើករួចរាល់
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => setShow2FASetup(true)}
                                                className="bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold font-kantumruy flex items-center gap-2 px-6"
                                            >
                                                <Shield size={16} /> រៀបចំ 2FA ឥឡូវនេះ
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-muted/50 border border-border gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <Label className="text-base font-bold text-foreground font-kantumruy">សុវត្ថិភាព IP កម្រិតខ្ពស់</Label>
                                        <p className="text-sm text-muted-foreground font-kantumruy">
                                            តាមដាន និងបិទសិទ្ធិដោយស្វ័យប្រវត្តិសម្រាប់ IP ដេលមានសកម្មភាពគួរឱ្យសង្ស័យ ដូចជាការព្យាយាមចូលច្រើនដងមិនជោគជ័យ។
                                        </p>
                                    </div>
                                    <Switch defaultChecked className="data-[state=checked]:bg-foreground scale-110 shrink-0" />
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between p-6 rounded-2xl bg-red-500/10 border border-red-500/20 gap-6">
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2">
                                                <LogOut size={18} className="text-red-500" />
                                                <Label className="text-base font-bold text-foreground font-kantumruy">ផ្ដាច់ Session ពីឧបករណ៍ទាំងអស់ (Remote Logout)</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-kantumruy">
                                                ប្រសិនបើអ្នកសង្ស័យថាមានគេលួចប្រើគណនីរបស់អ្នក ឬបាត់ទូរស័ព្ទ លោកអ្នកអាចចុចប៊ូតុងនេះដើម្បីផ្ដាច់ការតភ្ជាប់ពីគ្រប់ឧបករណ៍ទាំងអស់ភ្លាមៗ។
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            onClick={handleRevokeSessions}
                                            disabled={revoking}
                                            className="rounded-xl font-bold font-kantumruy bg-red-600 hover:bg-red-700 shrink-0"
                                        >
                                            {revoking ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Shield size={16} className="mr-2" />}
                                            ផ្ដាច់ Session ទាំងអស់
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <History size={14} /> សកម្មភាពសុវត្ថិភាពចុងក្រោយ (Security Activity)
                                        </h4>
                                        <Button variant="ghost" size="sm" onClick={fetchLogs} className="h-8 text-[10px] font-bold text-muted-foreground uppercase">
                                            <RefreshCw size={10} className={`mr-1 ${loadingLogs ? 'animate-spin' : ''}`} /> Update
                                        </Button>
                                    </div>

                                    <div className="rounded-2xl border border-border overflow-hidden bg-muted/30">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-muted/50">
                                                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Event</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Detail</th>
                                                    <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {loadingLogs ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-10 text-center text-xs text-muted-foreground font-kantumruy">កំពុងទាញយកទិន្នន័យ...</td>
                                                    </tr>
                                                ) : securityLogs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-10 text-center text-xs text-muted-foreground font-kantumruy">មិនមានសកម្មភាពគួរឱ្យកត់សម្គាល់</td>
                                                    </tr>
                                                ) : securityLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-card transition-colors group">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1.5 rounded-lg ${log.event === 'LOGIN_SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                                                    {log.event === 'LOGIN_SUCCESS' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                                                                </div>
                                                                <span className="text-[11px] font-black text-foreground tracking-tight">{log.event.replace('_', ' ')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                                                                        <MapPin size={10} className="text-muted-foreground/60" /> {log.geoIp || "Unknown"}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                                                                        <Monitor size={10} className="text-muted-foreground/60" /> {log.ip}
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground font-medium line-clamp-1">{log.userAgent}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="text-[10px] font-bold text-foreground">{new Date(log.createdAt).toLocaleString('km-KH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Phnom_Penh' })}</div>
                                                            <div className="text-[9px] text-muted-foreground font-medium">{new Date(log.createdAt).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                        <Smartphone size={20} className="text-orange-500 shrink-0" />
                                        <p className="text-[11px] text-orange-600 font-medium font-kantumruy italic">
                                            ចំណាំ៖ ប្រសិនបើលោកអ្នកឃើញសកម្មភាព Login ពីទីតាំង ឬឧបករណ៍ដែលមិនស្គាល់ សូមផ្លាស់ប្ដូរ password និងបិទ Session ទាំងអស់ជាបន្ទាន់។
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
