import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AUTH_URLS } from "@/lib/constants";
import { NavBar } from "@/components/landing/NavBar";
import { Footer } from "@/components/landing/StaticSections";

const trialFeatures = [
    "សាកល្បងឥតគិតថ្លៃរយៈពេល ១៤ ថ្ងៃជាមួយ Template M1",
    "ចាប់ផ្តើមជាមួយ Template M1",
    "បង្កើត និងចែករំលែកធៀបការឌីជីថល",
    "បន្ថែមព័ត៌មានថ្ងៃមង្គលការ និងទីតាំង",
];

const paidFeatures = [
    "PRO ប្រើបាន ៦០ ថ្ងៃ និង PREMIUM ប្រើបាន ៥ ខែ",
    "ប្រើ Template និងរចនាបថបន្ថែម",
    "គ្រប់គ្រងបញ្ជីភ្ញៀវ និង RSVP",
    "បន្ថែម Google Maps និង KHQR",
    "បន្តប្រើការអញ្ជើញបន្ទាប់ពី Trial ផុតកំណត់",
];

function FeatureList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3 text-left">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/80">
                    <CheckCircle2 className="mt-1 shrink-0 text-teal-300" size={18} />
                    <span className="leading-7">{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default function PricingPage() {
    return (
        <>
            <Helmet>
                <title>តម្លៃធៀបការឌីជីថល | TheapKa Digital Pricing</title>
                <meta
                    name="description"
                    content="សាកល្បងបង្កើតធៀបការឌីជីថលឥតគិតថ្លៃ ១៤ ថ្ងៃជាមួយ Template M1។ Upgrade ទៅ PRO ឬ PREMIUM ដើម្បីប្រើ Template និងមុខងារបន្ថែម។"
                />
                <meta name="robots" content="index, follow, max-image-preview:large" />
                <link rel="canonical" href="https://moneoez.com/pricing" />
                <link rel="alternate" hrefLang="km" href="https://moneoez.com/pricing" />
                <link rel="alternate" hrefLang="x-default" href="https://moneoez.com/pricing" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="MONEO" />
                <meta property="og:url" content="https://moneoez.com/pricing" />
                <meta property="og:title" content="តម្លៃធៀបការឌីជីថល | TheapKa Digital Pricing" />
                <meta
                    property="og:description"
                    content="ចាប់ផ្តើមបង្កើតធៀបការឌីជីថលជាមួយ MONEO និងសាកល្បងឥតគិតថ្លៃ ១៤ ថ្ងៃ។"
                />
                <meta property="og:image" content="https://moneoez.com/icons/logomoneo.jpg" />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:alt" content="MONEO digital wedding invitation" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="តម្លៃធៀបការឌីជីថល | TheapKa Digital Pricing" />
                <meta
                    name="twitter:description"
                    content="សាកល្បង MONEO ឥតគិតថ្លៃ ១៤ ថ្ងៃ និងបង្កើតធៀបការឌីជីថលខ្មែរ។"
                />
                <meta name="twitter:image" content="https://moneoez.com/icons/logomoneo.jpg" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://moneoez.com/pricing#webpage",
                                name: "តម្លៃធៀបការឌីជីថល | TheapKa Digital Pricing",
                                url: "https://moneoez.com/pricing",
                                isPartOf: { "@id": "https://moneoez.com/#website" },
                                inLanguage: "km-KH",
                            },
                            {
                                "@type": "Offer",
                                name: "MONEO 14-day free trial",
                                url: "https://moneoez.com/pricing",
                                price: "0",
                                priceCurrency: "USD",
                                availability: "https://schema.org/InStock",
                                description: "សាកល្បងរយៈពេល ១៤ ថ្ងៃជាមួយ Template M1 និងភ្ញៀវរហូតដល់ ២០ នាក់។",
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
                                        name: "តម្លៃសេវាកម្ម",
                                        item: "https://moneoez.com/pricing",
                                    },
                                ],
                            },
                        ],
                    })}
                </script>
            </Helmet>
            <div className="min-h-screen bg-[#FAF8F5] font-kantumruy text-slate-900 dark:bg-[#09090B] dark:text-white">
                <NavBar />
                <main>
                    <section className="mx-auto max-w-5xl px-4 pb-16 pt-36 text-center sm:px-6">
                        <p className="mb-4 text-sm font-bold text-teal-700 dark:text-teal-200">MONEO · Pricing</p>
                        <h1 className="mx-auto max-w-4xl text-3xl font-black leading-[1.45] sm:text-5xl">
                            ជ្រើសរើសវិធីដែលសមនឹងអ្នក
                            <span className="block text-teal-700 dark:text-teal-200">ចាប់ផ្តើមសាកល្បង ១៤ ថ្ងៃដោយឥតគិតថ្លៃ</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-white/65 sm:text-lg">
                            បង្កើតធៀបការឌីជីថលជាភាសាខ្មែរ និង Upgrade នៅពេលអ្នកត្រៀមខ្លួនរួច ដើម្បីប្រើ Template និងមុខងារបន្ថែម។
                        </p>
                    </section>
                    <section className="mx-auto grid max-w-5xl gap-5 px-4 pb-16 sm:grid-cols-2 sm:px-6">
                        <article className="rounded-3xl border border-teal-700/20 bg-teal-50 p-6 shadow-sm sm:p-8 dark:border-teal-300/30 dark:bg-teal-500/10">
                            <p className="text-sm font-bold text-teal-700 dark:text-teal-200">Free Trial</p>
                            <h2 className="mt-2 text-2xl font-black">សាកល្បង ១៤ ថ្ងៃ</h2>
                            <p className="mt-3 mb-6 text-slate-600 dark:text-white/65">សាកល្បងបង្កើតធៀបការរបស់អ្នក មុនពេលសម្រេចចិត្ត Upgrade។</p>
                            <FeatureList items={trialFeatures} />
                        </article>
                        <article className="rounded-3xl border border-amber-700/15 bg-white p-6 shadow-sm sm:p-8 dark:border-amber-200/25 dark:bg-white/[0.05]">
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-200">Paid Plans</p>
                            <h2 className="mt-2 text-2xl font-black">ប្រើបានកាន់តែច្រើន</h2>
                            <p className="mt-3 mb-6 text-slate-600 dark:text-white/65">Upgrade ដើម្បីបន្តប្រើ និងដោះសោ Template សម្រាប់ថ្ងៃពិសេសរបស់អ្នក។</p>
                            <FeatureList items={paidFeatures} />
                        </article>
                    </section>
                    <div className="pb-24 text-center">
                        <Link to={AUTH_URLS.SIGN_UP} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-bold transition hover:bg-teal-500">
                            ចាប់ផ្តើមសាកល្បងឥឡូវនេះ <ArrowRight size={17} />
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
