"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Monitor, Check, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AUTH_URLS } from '@/lib/constants';

// Template Data (Mirrored from Dashboard)
const TEMPLATES = [
    { id: "khmer-legacy", title: "Legacy", category: 'wedding', bgClass: "bg-stone-50", textClass: "text-stone-600", image: "/images/bg_staircase.jpg", description: "Traditional Khmer elegance meeting modern editorial design standards." },
];

export default function TemplateGalleryPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
    const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
    const [filter, setFilter] = useState<'all' | 'wedding' | 'anniversary'>('all');

    const filteredTemplates = TEMPLATES.filter(t => filter === 'all' || t.category === filter);

    return (
        <div className="min-h-screen bg-slate-50 font-kantumruy">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:bg-pink-600 transition-colors">K</div>
                        <span className="font-bold text-xl tracking-widest text-slate-900 group-hover:text-pink-600 transition-colors">MONEA</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-full">
                        {['all', 'wedding', 'anniversary'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-bold transition-all capitalize",
                                    filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <Link href={AUTH_URLS.SIGN_UP}>
                        <Button className="bg-slate-900 text-white hover:bg-black rounded-full px-8">
                            Start Creating
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Gallery Grid */}
            <main className="container mx-auto px-6 py-12">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Choose Your Masterpiece</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        Explore our collection of premium, interactive digital invitation templates. Click to experience them live.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode='popLayout'>
                        {filteredTemplates.map((template) => (
                            <m.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-[9/16] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white border border-slate-100">
                                    <Image
                                        src={template.image}
                                        alt={template.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1 rounded-full inline-block mb-3 uppercase tracking-wider">
                                            {template.category}
                                        </div>
                                        <h3 className="text-white text-2xl font-bold mb-1 leading-tight">{template.title}</h3>
                                        <p className="text-white/70 text-xs line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{template.description}</p>
                                        <div className="flex items-center gap-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                                            <ExternalLink size={16} /> Preview Live
                                        </div>
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            {/* Preview Modal */}
            <AnimatePresence>
                {selectedTemplate && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/40">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <div>
                                    <h2 className="text-white font-bold text-lg">{selectedTemplate.title}</h2>
                                    <p className="text-white/40 text-xs uppercase tracking-widest">{selectedTemplate.category}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 rounded-full p-1 flex items-center border border-white/5">
                                    <button
                                        onClick={() => setViewMode('mobile')}
                                        className={cn(
                                            "p-2 rounded-full transition-all text-white",
                                            viewMode === 'mobile' ? "bg-white/20 shadow-sm" : "text-white/40 hover:text-white"
                                        )}
                                        title="Mobile View"
                                    >
                                        <Smartphone size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('desktop')}
                                        className={cn(
                                            "p-2 rounded-full transition-all text-white",
                                            viewMode === 'desktop' ? "bg-white/20 shadow-sm" : "text-white/40 hover:text-white"
                                        )}
                                        title="Desktop View"
                                    >
                                        <Monitor size={20} />
                                    </button>
                                </div>

                                <Link href={`/dashboard/design?templateId=${selectedTemplate.id}`}>
                                    <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full">
                                        Use Template
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Preview Iframe Container */}
                        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative" onClick={() => setSelectedTemplate(null)}>
                            <div
                                className={cn(
                                    "bg-white shadow-2xl transition-all duration-500 overflow-hidden relative",
                                    viewMode === 'mobile'
                                        ? "w-[375px] h-[812px] rounded-[3rem] border-8 border-slate-900 ring-1 ring-slate-800/50"
                                        : "w-full h-full rounded-xl border border-slate-700"
                                )}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <iframe
                                    src={'/preview?templateId=' + selectedTemplate.id}
                                    className="w-full h-full bg-white"
                                    title="Live Preview"
                                />

                                {viewMode === 'mobile' && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-10" />
                                )}
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
