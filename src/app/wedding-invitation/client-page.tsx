"use client";
import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Calendar, Send, Music, Music2, CalendarPlus, ChevronDown } from 'lucide-react';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountdownTimer } from '@/components/wedding/countdown-timer';
import { InteractiveMap } from '@/components/wedding/interactive-map';
import { GallerySlideshow } from '@/components/wedding/gallery-slideshow';
import { Envelope } from '@/components/wedding/envelope';
import { WishesWall } from '@/components/wedding/wishes-wall';

import { WeddingData } from '@/components/templates/types';

interface ClientPageProps {
    wedding: any; // Using any temporarily to bypass strict type checks for easier integration, or import proper type
}

export default function WeddingTemplateFullClient({ wedding }: ClientPageProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showEnvelope, setShowEnvelope] = useState(true);

    const WEDDING_ID = wedding.id;

    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play();
        } else {
            audioRef.current?.pause();
        }
    }, [isPlaying]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const res = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestName: name,
                    message,
                    weddingId: WEDDING_ID
                }),
            });

            if (res.ok) {
                setSubmitStatus('success');
                setName('');
                setMessage('');
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error(error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };


    // ចលនាមេអំបៅហោះ (Butterfly Animation)
    const butterflies = [
        { id: 1, delay: 0, x: -20, y: 100 },
        { id: 2, delay: 2, x: 300, y: 200 },
        { id: 3, delay: 4, x: 150, y: -50 },
    ];

    const weddingEvent = {
        title: `ពិធីមង្គលការ ${wedding.groomName} & ${wedding.brideName}`,
        description: `សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលការរបស់ ${wedding.groomName} & ${wedding.brideName}`,
        location: wedding.location || "ទីកន្លែងពិធី",
        startTime: new Date(wedding.date),
        endTime: new Date(new Date(wedding.date).getTime() + 4 * 60 * 60 * 1000), // Default 4 hours duration
    };

    const handleAddToGoogleCalendar = () => {
        const url = generateGoogleCalendarUrl(weddingEvent);
        window.open(url, '_blank');
    };

    const handleDownloadIcs = () => {
        downloadIcsFile(weddingEvent);
    };

    return (
        <div className="bg-[#FFF9FA] min-h-screen max-w-md mx-auto relative overflow-hidden shadow-2xl font-sans">

            {showEnvelope && (
                <div className="fixed inset-0 z-50">
                    <Envelope onOpen={() => setShowEnvelope(false)} guestName="ភ្ញៀវកិត្តិយស" />
                </div>
            )}

            <div className={`transition-opacity duration-1000 ${showEnvelope ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>

                {/* ប៊ូតុងបញ្ជាភ្លេង (Music Toggle) */}
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="fixed top-5 right-5 z-50 bg-white/80 p-2 rounded-full shadow-md text-pink-400"
                >
                    {isPlaying ? <Music size={20} className="animate-spin-slow" /> : <Music2 size={20} />}
                </button>
                <audio ref={audioRef} src={wedding.themeSettings?.musicUrl || "/wedding-song.mp3"} loop />


                {/* ផ្កាតុបតែងផ្នែកខាងលើ (Top Floral) */}
                <m.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-0 left-0 w-full h-48 bg-[url('/floral-top.png')] bg-contain bg-no-repeat z-10"
                />

                {/* Hero Section */}
                <section className="relative pt-28 md:pt-40 pb-10 text-center z-20">
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <h2 className="text-pink-400 font-serif tracking-[0.2em] mb-4 text-lg">សិរីសួស្តីអាពាហ៍ពិពាហ៍</h2>

                        <div className="relative inline-block">
                            <h1 className="text-5xl md:text-6xl font-serif text-[#8E5A5A] leading-tight">{wedding.groomName} <br />&<br /> {wedding.brideName}</h1>

                            {/* មេអំបៅតូចៗហោះកាត់ឈ្មោះ (Animated Butterflies) */}
                            {butterflies.map((b) => (
                                <m.span
                                    key={b.id}
                                    initial={{ x: b.x, y: b.y, opacity: 0 }}
                                    animate={{
                                        x: [b.x, b.x + 100, b.x],
                                        y: [b.y, b.y - 150, b.y],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, delay: b.delay }}
                                    className="absolute text-xl"
                                >
                                    🦋
                                </m.span>
                            ))}
                        </div>

                        <p className="mt-8 text-gray-500 italic">សូមគោរពអញ្ជើញឯកឧត្តម លោកជំទាវ លោកអ្នកស្រី</p>
                        <div className="mt-4 inline-block border-b border-pink-200 px-10 py-2 text-[#8E5A5A] font-bold text-lg">
                            លោក... លោកស្រី...
                        </div>

                        <CountdownTimer targetDate={weddingEvent.startTime} />
                    </m.div>
                </section>

                {/* កាលបរិច្ឆេទ និង កម្មវិធីបុណ្យ (Details) */}
                <m.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="px-5 md:px-8 py-10 space-y-8 bg-white/40 backdrop-blur-sm relative z-20"
                >
                    <div className="flex flex-col items-center border-2 border-pink-100 p-6 rounded-3xl">
                        <Calendar className="text-pink-300 mb-2" />
                        <h3 className="text-[#8E5A5A] font-bold">{new Date(wedding.date).toLocaleDateString('km-KH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>

                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{new Date(wedding.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="mt-4 gap-2 border-pink-200 text-[#8E5A5A] hover:bg-pink-50 hover:text-pink-700">
                                    <CalendarPlus size={16} />
                                    រក្សាទុកកាលបរិច្ឆេទ <ChevronDown size={14} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleAddToGoogleCalendar}>
                                    Google Calendar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownloadIcs}>
                                    Apple / Outlook (ICS)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="space-y-4">
                        {wedding.activities && wedding.activities.length > 0 ? (
                            wedding.activities.map((activity: any) => (
                                <div key={activity.id} className="flex items-center gap-4 text-sm">
                                    <span className="bg-pink-100 text-pink-500 px-3 py-1 rounded-full font-bold">
                                        {activity.time}
                                    </span>
                                    <p className="text-gray-600">{activity.description}</p>
                                </div>
                            ))
                        ) : (
                            // Default Fallback if no activities
                            <>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="bg-pink-100 text-pink-500 px-3 py-1 rounded-full font-bold">07:30 AM</span>
                                    <p className="text-gray-600">ពិធីហែជំនូន និងកាត់សក់បង្កក់សិរី</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="bg-pink-100 text-pink-500 px-3 py-1 rounded-full font-bold">04:30 PM</span>
                                    <p className="text-gray-600">អញ្ជើញពិសាភោជនាហារ (ល្ងាច)</p>
                                </div>
                            </>
                        )}
                    </div>
                </m.section>

                {/* Gallery Section */}
                <m.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="p-4 bg-[#FFF9FA]"
                >
                    <h3 className="text-center font-serif text-[#8E5A5A] text-xl mb-4">កម្រងអនុស្សាវរីយ៍</h3>
                    <GallerySlideshow images={
                        wedding.galleryItems && wedding.galleryItems.length > 0
                            ? wedding.galleryItems.map((item: any) => item.url)
                            : [
                                "/couple-main.jpg",
                                "/couple-2.jpg",
                                "/couple-3.jpg"
                            ]
                    } />
                </m.section>

                {/* ទីតាំង (Location) */}
                <m.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="p-5 md:p-8 space-y-4"
                >
                    <div className="text-center">
                        <MapPin className="mx-auto text-pink-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-4">រៀបចំនៅ៖ {wedding.location || "ទីកន្លែងពិធី"}</p>
                    </div>
                    <InteractiveMap locationName={wedding.location || "Phnom Penh, Cambodia"} />
                </m.section>

                {/* ទម្រង់ផ្ញើសារជូនពរ (Wishes Form) */}
                <m.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="p-6 md:p-8 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(255,182,193,0.2)]"
                >
                    <h3 className="text-center font-serif text-[#8E5A5A] text-xl mb-6">ផ្ញើសារជូនពរ</h3>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="ឈ្មោះរបស់អ្នក"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-pink-50/50 border-none focus:ring-2 focus:ring-pink-200 outline-none"
                            required
                        />
                        <textarea
                            placeholder="ពាក្យជូនពរ..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-pink-50/50 border-none h-28 outline-none focus:ring-2 focus:ring-pink-200"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-400 to-[#8E5A5A] text-white py-4 rounded-2xl font-bold disabled:opacity-50"
                        >
                            {isSubmitting ? 'កំពុងផ្ញើ...' : 'ផ្ញើជូនពរ'} <Send size={18} />
                        </button>
                        {submitStatus === 'success' && <p className="text-center text-green-600">សារជូនពរត្រូវបានផ្ញើដោយជោគជ័យ!</p>}
                        {submitStatus === 'error' && <p className="text-center text-red-500">មានបញ្ហាក្នុងការផ្ញើសារ សូមព្យាយាមម្តងទៀត។</p>}
                    </form>
                </m.section>

                {/* Wishes Wall */}
                <WishesWall weddingId={WEDDING_ID} />

                {/* ផ្កាតុបតែងខាងក្រោម (Bottom Floral) */}
                <div className="h-32 bg-[url('/floral-bottom.png')] bg-contain bg-no-repeat bg-bottom opacity-60" />

            </div>
        </div>
    );
}
