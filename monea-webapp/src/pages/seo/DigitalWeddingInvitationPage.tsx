import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AUTH_URLS } from "@/lib/constants";
import { NavBar } from "@/components/landing/NavBar";
import { Footer } from "@/components/landing/StaticSections";

const benefits = [
    "រចនាធៀបអញ្ជើញមង្គលការជាភាសាខ្មែរ",
    "ផ្ញើតំណធៀបការតាម Telegram និង Messenger",
    "បន្ថែម Google Maps, RSVP និងព័ត៌មានកម្មវិធី",
    "ទទួលចំណងដៃតាម Bakong KHQR",
];

export default function DigitalWeddingInvitationPage() {
    return (
        <>
            <Helmet>
                <title>ធៀបការឌីជីថលខ្មែរ | TheapKa Digital Invitation</title>
                <meta name="description" content="បង្កើតធៀបការឌីជីថលខ្មែរ និងធៀបអញ្ជើញមង្គលការអនឡាញជាមួយ MONEO។ គ្រប់គ្រងភ្ញៀវ RSVP បន្ថែម Google Maps និងចំណងដៃ KHQR ក្នុងកន្លែងតែមួយ។" />
                <link rel="canonical" href="https://moneoez.com/khmer-digital-wedding-invitation" />
                <link rel="alternate" hrefLang="km" href="https://moneoez.com/khmer-digital-wedding-invitation" />
                <link rel="alternate" hrefLang="x-default" href="https://moneoez.com/khmer-digital-wedding-invitation" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="MONEO" />
                <meta property="og:url" content="https://moneoez.com/khmer-digital-wedding-invitation" />
                <meta property="og:title" content="ធៀបការឌីជីថលខ្មែរ | TheapKa Digital Invitation" />
                <meta property="og:description" content="បង្កើតធៀបអញ្ជើញមង្គលការអនឡាញជាភាសាខ្មែរ ជាមួយ RSVP, Google Maps និង KHQR។" />
                <meta property="og:image" content="https://moneoez.com/icons/logomoneo.jpg" />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="1024" />
                <meta property="og:image:height" content="1024" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="ធៀបការឌីជីថលខ្មែរ | TheapKa Digital Invitation" />
                <meta name="twitter:description" content="ធៀបអញ្ជើញមង្គលការអនឡាញសម្រាប់គូស្វាមីភរិយានៅកម្ពុជា។" />
                <meta name="twitter:image" content="https://moneoez.com/icons/logomoneo.jpg" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "WebPage",
                            "@id": "https://moneoez.com/khmer-digital-wedding-invitation#webpage",
                            name: "ធៀបការឌីជីថលខ្មែរ | TheapKa Digital Invitation",
                            url: "https://moneoez.com/khmer-digital-wedding-invitation",
                            description: "បង្កើតធៀបការឌីជីថលខ្មែរ និងធៀបអញ្ជើញមង្គលការអនឡាញជាមួយ MONEO។",
                            isPartOf: { "@id": "https://moneoez.com/#website" },
                            about: { "@type": "Thing", name: "ធៀបការឌីជីថល" },
                            inLanguage: "km-KH",
                        },
                        {
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                {
                                    "@type": "ListItem",
                                    position: 1,
                                    name: "MONEO",
                                    item: "https://moneoez.com/",
                                },
                                {
                                    "@type": "ListItem",
                                    position: 2,
                                    name: "ធៀបការឌីជីថលខ្មែរ",
                                    item: "https://moneoez.com/khmer-digital-wedding-invitation",
                                },
                            ],
                        },
                    ],
                })}</script>
            </Helmet>
            <div className="min-h-screen bg-[#FAF8F5] font-kantumruy text-slate-900 dark:bg-[#09090B] dark:text-white">
                <NavBar />
                <main>
                    <section className="mx-auto max-w-5xl px-4 pb-20 pt-36 text-center sm:px-6">
                        <p className="mb-4 text-sm font-bold text-teal-700 dark:text-teal-200">MONEO · ធៀបការឌីជីថលខ្មែរ</p>
                        <h1 className="mx-auto max-w-4xl text-3xl font-black leading-[1.45] sm:text-5xl">
                            បង្កើតធៀបអញ្ជើញមង្គលការអនឡាញ
                            <span className="block text-teal-700 dark:text-teal-200">ស្អាត ងាយស្រួល និងសម័យទំនើប</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-white/65 sm:text-lg">
                            MONEO ជួយអ្នកបង្កើតធៀបការឌីជីថលជាភាសាខ្មែរ ដើម្បីផ្ញើជូនភ្ញៀវ គ្រប់គ្រង RSVP និងរៀបចំព័ត៌មានថ្ងៃមង្គលការនៅកន្លែងតែមួយ។
                        </p>
                        <Link to={AUTH_URLS.SIGN_UP} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-3 font-bold text-white shadow-lg shadow-teal-700/20 transition hover:from-teal-800 hover:to-teal-700">
                            ចាប់ផ្តើមបង្កើតធៀបការ <ArrowRight size={17} />
                        </Link>
                    </section>
                    <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-24 sm:grid-cols-2 sm:px-6">
                        {benefits.map((benefit) => (
                            <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-teal-900/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                                <CheckCircle2 className="mt-1 shrink-0 text-teal-600 dark:text-teal-300" size={19} />
                                <p className="leading-7 text-slate-700 dark:text-white/80">{benefit}</p>
                            </div>
                        ))}
                    </section>
                </main>
                <Footer />
            </div>
        </>
    );
}
