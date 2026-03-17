"use client";
import * as React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { MapPin, Clock, Trash2, Plus, ExternalLink } from "lucide-react";
import type { WeddingData } from '@/components/templates/types';

import ImageUpload from "@/components/ui/image-upload-widget";

interface Step3TimeProps {
    wedding: WeddingData;
    updateWedding: (key: keyof WeddingData, value: any) => void;
    updateTheme: (key: string, value: any) => void;
    setWedding: React.Dispatch<React.SetStateAction<WeddingData | null>>;
    addGalleryItem: (url: string, publicId?: string, index?: number) => void;
    removeGalleryItem: (index: number) => void;
}

// Helper for Date Handling
const toLocalISO = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const offsetMs = d.getTimezoneOffset() * 60 * 1000;
        const localTime = new Date(d.getTime() - offsetMs);
        return localTime.toISOString().slice(0, 16);
    } catch (e) {
        return "";
    }
};

const Step3Time: React.FC<Step3TimeProps> = ({ wedding, updateWedding, updateTheme, setWedding, addGalleryItem, removeGalleryItem }) => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <Label className="mb-2 block text-xs">
                    កាលបរិច្ឆេទកម្មវិធី <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                    type="datetime-local"
                    value={mounted ? toLocalISO(wedding.date) : ""}
                    onChange={(e) => updateWedding("date", new Date(e.target.value).toISOString())}
                />
            </div>
            <div>
                <Label className="mb-2 block text-xs">កាលបរិច្ឆេទតាមច័ន្ទគតិ (ខ្មែរ)</Label>
                <DebouncedInput
                    placeholder="ឧ. ថ្ងៃព្រហស្បតិ៍ ៥កើត ខែផល្គុន..."
                    value={wedding.themeSettings?.lunarDate || ""}
                    onDebouncedChange={(val) => updateTheme("lunarDate", val)}
                />
            </div>
            <div>
                <Label className="mb-2 block text-xs">ទីកន្លែងប្រារព្ធកម្មវិធី</Label>
                <DebouncedInput
                    value={wedding.location || ""}
                    onDebouncedChange={(val) => updateWedding("location", val)}
                />
            </div>
            <div>
                <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> ទីតាំងលើផែនទី (Google Maps)</Label>
                    <a 
                        href="https://www.google.com/maps" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary flex items-center gap-1 hover:underline font-bold"
                    >
                        <ExternalLink className="w-3 h-3" />
                        របៀបយក Link
                    </a>
                </div>
                <div className="space-y-4">
                    <DebouncedInput
                        placeholder="បញ្ចូលតំណភ្ជាប់ Google Maps..."
                        value={wedding.themeSettings?.mapLink || ""}
                        onDebouncedChange={(val) => updateTheme('mapLink', val as string)}
                    />
                    <p className="text-[9px] text-muted-foreground bg-primary/5 p-2 rounded-lg italic leading-relaxed">
                        * គន្លឹះ៖ លោកអ្នកគ្រាន់តែចូលទៅដោតទីតាំងក្នុង Google Maps រួចចុចប៊ូតុង &quot;Share&quot; និងចម្លងយក &quot;Link&quot; មកដាក់ទីនេះ។
                    </p>
                    <div className="bg-muted/30 p-3 rounded-xl border border-dashed border-muted-foreground/20">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block tracking-widest px-1">បដាផែនទី និង QR កូដ (Map & QR)</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[9px] text-muted-foreground/60 uppercase font-black">រូបភាពបដា (Banner)</Label>
                                <ImageUpload
                                    value={wedding.galleryItems?.[5]?.url || ""}
                                    onChange={(url, publicId) => addGalleryItem(url, publicId, 5)}
                                    onRemove={() => removeGalleryItem(5)}
                                    folder={wedding.id}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[9px] text-muted-foreground/60 uppercase font-black">QR ទីតាំង/ចំណត (Location QR)</Label>
                                <ImageUpload
                                    value={wedding.themeSettings?.locationQrUrl || ""}
                                    onChange={(url, publicId) => {
                                        updateTheme('locationQrUrl', url);
                                        if (publicId) updateTheme('locationQrPublicId', publicId);
                                    }}
                                    onRemove={() => {
                                        updateTheme('locationQrUrl', "");
                                        updateTheme('locationQrPublicId', "");
                                    }}
                                    folder={wedding.id}
                                />
                            </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground/60 mt-3 italic px-1 leading-relaxed">
                            * បងអាចបន្ថែមរូបភាពបដាសម្រាប់ខាងក្រោយផែនទី និង QR Code សម្រាប់ទីតាំង ឬចំណតរថយន្ត។
                        </p>
                    </div>
                </div>
            </div>
            <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                    <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> លំដាប់លំដោយកម្មវិធី (Flexible Schedule)</Label>
                    <p className="text-[10px] text-muted-foreground italic">* បើកប៊ូតុង &quot;H&quot; សម្រាប់ដាក់ជាចំណងជើងធំ (ឧ. កម្មវិធីទី១)</p>
                </div>
                <div className="space-y-4">
                    {wedding.activities?.map((activity: any, idx: number) => {
                        const isHeader = activity.icon === "header";
                        return (
                            <div key={idx} className={`p-4 rounded-xl border ${isHeader ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-transparent'} space-y-3 transition-colors`}>
                                <div className="flex gap-2 items-center">
                                    <Button
                                        variant={isHeader ? "default" : "outline"}
                                        size="sm"
                                        className={`h-8 w-8 p-0 font-black text-[10px] ${isHeader ? 'bg-primary' : 'text-muted-foreground'}`}
                                        onClick={() => {
                                            const newActs = [...(wedding.activities || [])];
                                            newActs[idx] = { ...newActs[idx], icon: isHeader ? null : "header" };
                                            updateWedding("activities", newActs);
                                        }}
                                        title="Toggle Header"
                                    >
                                        H
                                    </Button>
                                    {!isHeader && (
                                        <DebouncedInput
                                            className="w-28 h-8 text-xs font-bold"
                                            value={activity.time}
                                            onDebouncedChange={(val) => {
                                                const newActs = [...(wedding.activities || [])];
                                                newActs[idx] = { ...newActs[idx], time: val as string };
                                                updateWedding("activities", newActs);
                                            }}
                                            placeholder="ម៉ោង"
                                        />
                                    )}
                                    <DebouncedInput
                                        className={`flex-1 h-8 text-xs ${isHeader ? 'font-khmer-moul text-primary uppercase tracking-wider' : 'font-bold'}`}
                                        value={activity.title}
                                        onDebouncedChange={(val) => {
                                            const newActs = [...(wedding.activities || [])];
                                            newActs[idx] = { ...newActs[idx], title: val as string };
                                            updateWedding("activities", newActs);
                                        }}
                                        placeholder={isHeader ? "ចំណងជើងក្រុម (ឧ. កម្មវិធីទី១)" : "ឈ្មោះកម្មវិធី (ឧ. ពិធីកាត់សក់)"}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            const newActs = wedding.activities!.filter((_: any, i: number) => i !== idx);
                                            updateWedding("activities", newActs);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                                {!isHeader && (
                                    <DebouncedTextarea
                                        className="min-h-[40px] text-[11px] py-2 bg-transparent"
                                        value={activity.description || ""}
                                        onDebouncedChange={(val) => {
                                            const newActs = [...(wedding.activities || [])];
                                            newActs[idx] = { ...newActs[idx], description: val as string };
                                            updateWedding("activities", newActs);
                                        }}
                                        placeholder="ការបរិយាយបន្ថែម (ស្រេចចិត្ត)..."
                                    />
                                )}
                            </div>
                        );
                    })}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setWedding((prev: any) => ({
                                ...prev,
                                activities: [...(prev.activities || []), { 
                                    time: "08:00 ព្រឹក", 
                                    title: "ឈ្មោះកម្មវិធី", 
                                    description: "",
                                    icon: null,
                                    order: (prev.activities?.length || 0)
                                }]
                            }));
                        }}
                        className="w-full text-xs dashed border-primary/20 text-primary/60 hover:text-primary hover:bg-primary/5 h-10 rounded-xl"
                    >
                        <Plus size={14} className="mr-1" /> បន្ថែមកម្មវិធីថ្មី
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step3Time);
