"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Shield, Globe, Zap, Save, AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saveToast, setSaveToast] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaveToast(true);
            setTimeout(() => setSaveToast(false), 2500);
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {saveToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-2">
                    ✅ រក្សាទុកការកំណត់ដោយជោគជ័យ!
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
                        <Shield size={12} />
                        Administrative Control
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 font-kantumruy">
                        ការកំណត់ប្រព័ន្ធ
                    </h2>
                    <p className="text-slate-500 font-medium text-sm font-kantumruy max-w-lg">
                        គ្រប់គ្រងស្ថានភាពគេហទំព័រ និងការកំណត់សកលសម្រាប់វេទិកា MONEA ។
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-red-600 text-white hover:bg-red-700 rounded-xl h-12 px-6 font-bold transition-all shadow-lg shadow-red-100 flex items-center gap-2"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="font-kantumruy">រក្សាទុក</span>
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-1">
                {/* Site Status Control */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden border">
                        <CardHeader className="border-b border-slate-50 p-6 px-8">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <CardTitle className="text-lg font-bold text-slate-900 font-kantumruy">ស្ថានភាពគេហទំព័រ</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="space-y-1">
                                    <Label className="text-sm font-bold text-slate-900 font-kantumruy">របៀបថែទាំ (Maintenance Mode)</Label>
                                    <p className="text-xs text-slate-500 font-kantumruy">បិទការចូលប្រើប្រាស់ជាបណ្ដោះអាសន្ន។</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-red-600" />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">សេចក្តីជូនដំណឹងសកល (Site Banner)</Label>
                                <Input
                                    placeholder="បញ្ចូលសារជូនដំណឹង..."
                                    className="h-12 bg-white border-slate-100 rounded-xl text-slate-900 font-kantumruy focus-visible:ring-red-600/20"
                                />
                                <p className="text-[10px] text-slate-400 italic">សារនេះនឹងបង្ហាញដល់អ្នកគ្រប់គ្នាដែលចូលមកកាន់គេហទំព័រ។</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Global Preferences */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden border">
                        <CardHeader className="border-b border-slate-50 p-6 px-8">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-blue-500" />
                                <CardTitle className="text-lg font-bold text-slate-900 font-kantumruy">ចំណូលចិត្តសកល</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">រូបិយប័ណ្ណលំនាំដើម</Label>
                                    <Select defaultValue="usd">
                                        <SelectTrigger className="h-12 bg-white border-slate-100 rounded-xl text-slate-900">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100">
                                            <SelectItem value="usd">USD ($)</SelectItem>
                                            <SelectItem value="khr">KHR (៛)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ភាសាលំនាំដើម</Label>
                                    <Select defaultValue="kh">
                                        <SelectTrigger className="h-12 bg-white border-slate-100 rounded-xl text-slate-900">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100">
                                            <SelectItem value="kh">ភាសាខ្មែរ (KH)</SelectItem>
                                            <SelectItem value="en">English (EN)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="space-y-1">
                                    <Label className="text-sm font-bold text-slate-900 font-kantumruy">ចុះឈ្មោះសាកល្បង</Label>
                                    <p className="text-xs text-slate-500 font-kantumruy">អនុញ្ញាតឱ្យបង្កើតមង្គលការសាកល្បង។</p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
