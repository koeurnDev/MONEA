
import React from 'react';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import ImageUpload from "@/components/ui/image-upload-widget";
import { ImageIcon, Heart } from "lucide-react";
import type { WeddingData } from '@/components/templates/types';

interface Step2InfoProps {
    wedding: WeddingData;
    updateWedding: (key: keyof WeddingData, value: any) => void;
    updateTheme: (key: string, value: any) => void;
    updateParent: (key: string, value: string) => void;
    updateLabel: (key: string, value: string) => void;
    addGalleryItem: (url: string, publicId?: string, index?: number) => void;
    removeGalleryItem: (index: number) => void;
}

const Step2Info: React.FC<Step2InfoProps> = ({ 
    wedding, 
    updateWedding, 
    updateTheme,
    updateParent,
    updateLabel,
    addGalleryItem,
    removeGalleryItem
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div>
                        <Label className="mb-2 block text-[10px] font-bold uppercase text-muted-foreground">
                            ឈ្មោះកូនប្រុស <span className="text-red-500 font-bold">*</span>
                        </Label>
                        <DebouncedInput
                            value={wedding.groomName}
                            onDebouncedChange={(val) => updateWedding("groomName", val)}
                            className="h-11 rounded-xl"
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block text-[10px] font-bold uppercase text-muted-foreground flex items-center justify-between gap-1.5 px-1">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-red-600" />
                                រូបថតកូនប្រុស
                            </span>
                            <span className="text-[8px] opacity-60 font-normal">3:4 (1080x1440)</span>
                        </Label>
                        <div className="transition-all duration-300">
                            <ImageUpload
                                value={wedding?.galleryItems?.[9]?.url}
                                onChange={(url, publicId) => addGalleryItem(url, publicId, 9)}
                                onRemove={() => removeGalleryItem(9)}
                                label="រូបថតកូនប្រុស"
                                folder={wedding.id}
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <Label className="mb-2 block text-[10px] font-bold uppercase text-muted-foreground">
                            ឈ្មោះកូនស្រី <span className="text-red-500 font-bold">*</span>
                        </Label>
                        <DebouncedInput
                            value={wedding.brideName}
                            onDebouncedChange={(val) => updateWedding("brideName", val)}
                            className="h-11 rounded-xl"
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block text-[10px] font-bold uppercase text-muted-foreground flex items-center justify-between gap-1.5 px-1">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-red-600" />
                                រូបថតកូនស្រី
                            </span>
                            <span className="text-[8px] opacity-60 font-normal">3:4 (1080x1440)</span>
                        </Label>
                        <div className="transition-all duration-300">
                            <ImageUpload
                                value={wedding?.galleryItems?.[10]?.url}
                                onChange={(url, publicId) => addGalleryItem(url, publicId, 10)}
                                onRemove={() => removeGalleryItem(10)}
                                label="រូបថតកូនស្រី"
                                folder={wedding.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Label className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase text-muted-foreground tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-600" />
                        <ImageIcon className="w-3.5 h-3.5" /> រូបថតមុខ (រូបធំ)
                    </span>
                    <span className="text-[8px] opacity-60 font-normal">3:4 (1080x1440)</span>
                </Label>
                <div className="transition-all duration-300">
                    <ImageUpload
                        value={wedding.themeSettings?.heroImage || ""}
                        onChange={(url: string, publicId?: string) => addGalleryItem(url, publicId, 0)}
                        onRemove={() => removeGalleryItem(0)}
                        folder={wedding.id}
                    />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 px-1">ណែនាំ: រូបភាពបញ្ឈរ (3:4)។ រូបនេះនឹងបង្ហាញនៅផ្នែកខាងលើជាន់គេ (Hero)។</p>
            </div>
            <div className="border-t pt-6 space-y-4">
                <Label className="flex items-center gap-2 mb-1"><Heart size={16} className="text-pink-500" /> ពាក្យសន្យា និងសុភាសិត</Label>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">សុភាសិតស្នេហា</Label>
                    <DebouncedTextarea
                        className="min-h-[60px] focus:ring-pink-500"
                        value={wedding.themeSettings?.mainQuote || ""}
                        onDebouncedChange={(val) => updateTheme('mainQuote', val)}
                        placeholder="បញ្ចូលសុភាសិតស្នេហា..."
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">ពាក្យសន្យារបស់កូនប្រុស</Label>
                    <DebouncedTextarea
                        className="min-h-[80px] focus:ring-pink-500"
                        value={wedding.themeSettings?.groomVow || ""}
                        onDebouncedChange={(val) => updateTheme('groomVow', val)}
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">ពាក្យសន្យារបស់កូនស្រី</Label>
                    <DebouncedTextarea
                        className="min-h-[80px] focus:ring-pink-500"
                        value={wedding.themeSettings?.brideVow || ""}
                        onDebouncedChange={(val) => updateTheme('brideVow', val)}
                    />
                </div>
                <div className="pt-4 border-t border-dashed">
                    <Label className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">អត្ថបទអញ្ជើញផ្លូវការ (Formal Invitation)</span>
                    </Label>
                    <DebouncedTextarea
                        className="min-h-[100px] focus:ring-pink-500 bg-amber-50/10 border-amber-500/20"
                        value={wedding.themeSettings?.invitationText || ""}
                        onDebouncedChange={(val) => updateTheme('invitationText', val)}
                        placeholder="ឧទាហរណ៍៖ ដែលនឹងប្រព្រឹត្តទៅនៅថ្ងៃអង្គារ ទី៣១ ខែមីនា ឆ្នាំ២០២៦ វេលាម៉ោង ០៥:០០នាទីល្ងាច..."
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                        * បើទុកចោលទំនេរ ប្រព័ន្ធនឹងបង្កើតអត្ថបទតាមកាលបរិច្ឆេទក្នុងប្រព័ន្ធដោយស្វ័យប្រវត្តិ។
                    </p>
                </div>

                <div className="pt-6 border-t font-khmer space-y-4">
                    <Label className="flex items-center gap-2 mb-1"><Heart size={16} className="text-red-500" /> ព័ត៌មានមាតាបិតា</Label>
                    <div className="grid grid-cols-1 gap-6 pt-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                <h4 className="text-[11px] font-bold text-foreground uppercase">ខាងកូនប្រុស</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <DebouncedInput placeholder="ឈ្មោះឪពុក" className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.parents?.groomFather || ""} onDebouncedChange={(val) => updateParent('groomFather', val as string)} />
                                <DebouncedInput placeholder="ឈ្មោះម្តាយ" className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.parents?.groomMother || ""} onDebouncedChange={(val) => updateParent('groomMother', val as string)} />
                            </div>
                            <DebouncedInput placeholder="លេខទូរស័ព្ទ (សម្រាប់ភ្ញៀវទាក់ទង)" className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.parents?.groomPhone || ""} onDebouncedChange={(val) => updateParent('groomPhone', val as string)} />
                        </div>
                        <div className="space-y-4 pt-2 shadow-inner bg-muted/20 p-4 rounded-xl border border-dashed">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                <h4 className="text-[11px] font-bold text-foreground uppercase">ខាងកូនស្រី</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <DebouncedInput placeholder="ឈ្មោះឪពុក" className="h-11 rounded-xl bg-background border-none shadow-sm" value={wedding.themeSettings?.parents?.brideFather || ""} onDebouncedChange={(val) => updateParent('brideFather', val as string)} />
                                <DebouncedInput placeholder="ឈ្មោះម្តាយ" className="h-11 rounded-xl bg-background border-none shadow-sm" value={wedding.themeSettings?.parents?.brideMother || ""} onDebouncedChange={(val) => updateParent('brideMother', val as string)} />
                            </div>
                            <DebouncedInput placeholder="លេខទូរស័ព្ទ (សម្រាប់ភ្ញៀវទាក់ទង)" className="h-11 rounded-xl bg-background border-none shadow-sm" value={wedding.themeSettings?.parents?.bridePhone || ""} onDebouncedChange={(val) => updateParent('bridePhone', val as string)} />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t font-khmer space-y-4">
                    <Label className="flex items-center gap-2 mb-1">អត្ថបទចំណងជើងផ្សេងៗ</Label>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Editorial Segment Text</Label>
                            <DebouncedInput 
                                className="h-11 rounded-xl bg-muted border-none shadow-sm" 
                                value={wedding.themeSettings?.customLabels?.editorial_1 || ""} 
                                onDebouncedChange={(val) => updateLabel('editorial_1', val as string)}
                                placeholder="ឧ. MOMENTS MATTER"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Signature Moments Title</Label>
                            <DebouncedInput 
                                className="h-11 rounded-xl bg-muted border-none shadow-sm" 
                                value={wedding.themeSettings?.customLabels?.moments_title || ""} 
                                onDebouncedChange={(val) => updateLabel('moments_title', val as string)}
                                placeholder="ឧ. អនុស្សាវរីយ៍ចងចាំ"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">សប្បុរសធម៌ Title (Gift Section)</Label>
                            <DebouncedInput 
                                className="h-11 rounded-xl bg-muted border-none shadow-sm" 
                                value={wedding.themeSettings?.customLabels?.generosity_title || "Generosity"} 
                                onDebouncedChange={(val) => updateLabel('generosity_title', val as string)}
                                placeholder="ឧ. Generosity"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step2Info);
