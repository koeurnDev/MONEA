import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, CircleHelp, Send, Ticket } from "lucide-react";
import { NavBar } from "@/components/landing/NavBar";
import PageTransition from "@/components/layout/PageTransition";

export default function SupportPage() {
    return (
        <>
            <Helmet>
                <title>ជំនួយ និងការគាំទ្រ | MONEA</title>
                <meta name="description" content="ទទួលជំនួយពី MONEA សម្រាប់ការបង្កើតធៀបការ និងការគ្រប់គ្រងភ្ញៀវ។" />
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
                                <p className="mb-3 text-sm font-bold text-teal-200">MONEA CARE</p>
                                <h1 className="text-4xl font-black leading-[1.4] sm:text-6xl">ជំនួយនៅពេលអ្នកត្រូវការ</h1>
                                <p className="mt-5 text-base leading-8 text-white/65 sm:text-lg">
                                    ជ្រើសរើសវិធីដែលងាយស្រួលសម្រាប់អ្នក ហើយក្រុមការងាររបស់យើងនឹងជួយឱ្យអ្នកបន្តការងារបានរលូន។
                                </p>
                            </div>
                            <div className="mt-12 grid gap-4 md:grid-cols-3">
                                <a href="https://t.me/monea_support" target="_blank" rel="noopener noreferrer" className="rounded-3xl border border-teal-300/25 bg-teal-500/10 p-6 transition-colors hover:bg-teal-500/20">
                                    <Send className="mb-5 text-teal-200" size={24} />
                                    <h2 className="font-bold">ជំនួយតាម Telegram</h2>
                                    <p className="mt-2 text-sm leading-6 text-white/55">សម្រាប់សំណួរដែលត្រូវការចម្លើយរហ័ស</p>
                                </a>
                                <Link to="/sign-in" className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition-colors hover:border-teal-300/40 hover:bg-white/[0.1]">
                                    <Ticket className="mb-5 text-teal-200" size={24} />
                                    <h2 className="font-bold">ផ្ញើសំណើសុំជំនួយ</h2>
                                    <p className="mt-2 text-sm leading-6 text-white/55">ចូលគណនី ដើម្បីផ្ញើបញ្ហាទៅក្រុមការងារ</p>
                                </Link>
                                <Link to="/templates" className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition-colors hover:border-teal-300/40 hover:bg-white/[0.1]">
                                    <BookOpen className="mb-5 text-teal-200" size={24} />
                                    <h2 className="font-bold">មើលគំរូធៀបការ</h2>
                                    <p className="mt-2 text-sm leading-6 text-white/55">ស្វែងរកគំរូដែលសមនឹងថ្ងៃពិសេសរបស់អ្នក</p>
                                </Link>
                            </div>
                            <div className="mt-8 flex items-center gap-3 text-sm text-white/50">
                                <CircleHelp size={17} className="text-teal-200" /> ជាទូទៅ យើងឆ្លើយតបក្នុងរយៈពេល ១ ទៅ ២៤ ម៉ោង
                            </div>
                        </div>
                    </div>
                </main>
            </PageTransition>
        </>
    );
}
