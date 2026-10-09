import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AUTH_URLS } from '@/lib/constants';

const TEMPLATES = [
    {
        code: 'M-02',
        id: 'modern-minimal',
        title: 'Modern Minimal',
        category: 'wedding',
        image: '/images/bg_tunnel.webp',
        description: 'สไตล์เรียบหรู เหมาะกับงานแต่งงานสมัยใหม่ที่ต้องการความสะอาด',
    },
    {
        code: 'M-03',
        id: 'anniversary-elegant',
        title: 'Anniversary Elegant',
        category: 'anniversary',
        image: '/assets/anniversary-elegant/anniversary-elegant-bg.webp',
        description: 'ธีมอันสง่างามสำหรับวันครบรอบ ความอบอุ่นและประทับใจยิ่งขึ้น',
    },
    {
        code: 'M-05',
        id: 'nea-m05',
        title: 'NEA - Olive & Gold',
        category: 'wedding',
        image: '/khmer-invite-starter-kit/elements/crest.svg',
        description: 'ក្រដាសធៀបការខ្មែរបែបទំនើប ពណ៌ olive និងមាសប្រណីត',
    },
];

const FILTER_LABELS = {
    all: 'ទាំងអស់',
    wedding: 'មង្គលការ',
    anniversary: 'ខួបអនុស្សាវរីយ៍',
} as const;

export default function TemplateGalleryPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
    const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
    const [filter, setFilter] = useState<'all' | 'wedding' | 'anniversary'>('all');

    const filteredTemplates = TEMPLATES.filter((template) => filter === 'all' || template.category === filter);

    return (
        <div className="min-h-screen bg-[#160d19] text-white">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#160d19]/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-400 text-sm font-black text-white shadow-lg shadow-rose-950/30">
                            ✦
                        </div>
                        <span className="text-base font-black tracking-[0.18em] text-white">MONEA</span>
                    </Link>

                    <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1 shadow-sm md:flex">
                        {(['all', 'wedding', 'anniversary'] as const).map((item) => (
                            <button
                                key={item}
                                onClick={() => setFilter(item)}
                                className={cn(
                                    'rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.12em] transition-all',
                                    filter === item
                                        ? 'bg-rose-500 text-white shadow-sm'
                                        : 'text-white/55 hover:text-white'
                                )}
                            >
                                {FILTER_LABELS[item]}
                            </button>
                        ))}
                    </div>

                    <Link to={AUTH_URLS.SIGN_UP}>
                        <Button className="h-10 rounded-full bg-rose-500 px-4 text-[10px] font-black tracking-[0.14em] text-white hover:bg-rose-400 sm:px-5">
                            ចាប់ផ្តើម
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
                <div className="mb-6 flex flex-col gap-3 text-center sm:mb-8">
                    <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1 text-[9px] font-black tracking-[0.2em] text-rose-200 shadow-sm">
                        <Sparkles size={12} />
                        ជ្រើសរើសគំរូសម្រាប់ថ្ងៃពិសេស
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                        ជ្រើសរើសស្ទីលដែលសមនឹងអ្នក
                    </h1>
                    <p className="mx-auto max-w-xl text-xs leading-7 text-white/60 sm:text-sm">
                        មើលគំរូធៀបការជាមុន និងជ្រើសរើសការរចនាដែលសមនឹងថ្ងៃពិសេសរបស់អ្នក។
                    </p>
                </div>

                <div className="mb-5 flex items-center justify-between md:hidden">
                    <p className="text-[9px] font-black tracking-[0.2em] text-white/45">ជ្រើសរើសប្រភេទ</p>
                    <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-white/[0.06] p-1">
                        {(['all', 'wedding', 'anniversary'] as const).map((item) => (
                            <button
                                key={item}
                                onClick={() => setFilter(item)}
                                className={cn(
                                    'shrink-0 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-all',
                                    filter === item ? 'bg-rose-500 text-white shadow-sm' : 'text-white/55'
                                )}
                            >
                                {FILTER_LABELS[item]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                        {filteredTemplates.map((template) => {
                            const isSelected = selectedTemplate?.id === template.id;

                            return (
                                <m.div
                                    key={template.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={cn(
                                        'group relative overflow-hidden rounded-[1.75rem] border text-left transition-all duration-300',
                                        isSelected
                                            ? 'border-rose-300/60 bg-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.25)] ring-1 ring-rose-300/20'
                                            : 'border-white/10 bg-white/[0.05] shadow-[0_12px_30px_rgba(0,0,0,0.16)] hover:-translate-y-1 hover:border-rose-300/40 hover:bg-white/[0.08] hover:shadow-[0_18px_40px_rgba(0,0,0,0.22)]'
                                    )}
                                >
                                    <div className="relative aspect-[9/14] overflow-hidden rounded-t-[1.75rem]">
                                        <img
                                            src={template.image}
                                            alt={template.title}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />

                                        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <span className="rounded-full bg-white/90 px-2 py-1 text-[9px] font-black tracking-[0.2em] text-slate-900 shadow-sm">
                                                    {template.code}
                                                </span>
                                                {isSelected && (
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                                                        <Check size={12} strokeWidth={3} />
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-base font-black text-white sm:text-lg">{template.title}</h2>
                                            <p className="mt-1 text-[10px] text-white/70 sm:text-[11px]">{template.category}</p>
                                        </div>
                                    </div>

                                </m.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {selectedTemplate && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
                    >
                        <div className="flex h-full flex-col bg-[#10151b]">
                            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedTemplate(null)}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/80 transition hover:bg-white/10"
                                        aria-label="Close preview"
                                    >
                                        <ArrowLeft size={17} />
                                    </button>
                                    <div>
                                        <h2 className="text-sm font-black text-white sm:text-base">{selectedTemplate.title}</h2>
                                        <p className="text-[10px] tracking-[0.2em] text-slate-400">{FILTER_LABELS[selectedTemplate.category as keyof typeof FILTER_LABELS]}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="hidden items-center gap-1 rounded-full bg-white/5 p-1 sm:flex">
                                        <button
                                            onClick={() => setViewMode('mobile')}
                                            className={cn(
                                                'rounded-full p-2 transition',
                                                viewMode === 'mobile' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                                            )}
                                            title="Mobile view"
                                        >
                                            <Smartphone size={16} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('desktop')}
                                            className={cn(
                                                'rounded-full p-2 transition',
                                                viewMode === 'desktop' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                                            )}
                                            title="Desktop view"
                                        >
                                            <Monitor size={16} />
                                        </button>
                                    </div>

                                </div>
                            </div>

                            <div className="flex flex-1 items-center justify-center overflow-hidden px-3 py-4 sm:px-6 sm:py-6">
                                <div
                                    className={cn(
                                        'relative overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-white/10 transition-all duration-300',
                                        viewMode === 'mobile'
                                            ? 'h-[78vh] max-h-[780px] w-[92vw] max-w-[390px] rounded-[2.5rem] border-[6px] border-slate-900'
                                            : 'h-full w-full max-h-[82vh] rounded-[1.5rem] border border-slate-700'
                                    )}
                                >
                                    <iframe
                                        src={'/preview?templateId=' + selectedTemplate.id}
                                        className="h-full w-full bg-white"
                                        title="Live Preview"
                                    />

                                    {viewMode === 'mobile' && (
                                        <div className="pointer-events-none absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-b-xl bg-slate-900" />
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-white/10 bg-slate-950/70 px-4 py-3 sm:hidden">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setViewMode('mobile')}
                                        className={cn(
                                            'flex-1 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition',
                                            viewMode === 'mobile' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-300'
                                        )}
                                    >
                                        Mobile
                                    </button>
                                    <button
                                        onClick={() => setViewMode('desktop')}
                                        className={cn(
                                            'flex-1 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition',
                                            viewMode === 'desktop' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-300'
                                        )}
                                    >
                                        Desktop
                                    </button>
                                </div>
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
