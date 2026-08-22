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
                    "ការចូល: បុគ្គលិកចូលតាម '/sign-in' ដើម្បីស្កេន QR។"
                ]
            }
        ],
        faq: [
            { q: "តើត្រូវធ្វើដូចម្តេចបើហួសកំណត់?", a: "បើគម្រោងផុតកំណត់ អ្នកមិនអាចកែរចនាបានទេ។ ប៉ុន្តែ តំណធៀបការរបស់អ្នកនៅតែដំណើរការជារៀងរហូត។" },
            { q: "តើការបង់ប្រាក់មានសុវត្ថិភាពដែរឬទេ?", a: "បាទ! យើងប្រើប្រាស់ប្រព័ន្ធ Bakong ផ្លូវការ និងមានបច្ចេកវិទ្យាចងចាំការបង់ប្រាក់ (Session Persistence)។ បើទោះជាអ៊ីនធឺណិតដាច់ ក៏លោកអ្នកអាចចុច Verify ឡើងវិញបានជានិច្ច។" },
            { q: "តើអ្វីទៅជាការរចនាបែប Mobile Responsive?", a: "វាគឺជាបច្ចេកវិទ្យាដែលអនុញ្ញាតឱ្យគេហទំព័រ ឬធៀបការឌីជីថលរបស់អ្នក ប្តូរទំហំ និងរូបរាងដោយស្វ័យប្រវត្តិតាមឧបករណ៍ដែលភ្ញៀវប្រើប្រាស់ (ទូរស័ព្ទ ថេប្លេត ឬកុំព្យូទ័រ) ដើម្បីផ្តល់បទពិសោធន៍ល្អបំផុត។" }
        ],
        mobileResponsive: {
            title: "📱 បច្ចេកវិទ្យាឆ្លើយតបតាមទូរស័ព្ទ (Mobile Responsive)",
            description: "ធៀបការ MONEA ត្រូវបានរចនាឡើងដោយផ្តោតលើទូរស័ព្ទដៃជាចម្បង (Mobile-First) ដើម្បីធានាថាភ្ញៀវរបស់អ្នកទទួលបានបទពិសោធន៍ដ៏អស្ចារ្យ។",
            techniques: [
                { label: "Viewport Control", detail: "កំណត់ឱ្យអេក្រង់បង្ហាញពេញទំហំទូរស័ព្ទភ្លាមៗ។" },
                { label: "Flexible Layouts", detail: "ប្រើប្រាស់ប្លង់បត់បែន (Flexbox/Grid) ដែលមិនរាយប៉ាយលើអេក្រង់តូច។" },
                { label: "Optimized Images", detail: "រូបភាពត្រូវបានបង្រួមឱ្យតូច និងច្បាស់ លឿនបំផុតសម្រាប់អ៊ីនធឺណិតចល័ត។" },
                { label: "Touch Targets", detail: "ប៊ូតុង និងតំណភ្ជាប់មានទំហំធំល្មម (យ៉ាងតិច 44x44px) ងាយស្រួលចុច។" }
            ]
        }
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

            <div className="bg-gradient-to-br from-yellow-500/10 via-yellow-600/5 to-transparent border border-yellow-500/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full" />
                
                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t.mobileResponsive.title}</h2>
                            <p className="text-muted-foreground max-w-2xl">{t.mobileResponsive.description}</p>
                        </div>
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-card flex items-center justify-center shadow-sm">
                                    <span className="text-lg">✨</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {t.mobileResponsive.techniques.map((tech, i) => (
                            <div key={i} className="bg-background/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl hover:bg-background/60 transition-colors">
                                <div className="text-yellow-600 font-bold mb-2 text-sm uppercase tracking-wider">{tech.label}</div>
                                <div className="text-foreground/80 text-sm leading-relaxed">{tech.detail}</div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-yellow-500/10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-muted-foreground italic">
                        <div className="flex items-center gap-2">✅ ប្លង់បត់បែន (Flexible Layouts)</div>
                        <div className="flex items-center gap-2">✅ រូបភាពឆ្លើយតប (Responsive Images)</div>
                        <div className="flex items-center gap-2">✅ បច្ចេកវិទ្យាទំនើប (Modern Tools)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
