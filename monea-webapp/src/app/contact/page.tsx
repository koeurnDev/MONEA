import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Facebook, Instagram, Send } from "lucide-react";
import { NavBar } from "@/components/landing/NavBar";
import PageTransition from "@/components/layout/PageTransition";

export default function ContactPage() {
    return (
        <>
            <Helmet>
                <title>ទាក់ទង MONEA</title>
                <meta name="description" content="ទាក់ទងក្រុមការងារ MONEA សម្រាប់សំណួរ និងព័ត៌មានបន្ថែម។" />
            </Helmet>
            <PageTransition>
                <main className="min-h-screen bg-[#160d19] text-white font-kantumruy">
                    <NavBar />
                    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 pb-20 pt-32 sm:px-6">
                        <div className="w-full">
                            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
                                <ArrowLeft size={16} /> ត្រឡប់ទៅទំព័រដើម
                            </Link>
                            <div className="max-w-2xl">
                                <p className="mb-3 text-sm font-bold text-teal-200">MONEA</p>
                                <h1 className="text-4xl font-black leading-[1.4] sm:text-6xl">ចង់សួរអ្វីមួយ?</h1>
                                <p className="mt-5 text-base leading-8 text-white/65 sm:text-lg">
                                    ក្រុមការងារ MONEA រីករាយជួយអ្នករៀបចំធៀបការឌីជីថលឱ្យស្អាត និងងាយស្រួលប្រើ។
                                </p>
                            </div>
                            <div className="mt-12 grid gap-4 sm:grid-cols-3">
                                <a href="https://t.me/monea_support" target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition-colors hover:border-teal-300/40 hover:bg-white/[0.1]">
                                    <Send className="mb-5 text-teal-200" size={24} />
                                    <h2 className="font-bold">Telegram</h2>
                                    <p className="mt-2 text-sm leading-6 text-white/55">ទាក់ទងក្រុមការងារដោយផ្ទាល់</p>
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition-colors hover:border-teal-300/40 hover:bg-white/[0.1]">
                                    <Facebook className="mb-5 text-teal-200" size={24} />
                                    <h2 className="font-bold">Facebook</h2>
                                    <p className="mt-2 text-sm leading-6 text-white/55">តាមដានព័ត៌មានថ្មីៗពី MONEA</p>
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition-colors hover:border-teal-300/40 hover:bg-white/[0.1]">
                                    <Instagram className="mb-5 text-teal-200" size={24} />
                                    <h2 className="font-bold">Instagram</h2>
                                    <p className="mt-2 text-sm leading-6 text-white/55">មើលគំរូការរចនាស្អាតៗ</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </PageTransition>
        </>
    );
}
