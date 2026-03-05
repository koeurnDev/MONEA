"use client";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Share2, Users, Gift, ShieldCheck } from "lucide-react";

export default function GuidePage() {
    // Language fixed to Khmer

    const t = {
        title: "📖 របៀបប្រើប្រាស់",
        subtitle: "រៀនពីរបៀបគ្រប់គ្រងធៀបការឌីជីថលរបស់អ្នក។",
        sections: [
            {
                title: "1. ការអញ្ជើញ",
                icon: Share2,
                color: "text-blue-500",
                items: [
                    "ចម្លងតំណ: ចូលទៅកាន់ Dashboard ហើយចម្លងតំណ (ឧ. monea.com/w/123).",
                    "ផ្ញើទៅភ្ញៀវ: ផ្ញើតាមរយៈ Telegram, Messenger ឬ WhatsApp.",
                    "កូដ QR: ទាញយកកូដ QR ដើម្បីបោះពុម្ពលើធៀបការក្រដាស។"
                ]
            },
            {
                title: "2. បញ្ជីភ្ញៀវ",
                icon: Users,
                color: "text-green-500",
                items: [
                    "បន្ថែមភ្ញៀវ: ចូលទៅកាន់ទំព័រ 'Guests' > Add New.",
                    "នាំចូល: ប្រើ Excel/CSV ដើម្បីបញ្ចូលឈ្មោះភ្ញៀវច្រើនក្នុងពេលតែមួយ។",
                    "ក្រុម: រៀបចំជា 'Family', 'Friends', 'Co-workers'។"
                ]
            },
            {
                title: "3. ចំណងដៃ",
                icon: Gift,
                color: "text-pink-500",
                items: [
                    "ការកត់ត្រា: បុគ្គលិកអាចកត់ត្រាចំណងដៃនៅពេលភ្ញៀវមកដល់។",
                    "របាយការណ៍: មើលសរុបជា USD/KHR ក្នុងទំព័រ 'Reports'។",
                    "Export: ទាញយកបញ្ជីជា Excel ដើម្បីផ្ទៀងផ្ទាត់។"
                ]
            },
            {
                title: "4. បុគ្គលិក",
                icon: ShieldCheck,
                color: "text-purple-500",
                items: [
                    "បង្កើតបុគ្គលិក: ចូលទៅកាន់ 'Settings' > Staff Management.",
                    "លេខកូដ PIN: ផ្តល់លេខ PIN ៤ ខ្ទង់ដល់អ្នកទទួលភ្ញៀវ។",
                    "ការចូល: បុគ្គលិកចូលតាម '/staff/login' ដើម្បីស្កេន QR។"
                ]
            }
        ],
        faq: [
            { q: "តើភ្ញៀវអាចមើលឃើញអ្វីខ្លះ?", a: "ភ្ញៀវឃើញតែ ទំព័រធៀបការសាធារណៈ (រូបថត, កាលបរិច្ឆេទ)។ ពួកគេមិនអាចមើលឃើញបញ្ជីចំណងដៃ ឬភ្ញៀវរបស់អ្នកទេ។" },
            { q: "តើត្រូវធ្វើដូចម្តេចបើហួសកំណត់?", a: "បើគម្រោងផុតកំណត់ អ្នកមិនអាចកែរចនាបានទេ។ ប៉ុន្តែ តំណធៀបការរបស់អ្នកនៅតែដំណើរការជារៀងរហូត។" }
        ]
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 drop-shadow-sm">
                    {t.title}
                </h1>
                <p className="text-muted-foreground font-medium text-lg">{t.subtitle}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {t.sections.map((section, idx) => (
                    <div key={idx} className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-white/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className={`p-3 rounded-2xl ${section.color.replace('text-', 'bg-')}/10 ${section.color}`}>
                                <section.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground leading-snug">
                                {section.title}
                            </h3>
                        </div>

                        <ul className="space-y-3 relative z-10">
                            {section.items.map((item: string, i: number) => (
                                <li key={i} className="flex gap-3 text-foreground/80 items-start">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-300 mt-2 shrink-0" />
                                    <span className="leading-relaxed">{item.replace(/<[^>]+>/g, '')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <span className="text-2xl">🤔</span> សំនួរដែលសួរញឹកញាប់
                </h3>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {t.faq.map((f, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border border-border bg-card/50 rounded-xl px-4 shadow-sm data-[state=open]:ring-2 data-[state=open]:ring-primary/10 transition-all">
                            <AccordionTrigger className="font-bold text-foreground hover:text-primary hover:no-underline py-4 text-left">
                                {f.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                                {f.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
