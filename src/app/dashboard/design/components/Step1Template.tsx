import React from 'react';
import { m } from 'framer-motion';
import clsx from 'clsx';
import Image from 'next/image';
import { Check } from 'lucide-react';
import type { WeddingData } from '@/components/templates/types';

interface Step1TemplateProps {
    wedding: WeddingData;
    updateEventType: (type: 'wedding' | 'anniversary') => void;
    updateTemplate: (templateId: string) => void;
    packageType?: string | null;
}

const TEMPLATES = [
    { id: "khmer-legacy", title: "កេរ្តិ៍តំណែលខ្មែរ (Legacy)", categories: ['wedding', 'anniversary'], bgClass: "bg-stone-50", textClass: "text-stone-600", image: "/assets/khmer-legacy/legacy-preview-clean.png", isFree: true },
];

const Step1Template: React.FC<Step1TemplateProps> = ({ wedding, updateEventType, updateTemplate, packageType }) => {
    const isFreePlan = !packageType || packageType === "FREE";

    const handleSelectTemplate = (tmpl: any) => {
        updateTemplate(tmpl.id);
    };

    return (
        <div className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
                <h3 className="text-sm font-bold text-foreground font-kantumruy mb-1">ជំហានទី១៖ ជ្រើសរើសប្រភេទកម្មវិធី និងម៉ូដធៀប</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">សូមជ្រើសរើសប្រភេទកម្មវិធីរបស់អ្នក (មង្គលការ ឬ ខួប)។ បច្ចុប្បន្នយើងផ្ញល់ជូនម៉ូដ Legacy ជាជម្រើសដ៏ល្អបំផុត។</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <button
                    onClick={() => updateEventType('wedding')}
                    className={clsx(
                        "px-4 py-2 rounded-lg transition-all",
                        wedding.eventType === 'wedding' ? "bg-background text-red-600 shadow-md" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    ពិធីមង្គលការ (Wedding)
                </button>
                <button
                    onClick={() => updateEventType('anniversary')}
                    className={clsx(
                        "px-4 py-2 rounded-lg transition-all",
                        wedding.eventType === 'anniversary' ? "bg-background text-red-600 shadow-md" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    ពិធីខួប (Anniversary)
                </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((tmpl, idx) => (
                    <m.div
                        key={tmpl.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSelectTemplate(tmpl)}
                        className={clsx(
                            "cursor-pointer rounded-xl p-3 transition-all duration-300 relative overflow-hidden group shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] border-2",
                            (wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'khmer-legacy'))
                                ? "bg-red-50 border-red-200"
                                : "bg-muted/40 border-transparent hover:bg-background"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-20 aspect-[2/3] ${tmpl.bgClass} rounded-lg overflow-hidden relative shadow-inner`}>
                                <Image
                                    src={tmpl.image}
                                    alt={tmpl.title}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-slate-900">{tmpl.title}</p>
                                <p className="text-xs text-slate-500">រចនាបថខ្មែរ បែបអភិជន និងទាន់សម័យ</p>
                            </div>
                            {(wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'khmer-legacy')) && (
                                <div className="bg-red-600 text-white rounded-full p-1 shadow-md">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    </m.div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(Step1Template);
