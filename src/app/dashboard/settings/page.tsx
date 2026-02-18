"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ImageUploadWidget from "@/components/ui/image-upload-widget";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import { CldUploadWidget } from 'next-cloudinary';
import { User, Sparkles, Image as ImageIcon, MapPin, Music, Video, Wallet, UserPlus, Facebook, Send, Plus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [generalData, setGeneralData] = useState<any>({});

    useEffect(() => {
        fetchWeddingData();
    }, []);

    const fetchWeddingData = async () => {
        const res = await fetch("/api/wedding");
        if (res.ok) {
            setGeneralData(await res.json());
        }
    };

    const updateThemeSetting = (key: string, value: any) => {
        setGeneralData((prev: any) => {
            const currentSettings = prev.themeSettings || {};
            // Support functional updates for race-condition free updates (e.g. multiple uploads)
            const resolvedValue = typeof value === 'function' ? value(currentSettings[key]) : value;

            return {
                ...prev,
                themeSettings: {
                    ...currentSettings,
                    [key]: resolvedValue
                }
            };
        });
    };

    const updateParent = (key: string, value: string) => {
        setGeneralData((prev: any) => ({
            ...prev,
            themeSettings: {
                ...prev.themeSettings,
                parents: {
                    ...prev.themeSettings?.parents,
                    [key]: value
                }
            }
        }));
    };

    const saveGeneralSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/wedding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(generalData)
            });
            if (res.ok) {
                alert("រក្សាទុកដោយជោគជ័យ!");
            } else {
                alert("បរាជ័យក្នុងការរក្សាទុក");
            }
        } catch (e) {
            console.error(e);
            alert("មានបញ្ហាបច្ចេកទេស");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pb-20 relative">
            {/* Artistic Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-20 -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10" />

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>ការកំណត់ប្រព័ន្ធ</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold font-kantumruy text-gray-900"
                    >
                        ការកំណត់
                    </motion.h1>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-red-500 via-pink-500 to-blue-500" />
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl font-kantumruy">ព័ត៌មានទូទៅ</CardTitle>
                            <CardDescription className="text-base font-kantumruy">កែសម្រួលព័ត៌មានសំខាន់ៗនៃពិធីមង្គលការរបស់អ្នក។</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-10">

                            {/* 1. Main Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg font-kantumruy">ព័ត៌មានទូទៅ</h3>
                                </div>

                                {/* Event Type Selector */}
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h4 className="font-bold text-orange-800 font-kantumruy">ប្រភេទកម្មវិធី (Event Type)</h4>
                                        <p className="text-xs text-orange-600/80 font-kantumruy">ជ្រើសរើសប្រភេទកម្មវិធីដើម្បីផ្លាស់ប្តូរពាក្យពេចន៍ដោយស្វ័យប្រវត្តិ។</p>
                                    </div>
                                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-orange-100">
                                        <button
                                            onClick={() => {
                                                setGeneralData({ ...generalData, eventType: 'wedding' });
                                                // Optional: Reset labels to default if needed, or leave as is
                                            }}
                                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${(!generalData.eventType || generalData.eventType === 'wedding')
                                                ? 'bg-orange-100 text-orange-700 shadow-sm'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            អាពាហ៍ពិពាហ៍ (Wedding)
                                        </button>
                                        <button
                                            onClick={() => {
                                                setGeneralData({
                                                    ...generalData,
                                                    eventType: 'anniversary',
                                                    // Auto-update welcome message for Anniversary
                                                    themeSettings: {
                                                        ...generalData.themeSettings,
                                                        welcomeMessage: "ANNIVERSARY CELEBRATION",
                                                        labels: {
                                                            ...generalData.themeSettings?.labels,
                                                            invite_title: "ពិធីខួបអាពាហ៍ពិពាហ៍",
                                                            gallery_title: "រូបភាពអនុស្សាវរីយ៍",
                                                            story_title: "ដំណើរជីវិតរបស់យើង",
                                                        }
                                                    }
                                                });
                                            }}
                                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${(generalData.eventType === 'anniversary')
                                                ? 'bg-orange-100 text-orange-700 shadow-sm'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            ខួបអាពាហ៍ពិពាហ៍ (Anniversary)
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600 ml-1">
                                            {generalData.eventType === 'anniversary' ? 'ស្វាមី (Husband)' : 'កូនប្រុស (Groom)'}
                                        </label>
                                        <Input
                                            className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-kantumruy"
                                            value={generalData.groomName || ""}
                                            onChange={(e) => setGeneralData({ ...generalData, groomName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600 ml-1">
                                            {generalData.eventType === 'anniversary' ? 'ភរិយា (Wife)' : 'កូនស្រី (Bride)'}
                                        </label>
                                        <Input
                                            className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all font-kantumruy"
                                            value={generalData.brideName || ""}
                                            onChange={(e) => setGeneralData({ ...generalData, brideName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600 ml-1">កាលបរិច្ឆេទ</label>
                                        <Input
                                            type="date"
                                            className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-kantumruy"
                                            value={
                                                generalData.date && !isNaN(new Date(generalData.date).getTime())
                                                    ? new Date(generalData.date).toISOString().split('T')[0]
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                const newDate = e.target.value ? new Date(e.target.value) : null;
                                                setGeneralData({ ...generalData, date: newDate });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600 ml-1">ទីតាំង</label>
                                        <Input
                                            placeholder="ឧ. សណ្ឋាគារ រ៉េស៊ីដង់ សុខា"
                                            className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-kantumruy"
                                            value={generalData.location || ''}
                                            onChange={(e) => setGeneralData({ ...generalData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Appearance Section */}
                            <div className="space-y-8 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-sm shadow-red-100">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">ការតុបតែង</h3>
                                        <p className="text-slate-500 font-medium font-kantumruy text-sm">Appearance (Welcome Message & Color)</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ពាក្យស្វាគមន៍ (Welcome Message)</label>
                                        <Input
                                            placeholder="ឧ. សិរីមង្គលអាពាហ៍ពិពាហ៍ (Default: SAVE THE DATE)"
                                            className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-bold text-slate-900"
                                            value={generalData.themeSettings?.welcomeMessage || ''}
                                            onChange={(e) => updateThemeSetting('welcomeMessage', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ពណ៌ Theme (Primary Color)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                                                <input
                                                    type="color"
                                                    className="absolute inset-0 w-[200%] h-[200%] cursor-pointer -translate-x-1/4 -translate-y-1/4"
                                                    value={generalData.themeSettings?.primaryColor || '#D4AF37'}
                                                    onChange={(e) => updateThemeSetting('primaryColor', e.target.value)}
                                                />
                                            </div>
                                            <Input
                                                placeholder="#D4AF37"
                                                className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-mono uppercase font-bold"
                                                value={generalData.themeSettings?.primaryColor || ''}
                                                onChange={(e) => updateThemeSetting('primaryColor', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* Typography & Labels Section */}
                            <div className="space-y-8 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-sm shadow-red-100">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">អក្សរ និង ចំណងជើង</h3>
                                        <p className="text-slate-500 font-medium font-kantumruy text-sm">Typography & Labels</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ម៉ូតអក្សរ (Font Style)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { value: 'modern', label: 'ទំនើប (Kantumruy)', font: 'font-kantumruy' },
                                            { value: 'elegant', label: 'ទន់ភ្លន់ (Suwannaphum)', font: 'font-suwannaphum' },
                                            { value: 'traditional', label: 'បុរាណ (Moul)', font: 'font-moul' }
                                        ].map((font) => (
                                            <div
                                                key={font.value}
                                                onClick={() => updateThemeSetting('fontStyle', font.value)}
                                                className={`cursor-pointer rounded-3xl border-2 p-6 text-center transition-all group ${(generalData.themeSettings?.fontStyle || 'modern') === font.value
                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200'
                                                    : 'border-slate-100 hover:border-red-200 bg-slate-50/50 hover:bg-white'
                                                    }`}
                                            >
                                                <p className={`text-2xl ${font.font}`}>កូនកំលោះ & កូនក្រមុំ</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest mt-4 ${(generalData.themeSettings?.fontStyle || 'modern') === font.value ? 'text-white/60' : 'text-slate-400'}`}>{font.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                                    {[
                                        { key: 'galleryTitle', label: 'ចំណងជើង Gallery', placeholder: 'Default: រូបភាពអនុស្សាវរីយ៍' },
                                        { key: 'storyTitle', label: 'ចំណងជើង Love Story', placeholder: 'Default: ដំណើររឿងរបស់យើង' },
                                        { key: 'timelineTitle', label: 'ចំណងជើង Timeline', placeholder: 'Default: កម្មវិធី' },
                                        { key: 'guestbookTitle', label: 'ចំណងជើង Guestbook', placeholder: 'Default: សៀវភៅភ្ញៀវ & ជូនពរ' }
                                    ].map((field) => (
                                        <div key={field.key} className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{field.label}</label>
                                            <Input
                                                placeholder={field.placeholder}
                                                className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-bold text-slate-900"
                                                value={generalData.themeSettings?.labels?.[field.key] || ''}
                                                onChange={(e) => {
                                                    const currentLabels = generalData.themeSettings?.labels || {};
                                                    updateThemeSetting('labels', { ...currentLabels, [field.key]: e.target.value });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Parents Section */}
                            {generalData.eventType !== 'anniversary' && (
                                <div className="space-y-8 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-sm shadow-red-100">
                                            <UserPlus className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">ទិន្នន័យមាតាបិតា</h3>
                                            <p className="text-slate-500 font-medium font-kantumruy text-sm">Parents Information</p>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        {/* Groom Parents */}
                                        <div className="space-y-6 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/30 rounded-bl-[2.5rem]" />
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">តំណាងខាងកូនប្រុស</p>
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder="ឈ្មោះឪពុក"
                                                    className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 font-bold"
                                                    value={generalData.themeSettings?.parents?.groomFather || ''}
                                                    onChange={(e) => updateParent('groomFather', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="ឈ្មោះម្តាយ"
                                                    className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 font-bold"
                                                    value={generalData.themeSettings?.parents?.groomMother || ''}
                                                    onChange={(e) => updateParent('groomMother', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {/* Bride Parents */}
                                        <div className="space-y-6 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-red-100/30 rounded-bl-[2.5rem]" />
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-4">តំណាងខាងកូនស្រី</p>
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder="ឈ្មោះឪពុក"
                                                    className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 font-bold"
                                                    value={generalData.themeSettings?.parents?.brideFather || ''}
                                                    onChange={(e) => updateParent('brideFather', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="ឈ្មោះម្តាយ"
                                                    className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 font-bold"
                                                    value={generalData.themeSettings?.parents?.brideMother || ''}
                                                    onChange={(e) => updateParent('brideMother', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Hero / Background Image */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg font-kantumruy">រូបភាពដើម (Hero/Background Image)</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xs text-gray-500 font-kantumruy">រូបភាពនេះនឹងបង្ហាញជាផ្ទៃខាងក្រោយធំដំបូងគេ។ (Recommended: Portrait or High Quality)</p>
                                    <div className="max-w-xs">
                                        <ImageUploadWidget
                                            value={generalData.themeSettings?.heroImage || ''}
                                            onChange={(url) => updateThemeSetting('heroImage', url)}
                                            onRemove={async () => {
                                                const url = generalData.themeSettings?.heroImage;
                                                updateThemeSetting('heroImage', '');

                                                if (url) {
                                                    try {
                                                        const regex = /\/v\d+\/(.+)\.\w+$/;
                                                        const match = url.match(regex);
                                                        if (match && match[1]) {
                                                            const public_id = match[1];
                                                            await fetch('/api/cloudinary/delete', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ public_id })
                                                            });
                                                        }
                                                    } catch (error) {
                                                        console.error("Failed to delete hero image:", error);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Share Image Section */}
                            <div className="space-y-8 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-sm shadow-red-100">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">រូបភាពចែករំលែក</h3>
                                        <p className="text-slate-500 font-medium font-kantumruy text-sm">Social Share Image (Facebook/Telegram)</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-500 font-medium font-kantumruy leading-relaxed">រូបភាពនេះនឹងបង្ហាញនៅពេលអ្នក Share Link ទៅកាន់បណ្តាញសង្គម។ (Recommended: 1200x630)</p>
                                    <div className="max-w-xs p-4 bg-slate-50 rounded-3xl border border-dotted border-slate-200">
                                        <ImageUploadWidget
                                            value={generalData.themeSettings?.shareImage || ''}
                                            onChange={(url) => updateThemeSetting('shareImage', url)}
                                            onRemove={async () => {
                                                const url = generalData.themeSettings?.shareImage;
                                                updateThemeSetting('shareImage', '');
                                                if (url) {
                                                    try {
                                                        const regex = /\/v\d+\/(.+)\.\w+$/;
                                                        const match = url.match(regex);
                                                        if (match && match[1]) {
                                                            const public_id = match[1];
                                                            await fetch('/api/cloudinary/delete', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ public_id })
                                                            });
                                                        }
                                                    } catch (error) {
                                                        console.error("Failed to delete share image:", error);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Media & Social Section */}
                            <div className="space-y-8 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-sm shadow-red-100">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">មេឌៀ และ បណ្តាញសង្គម</h3>
                                        <p className="text-slate-500 font-medium font-kantumruy text-sm">Media & Social Links</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                                    {[
                                        { key: 'mapLink', label: 'Google Maps Link', icon: MapPin, placeholder: 'https://maps.google.com/...' },
                                        { key: 'videoUrl', label: 'Pre-Wedding Video (YouTube)', icon: Video, placeholder: 'https://youtube.com/watch?v=...' },
                                        { key: 'facebookUrl', label: 'Facebook Page', icon: Facebook, placeholder: 'https://facebook.com/...' },
                                        { key: 'telegramUrl', label: 'Telegram Username/Link', icon: Send, placeholder: '@username or https://t.me/...' }
                                    ].map((social) => (
                                        <div key={social.key} className="space-y-3">
                                            <div className="flex items-center gap-2 ml-2">
                                                <social.icon size={12} className="text-red-500" />
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{social.label}</label>
                                            </div>
                                            <Input
                                                placeholder={social.placeholder}
                                                className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 font-bold"
                                                value={generalData.themeSettings?.[social.key] || ''}
                                                onChange={(e) => updateThemeSetting(social.key, e.target.value)}
                                            />
                                        </div>
                                    ))}

                                    <div className="col-span-full pt-6 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2 ml-2">
                                                <Wallet size={12} className="text-red-500" />
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">គណនីធនាគារ (Bank Accounts)</label>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const currentBanks = generalData.themeSettings?.bankAccounts || [];
                                                    updateThemeSetting('bankAccounts', [
                                                        ...currentBanks,
                                                        { bankName: 'ABA', accountName: '', accountNumber: '', qrUrl: '' }
                                                    ]);
                                                }}
                                                className="h-10 px-4 rounded-xl border-slate-200 text-xs font-bold font-kantumruy hover:bg-slate-50"
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> បន្ថែមគណនី
                                            </Button>
                                        </div>

                                        <div className="grid gap-6">
                                            {(generalData.themeSettings?.bankAccounts || []).map((bank: any, idx: number) => (
                                                <div key={idx} className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50">
                                                    <button
                                                        onClick={() => {
                                                            const newBanks = [...(generalData.themeSettings?.bankAccounts || [])];
                                                            newBanks.splice(idx, 1);
                                                            updateThemeSetting('bankAccounts', newBanks);
                                                        }}
                                                        className="absolute top-4 right-4 p-2 bg-white text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110"
                                                    >
                                                        <X size={16} />
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ឈ្មោះធនាគារ</label>
                                                            <select
                                                                className="w-full h-14 rounded-2xl border-slate-200 bg-white text-sm font-bold focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all px-4"
                                                                value={bank.bankName}
                                                                onChange={(e) => {
                                                                    const newBanks = [...(generalData.themeSettings?.bankAccounts || [])];
                                                                    newBanks[idx].bankName = e.target.value;
                                                                    updateThemeSetting('bankAccounts', newBanks);
                                                                }}
                                                            >
                                                                <option value="ABA">ABA Bank</option>
                                                                <option value="ACLEDA">ACLEDA Bank</option>
                                                                <option value="WING">Wing Bank</option>
                                                                <option value="BKONG">Bakong</option>
                                                                <option value="OTHER">Other</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">ឈ្មោះគណនី</label>
                                                            <Input
                                                                className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 font-bold"
                                                                placeholder="Account Name"
                                                                value={bank.accountName}
                                                                onChange={(e) => {
                                                                    const newBanks = [...(generalData.themeSettings?.bankAccounts || [])];
                                                                    newBanks[idx].accountName = e.target.value;
                                                                    updateThemeSetting('bankAccounts', newBanks);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">លេខគណនី</label>
                                                            <Input
                                                                className="h-14 rounded-2xl bg-white border-slate-200 focus:border-red-500 font-bold"
                                                                placeholder="Account Number"
                                                                value={bank.accountNumber}
                                                                onChange={(e) => {
                                                                    const newBanks = [...(generalData.themeSettings?.bankAccounts || [])];
                                                                    newBanks[idx].accountNumber = e.target.value;
                                                                    updateThemeSetting('bankAccounts', newBanks);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">QR Code (Optional)</label>
                                                        <div className="max-w-[120px]">
                                                            <ImageUploadWidget
                                                                value={bank.qrUrl || ''}
                                                                onChange={(url) => {
                                                                    const newBanks = [...(generalData.themeSettings?.bankAccounts || [])];
                                                                    newBanks[idx].qrUrl = url;
                                                                    updateThemeSetting('bankAccounts', newBanks);
                                                                }}
                                                                onRemove={() => {
                                                                    const newBanks = [...(generalData.themeSettings?.bankAccounts || [])];
                                                                    newBanks[idx].qrUrl = '';
                                                                    updateThemeSetting('bankAccounts', newBanks);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {(generalData.themeSettings?.bankAccounts || []).length === 0 && (
                                                <div className="text-center p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                                                    <p className="text-slate-400 text-sm font-medium font-kantumruy">មិនទាន់មានគណនីនៅឡើយ។ សូមចុច "បន្ថែមគណនី"។</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-full space-y-4">
                                        <div className="flex items-center gap-2 ml-2">
                                            <Music size={12} className="text-red-500" />
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ភ្លេងផ្ទៃខាងក្រោយ (MP3 URL)</label>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100/50">
                                            <AudioUploadWidget
                                                value={generalData.themeSettings?.musicUrl || ''}
                                                onChange={(url) => updateThemeSetting('musicUrl', url)}
                                                onRemove={async () => {
                                                    const url = generalData.themeSettings?.musicUrl;
                                                    updateThemeSetting('musicUrl', '');
                                                    if (url) {
                                                        try {
                                                            const regex = /\/v\d+\/(.+)\.\w+$/;
                                                            const match = url.match(regex);
                                                            if (match && match[1]) {
                                                                const public_id = match[1];
                                                                await fetch('/api/cloudinary/delete', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ public_id, resource_type: 'video' })
                                                                });
                                                            }
                                                        } catch (error) {
                                                            console.error("Failed to delete audio file:", error);
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Pre-wedding Gallery */}
                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 pb-3">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg font-kantumruy">រូបភាព Pre-Wedding (Gallery)</h3>
                                </div>

                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {(generalData.galleryItems || []).map((item: any, idx: number) => {
                                        if (!item.url) return null;
                                        return (
                                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                                                <img src={item.url} alt="Gallery" className="object-cover w-full h-full" />
                                                <button
                                                    onClick={async () => {
                                                        const url = item.url;
                                                        // Optimistic UI update
                                                        const newItems = generalData.galleryItems.filter((_: any, i: number) => i !== idx);
                                                        setGeneralData({ ...generalData, galleryItems: newItems });

                                                        // Extract public_id and delete from Cloudinary
                                                        try {
                                                            const regex = /\/v\d+\/(.+)\.\w+$/;
                                                            const match = url.match(regex);
                                                            if (match && match[1]) {
                                                                const public_id = match[1];
                                                                await fetch('/api/cloudinary/delete', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ public_id })
                                                                });
                                                            }
                                                        } catch (error) {
                                                            console.error("Failed to delete image from Cloudinary:", error);
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    <CldUploadWidget
                                        onSuccess={(result: any) => {
                                            const newUrl = result.info.secure_url;
                                            setGeneralData((prev: any) => ({
                                                ...prev,
                                                galleryItems: [
                                                    ...(prev.galleryItems || []),
                                                    { url: newUrl, type: 'IMAGE' }
                                                ]
                                            }));
                                        }}
                                        signatureEndpoint="/api/cloudinary/sign"
                                        uploadPreset="wedding_upload"
                                        options={{ multiple: true, maxFiles: 20, sources: ['local'] }}
                                    >
                                        {({ open }) => (
                                            <button
                                                onClick={() => open()}
                                                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all group"
                                            >
                                                <div className="p-2 bg-gray-100 rounded-full group-hover:bg-purple-100 transition-colors">
                                                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-purple-600 font-kantumruy">បញ្ចូលរូបភាព</span>
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                </div>
                            </div>


                            {/* 5. Story Images (Love Story) */}
                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 pb-3">
                                    <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg font-kantumruy">រូបភាព Love Story (Story Images)</h3>
                                </div>

                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {(generalData.themeSettings?.storyImages || []).map((url: string, idx: number) => {
                                        if (!url) return null;
                                        return (
                                            <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden group border border-gray-200">
                                                <img src={url} alt="Story" className="object-cover w-full h-full" />
                                                <button
                                                    onClick={async () => {
                                                        const current = generalData.themeSettings?.storyImages || [];
                                                        // Optimistic UI update
                                                        const newItems = current.filter((_: string, i: number) => i !== idx);
                                                        updateThemeSetting('storyImages', newItems);

                                                        // Delete from Cloudinary
                                                        try {
                                                            const regex = /\/v\d+\/(.+)\.\w+$/;
                                                            const match = url.match(regex);
                                                            if (match && match[1]) {
                                                                const public_id = match[1];
                                                                await fetch('/api/cloudinary/delete', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ public_id })
                                                                });
                                                            }
                                                        } catch (error) {
                                                            console.error("Failed to delete story image:", error);
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    <CldUploadWidget
                                        onSuccess={(result: any) => {
                                            const newUrl = result.info.secure_url;
                                            updateThemeSetting('storyImages', (current: string[] = []) => [...(current || []), newUrl]);
                                        }}
                                        signatureEndpoint="/api/cloudinary/sign"
                                        uploadPreset="wedding_upload"
                                        options={{ multiple: true, maxFiles: 10, sources: ['local'] }}
                                    >
                                        {({ open }) => (
                                            <button
                                                onClick={() => open()}
                                                className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-pink-50 hover:border-pink-300 transition-all group"
                                            >
                                                <div className="p-2 bg-gray-100 rounded-full group-hover:bg-pink-100 transition-colors">
                                                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-pink-600" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-pink-600 font-kantumruy">បញ្ចូលរូបភាព</span>
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button
                                    onClick={saveGeneralSettings}
                                    disabled={loading}
                                    className="w-full md:w-auto h-12 px-8 bg-gray-950 hover:bg-black rounded-2xl shadow-lg shadow-gray-200 transition-all font-bold font-kantumruy"
                                >
                                    {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុកការផ្លាស់ប្តូរ"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card >
                </div >
                <div className="fixed bottom-10 right-10 z-50 flex items-center gap-4">
                    <Button
                        onClick={saveGeneralSettings}
                        disabled={loading}
                        className="h-16 px-10 rounded-[2rem] bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group font-black"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-red-500 group-hover:rotate-12 transition-transform" />}
                        រក្សាទុកការប្រែប្រួល
                    </Button>
                </div>
            </div>
        </div>
    );
}
