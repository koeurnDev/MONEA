import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Sparkles, 
    ArrowRight, 
    ExternalLink, 
    Eye, 
    Music, 
    Check, 
    Heart 
} from "lucide-react";
import { AUTH_URLS } from "@/lib/constants";

interface TemplateCard {
    id: string;
    title: string;
    khmerTitle: string;
    description: string;
    palette: string[];
    tag: string;
    image: string;
    popular?: boolean;
}

const TEMPLATES: TemplateCard[] = [
    {
        id: "khmer-legacy",
        title: "Khmer Legacy",
        khmerTitle: "មរតកខ្មែរ",
        description: "រចនាប័ទ្មក្បូរក្បាច់បុរាណខ្មែរ ពណ៌មាសប្រណិត ស័ក្តិសមបំផុតសម្រាប់ពិធីមង្គលការបែបប្រពៃណីខ្មែរ។",
        palette: ["#D4AF37", "#8C1D2F", "#1A150E"],
        tag: "ពេញនិយមបំផុត",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
        popular: true
    },
    {
        id: "blossom-romance",
        title: "Blossom Romance",
        khmerTitle: "មង្គលសិរីផ្កា",
        description: "ពណ៌ផ្កាឈូកស្រទន់ រំលេចដោយកម្រងផ្កាកុលាប និងផ្កាម្លិះ បង្ហាញពីសេចក្តីស្រឡាញ់ដ៏បរិសុទ្ធ។",
        palette: ["#E892A2", "#FFF0F4", "#4A1525"],
        tag: "រ៉ូមែនទិក",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: "emerald-garden",
        title: "Emerald Garden",
        khmerTitle: "ព្រៃមរកត",
        description: "ពណ៌បៃតងត្បូងមរកត បែបធម្មជាតិស្រស់បំព្រង ទំនើប និងមានភាពស្ងប់ស្ងាត់ប្រកបដោយភាពថ្លៃថ្នូរ។",
        palette: ["#1B4D3E", "#D4AF37", "#0B1D16"],
        tag: "ប្រណិតភាព",
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: "modern-minimal",
        title: "Modern Minimal",
        khmerTitle: "រាត្រីរស្មី",
        description: "រចនាប័ទ្មបែប Minimalist សាមញ្ញតែទាក់ទាញ អក្សរច្បាស់ៗ ផ្តោតលើភាពស៊ីវិល័យនៃយុគសម័យថ្មី។",
        palette: ["#1E293B", "#F8FAFC", "#C5A880"],
        tag: "ទាន់សម័យ",
        image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=600&auto=format&fit=crop"
    }
];

export function InteractiveThemeGallery() {
    return (
        <section id="templates" className="py-20 sm:py-28 bg-[#FAF8F5] dark:bg-[#0B0B0E] font-kantumruy border-t border-border/60 relative overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/30">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>ម៉ូដធៀបការប្រណិត</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-snug">
                            រចនាប័ទ្មធៀបការបែបខ្មែរ
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600 dark:from-rose-400 dark:to-amber-300">
                                ស្រស់ស្អាតលើគ្រប់ទូរស័ព្ទដៃ
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                            រាល់ម៉ូដទាំងអស់ត្រូវបានរចនាឡើងយ៉ាងផ្ចិតផ្ចង់ មានចលនាបើកស្រោមសំបុត្រ និងតន្ត្រីពិរោះរណ្តំ។
                        </p>
                    </div>

                    <Link
                        to={AUTH_URLS.SIGN_UP}
                        className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs shadow-xs active:scale-95 transition-all self-start md:self-auto"
                    >
                        <span>មើលគ្រប់ម៉ូដទាំងអស់</span>
                        <ArrowRight className="w-4 h-4 text-rose-600" />
                    </Link>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TEMPLATES.map((tmpl) => (
                        <motion.div
                            key={tmpl.id}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="bg-card rounded-3xl border border-border overflow-hidden shadow-lg flex flex-col group"
                        >
                            {/* Card Image */}
                            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                <img 
                                    src={tmpl.image} 
                                    alt={tmpl.khmerTitle} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                
                                {/* Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black border border-white/20">
                                        {tmpl.tag}
                                    </span>
                                </div>

                                {/* Floating Music icon */}
                                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-amber-400 flex items-center justify-center border border-white/20">
                                    <Music className="w-3.5 h-3.5 animate-pulse" />
                                </div>

                                {/* Content Overlay on Bottom of Image */}
                                <div className="absolute bottom-3 inset-x-3 text-white space-y-1">
                                    <h3 className="text-base font-black tracking-wide">
                                        {tmpl.khmerTitle}
                                    </h3>
                                    <div className="text-[11px] text-white/80 font-medium">
                                        {tmpl.title}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {tmpl.description}
                                </p>

                                {/* Color Palette dots */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                                    <div className="flex items-center gap-1.5">
                                        {tmpl.palette.map((color, i) => (
                                            <span 
                                                key={i} 
                                                className="w-4 h-4 rounded-full border border-white/30 shadow-xs" 
                                                style={{ backgroundColor: color }} 
                                            />
                                        ))}
                                    </div>

                                    <Link
                                        to={AUTH_URLS.SIGN_UP}
                                        className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>រចនាម៉ូដនេះ</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
