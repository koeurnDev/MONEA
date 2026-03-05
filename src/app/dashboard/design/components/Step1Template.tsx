
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
}

const TEMPLATES = [
    { id: "vip-premium-khmer", title: "Eternal", categories: ['wedding', 'anniversary'], bgClass: "bg-stone-900 border-[#D4AF37]", textClass: "text-[#D4AF37]", image: "/images/bg_staircase.jpg" },
    { id: "khmer-legacy", title: "Legacy", categories: ['wedding', 'anniversary'], bgClass: "bg-stone-50", textClass: "text-stone-600", image: "/images/bg_staircase.jpg" },
];

const Step1Template: React.FC<Step1TemplateProps> = ({ wedding, updateEventType, updateTemplate }) => {
    return (
        <div className="space-y-4">
            <div className="bg-muted/50 border border-border p-4 rounded-xl">
                <h3 className="text-sm font-bold text-foreground font-kantumruy mb-1">ជំហានទី១៖ ជ្រើសរើសប្រភេទកម្មវិធី និងម៉ូដធៀប</h3>
                <p className="text-xs text-muted-foreground">សូមជ្រើសរើសប្រភេទកម្មវិធីរបស់អ្នក (មង្គលការ ឬ ខួប) រួចរើសយកម៉ូដដែលអ្នកពេញចិត្ត។</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <button
                    onClick={() => updateEventType('wedding')}
                    className={clsx(
                        "px-4 py-2 rounded-lg transition-all",
                        wedding.eventType === 'wedding' ? "bg-background text-pink-600 shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    ពិធីមង្គលការ (Wedding)
                </button>
                <button
                    onClick={() => updateEventType('anniversary')}
                    className={clsx(
                        "px-4 py-2 rounded-lg transition-all",
                        wedding.eventType === 'anniversary' ? "bg-background text-pink-600 shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    ពិធីខួប (Anniversary)
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {TEMPLATES
                    .filter(t => t.categories.includes(wedding.eventType || 'wedding'))
                    .map((tmpl, idx) => (
                        <m.div
                            key={tmpl.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => updateTemplate(tmpl.id)}
                            className={clsx(
                                "cursor-pointer rounded-xl p-1.5 transition-all duration-300 relative overflow-hidden group border shadow-sm hover:shadow-md",
                                (wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'vip-premium-khmer'))
                                    ? "border-pink-500 bg-primary/5 ring-2 ring-pink-500/10"
                                    : "border-transparent bg-muted/50 hover:bg-background hover:border-primary/20"
                            )}
                        >
                            <div className={`aspect-[2/3] ${tmpl.bgClass} rounded-lg mb-2 overflow-hidden shadow-inner flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105 relative`}>
                                <div className="absolute inset-0">
                                    <Image
                                        src={tmpl.image}
                                        alt={tmpl.title}
                                        fill
                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        sizes="(max-width: 768px) 33vw, 15vw"
                                        priority
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className={`relative z-10 text-center p-1 mt-auto w-full`}>
                                    <p className="text-white font-bold text-[9px] drop-shadow-md truncate w-full px-1">{tmpl.title}</p>
                                </div>
                            </div>
                            {(wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'vip-premium-khmer')) && (
                                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-0.5 shadow-sm">
                                    <Check size={8} strokeWidth={3} />
                                </div>
                            )}
                        </m.div>
                    ))}
            </div>
        </div>
    );
};

export default React.memo(Step1Template);
