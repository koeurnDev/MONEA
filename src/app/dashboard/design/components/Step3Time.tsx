
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { MapPin, Clock, Trash2, Plus } from "lucide-react";
import type { WeddingData } from '@/components/templates/types';

interface Step3TimeProps {
    wedding: WeddingData;
    updateWedding: (key: keyof WeddingData, value: any) => void;
    updateTheme: (key: string, value: any) => void;
    setWedding: React.Dispatch<React.SetStateAction<WeddingData | null>>;
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

const Step3Time: React.FC<Step3TimeProps> = ({ wedding, updateWedding, updateTheme, setWedding }) => {
    return (
        <div className="space-y-6">
            <div>
                <Label className="mb-2 block text-xs">កាលបរិច្ឆេទ (Date)</Label>
                <Input
                    type="datetime-local"
                    value={toLocalISO(wedding.date)}
                    onChange={(e) => updateWedding("date", new Date(e.target.value).toISOString())}
                />
            </div>
            <div>
                <Label className="mb-2 block text-xs">កាលបរិច្ឆេទតាមច័ន្ទគតិ (Khmer Lunar Date)</Label>
                <Input
                    placeholder="ឧ. ថ្ងៃព្រហស្បតិ៍ ៥កើត ខែផល្គុន..."
                    value={wedding.themeSettings?.lunarDate || ""}
                    onChange={(e) => updateTheme("lunarDate", e.target.value)}
                />
            </div>
            <div>
                <Label className="mb-2 block text-xs">ទីកន្លែង (Location)</Label>
                <Input
                    value={wedding.location || ""}
                    onChange={(e) => updateWedding("location", e.target.value)}
                />
            </div>
            <div>
                <Label className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4" /> ទីតាំងលើផែនទី (Google Maps Link)</Label>
                <DebouncedInput
                    placeholder="បញ្ចូលតំណភ្ជាប់ Google Maps..."
                    value={wedding.themeSettings?.mapLink || ""}
                    onDebouncedChange={(val) => updateTheme('mapLink', val as string)}
                />
            </div>
            <div className="border-t pt-6">
                <Label className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4" /> កម្មវិធី (Timeline)</Label>
                <div className="space-y-3">
                    {wedding.activities?.map((activity: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-start">
                            <Input
                                className="w-24"
                                value={activity.time}
                                onChange={(e) => {
                                    const newActs = [...(wedding.activities || [])];
                                    newActs[idx] = { ...newActs[idx], time: e.target.value };
                                    updateWedding("activities", newActs);
                                }}
                                placeholder="Time"
                            />
                            <Input
                                className="flex-1"
                                value={activity.description}
                                onChange={(e) => {
                                    const newActs = [...(wedding.activities || [])];
                                    newActs[idx] = { ...newActs[idx], description: e.target.value };
                                    updateWedding("activities", newActs);
                                }}
                                placeholder="Description"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => {
                                    const newActs = wedding.activities!.filter((_: any, i: number) => i !== idx);
                                    updateWedding("activities", newActs);
                                }}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setWedding((prev: any) => ({
                                ...prev,
                                activities: [...(prev.activities || []), { time: "00:00", description: "កម្មវិធីថ្មី", title: "Event" }]
                            }));
                        }}
                        className="w-full text-xs dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50"
                    >
                        <Plus size={14} className="mr-1" /> Add Event
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step3Time);
