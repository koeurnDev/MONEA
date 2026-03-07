
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
}

const Step2Info: React.FC<Step2InfoProps> = ({ wedding, updateWedding, updateTheme }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="mb-2 block text-xs">កូនប្រុស (Groom)</Label>
                    <DebouncedInput
                        value={wedding.groomName}
                        onDebouncedChange={(val) => updateWedding("groomName", val)}
                        className="mb-3"
                    />
                </div>
                <div>
                    <Label className="mb-2 block text-xs">កូនស្រី (Bride)</Label>
                    <DebouncedInput
                        value={wedding.brideName}
                        onDebouncedChange={(val) => updateWedding("brideName", val)}
                        className="mb-3"
                    />
                </div>
            </div>
            <div>
                <Label className="flex items-center gap-2 mb-3"><ImageIcon className="w-4 h-4" /> រូបថតធំ (Hero Photo)</Label>
                <ImageUpload
                    value={wedding.themeSettings?.heroImage || ""}
                    onChange={(url: string) => updateTheme('heroImage', url)}
                    onRemove={() => updateTheme('heroImage', '')}
                />
                <p className="text-xs text-muted-foreground mt-2">ណែនាំ: រូបភាពការ៉េ ឬបញ្ឈរ។</p>
            </div>
            <div className="border-t pt-6 space-y-4">
                <Label className="flex items-center gap-2 mb-1"><Heart size={16} className="text-pink-500" /> ពាក្យសន្យា (Vows)</Label>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">សុភាសិតស្នេហា (Main Quote)</Label>
                    <DebouncedTextarea
                        className="min-h-[60px] focus:ring-pink-500"
                        value={wedding.themeSettings?.mainQuote || ""}
                        onDebouncedChange={(val) => updateTheme('mainQuote', val)}
                        placeholder="បញ្ចូលសុភាសិតស្នេហា..."
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">ពាក្យសន្យាកូនប្រុស (Groom&apos;s Vow)</Label>
                    <DebouncedTextarea
                        className="min-h-[80px] focus:ring-pink-500"
                        value={wedding.themeSettings?.groomVow || ""}
                        onDebouncedChange={(val) => updateTheme('groomVow', val)}
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">ពាក្យសន្យាកូនស្រី (Bride&apos;s Vow)</Label>
                    <DebouncedTextarea
                        className="min-h-[80px] focus:ring-pink-500"
                        value={wedding.themeSettings?.brideVow || ""}
                        onDebouncedChange={(val) => updateTheme('brideVow', val)}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step2Info);
