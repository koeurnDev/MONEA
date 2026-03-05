
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
                    <Input
                        value={wedding.groomName}
                        onChange={(e) => updateWedding("groomName", e.target.value)}
                        className="mb-3"
                    />
                </div>
                <div>
                    <Label className="mb-2 block text-xs">កូនស្រី (Bride)</Label>
                    <Input
                        value={wedding.brideName}
                        onChange={(e) => updateWedding("brideName", e.target.value)}
                        className="mb-3"
                    />
                </div>
            </div>
            <div>
                <Label className="flex items-center gap-2 mb-3"><ImageIcon className="w-4 h-4" /> រូបថតធំ (Hero Photo)</Label>
                <ImageUpload
                    value={wedding.themeSettings?.heroImage || ""}
                    onChange={(url) => updateTheme('heroImage', url)}
                    onRemove={() => updateTheme('heroImage', '')}
                />
                <p className="text-xs text-muted-foreground mt-2">ណែនាំ: រូបភាពការ៉េ ឬបញ្ឈរ។</p>
            </div>
            <div className="border-t pt-6 space-y-4">
                <Label className="flex items-center gap-2 mb-1"><Heart size={16} className="text-pink-500" /> ពាក្យសន្យា (Vows)</Label>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">សុភាសិតស្នេហា (Main Quote)</Label>
                    <textarea
                        className="w-full p-3 text-sm border border-border rounded-lg bg-muted/50 text-foreground min-h-[60px] focus:ring-1 focus:ring-pink-500 outline-none"
                        value={wedding.themeSettings?.mainQuote || ""}
                        onChange={(e) => updateTheme('mainQuote', e.target.value)}
                        placeholder="បញ្ចូលសុភាសិតស្នេហា..."
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">ពាក្យសន្យាកូនប្រុស (Groom&apos;s Vow)</Label>
                    <textarea
                        className="w-full p-3 text-sm border border-border rounded-lg bg-muted/50 text-foreground min-h-[80px] focus:ring-1 focus:ring-pink-500 outline-none"
                        value={wedding.themeSettings?.groomVow || ""}
                        onChange={(e) => updateTheme('groomVow', e.target.value)}
                    />
                </div>
                <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">ពាក្យសន្យាកូនស្រី (Bride&apos;s Vow)</Label>
                    <textarea
                        className="w-full p-3 text-sm border border-border rounded-lg bg-muted/50 text-foreground min-h-[80px] focus:ring-1 focus:ring-pink-500 outline-none"
                        value={wedding.themeSettings?.brideVow || ""}
                        onChange={(e) => updateTheme('brideVow', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step2Info);
