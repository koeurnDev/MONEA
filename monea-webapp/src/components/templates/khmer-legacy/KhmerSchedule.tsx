import * as React from "react";
import { m } from 'framer-motion';
import { 
    Heart, 
    Clock, 
    Scissors, 
    Camera, 
    Utensils, 
    Music, 
    Flower2, 
    Users, 
    GlassWater, 
    Landmark, 
    Calendar, 
    Sparkles, 
    Gem,
    Gift,
    PartyPopper,
    LucideIcon 
} from 'lucide-react';
import { RevealSection } from '../shared/CinematicComponents';
import { WeddingData } from "../types";
import { useTranslation } from "@/i18n/LanguageProvider";

const KHMER_ICONS_MAP: Record<string, LucideIcon> = {
    scissors: Scissors,
    heart: Heart,
    flower: Flower2,
    users: Users,
    utensils: Utensils,
    camera: Camera,
    music: Music,
    glass: GlassWater,
    landmark: Landmark,
    calendar: Calendar,
    clock: Clock,
    sparkles: Sparkles,
    gem: Gem,
    gift: Gift,
    party: PartyPopper,
};

const getActivityIcon = (title: string, iconKey?: string | null): LucideIcon => {
    if (iconKey && KHMER_ICONS_MAP[iconKey.toLowerCase()]) {
        return KHMER_ICONS_MAP[iconKey.toLowerCase()];
    }
    const t = (title || "").toLowerCase();
    if (t.includes("សូត្រមន្ត") || t.includes("ព្រះសង្ឃ")) return Flower2;
    if (t.includes("ជួបជុំ") || t.includes("ភ្ញៀវ")) return Users;
    if (t.includes("ហែជំនូន") || t.includes("កំលាត់")) return Gift;
    if (t.includes("ជំនុំជើងការ") || t.includes("ស្លាកំណត់") || t.includes("លើកតែ")) return Landmark;
    if (t.includes("ចិញ្ចៀន") || t.includes("បំពាក់")) return Gem;
    if (t.includes("កាត់សក់") || t.includes("បង្កក់")) return Scissors;
    if (t.includes("ផ្កាស្លា") || t.includes("បាច")) return Flower2;
    if (t.includes("ពពិល") || t.includes("សំពះផ្ទឹម") || t.includes("ចងដៃ")) return Heart;
    if (t.includes("ថ្ងៃត្រង់") || t.includes("អាហារពេលព្រឹក") || t.includes("បាយ") || t.includes("ពិសាអាហារ")) return Utensils;
    if (t.includes("ល្ងាច") || t.includes("ភោជនាហារ") || t.includes("លៀងសាយ")) return GlassWater;
    return Sparkles;
};

export function KhmerSchedule({ 
    wedding, 
    galleryImages = [] 
}: { 
    wedding: WeddingData; 
    galleryImages?: string[];
}) {
    const { t } = useTranslation();
    const isEngagement = wedding.eventType === 'anniversary';

    const defaultWeddingActivities = [
        { time: "ម៉ោង ០៦:០០ នាទីព្រឹក", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", description: null, icon: "flower" },
        { time: "ម៉ោង ០៦:៣០ នាទីព្រឹក", title: "ជួបជុំភ្ញៀវកិត្តិយស ដើម្បីរៀបចំហែជំនូន", description: null, icon: "users" },
        { time: "ម៉ោង ០៧:០០ នាទីព្រឹក", title: "ពិធីហែជំនូន (កំលាត់)", description: null, icon: "gift" },
        { time: "ម៉ោង ០៧:៣០ នាទីព្រឹក", title: "ពិធីជំនុំជើងការ និងពិសារស្លាកំណត់", description: null, icon: "landmark" },
        { time: "ម៉ោង ០៨:០០ នាទីព្រឹក", title: "ពិធីបំពាក់ចិញ្ចៀន", description: null, icon: "gem" },
        { time: "ម៉ោង ០៩:០០ នាទីព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", description: null, icon: "scissors" },
        { time: "ម៉ោង ១០:០០ នាទីព្រឹក", title: "ពិធីបាចផ្កាស្លា", description: null, icon: "flower" },
        { time: "ម៉ោង ១០:៣០ នាទីព្រឹក", title: "ពិធីបង្វិលពពិល និងសំពះផ្ទឹមសែនចងដៃ", description: null, icon: "heart" },
        { time: "ម៉ោង ១២:០០ ថ្ងៃត្រង់", title: "អញ្ជើញភ្ញៀវកិត្តិយសពិសារភោជនាហារ ថ្ងៃត្រង់", description: null, icon: "utensils" },
        { time: "ម៉ោង ០៥:០០ ល្ងាច", title: "អញ្ជើញភ្ញៀវកិត្តិយសពិសារភោជនាហារ ពេលល្ងាច", description: null, icon: "glass" },
    ];

    const defaultEngagementActivities = [
        { time: "ម៉ោង ០៧:០០ នាទីព្រឹក", title: "ពិធីជួបជុំញាតិមិត្ត & ហែជំនូនភ្ជាប់ពាក្យ", description: null, icon: "gift" },
        { time: "ម៉ោង ០៧:៣០ នាទីព្រឹក", title: "ពិធីរៀបចំ និងរាប់ផ្លែឈើជំនូន", description: null, icon: "flower" },
        { time: "ម៉ោង ០៨:៣០ នាទីព្រឹក", title: "ពិធីពិសារស្លាដក់ និងបំពាក់ចិញ្ចៀន", description: null, icon: "gem" },
        { time: "ម៉ោង ០៩:៣០ នាទីព្រឹក", title: "ពិធីសែនព្រេន និងចងដៃជូនពរជ័យ", description: null, icon: "heart" },
        { time: "ម៉ោង ១១:៣០ នាទីព្រឹក", title: "ពិធីពិសារអាហារសាមគ្គីអបអរសាទរ", description: null, icon: "glass" },
    ];

    const defaultList = isEngagement ? defaultEngagementActivities : defaultWeddingActivities;
    const activities: any[] = wedding.activities && wedding.activities.length > 0 ? wedding.activities : defaultList;

    const scheduleTitle = wedding.themeSettings?.customLabels?.scheduleTitle || 
                          wedding.themeSettings?.customLabels?.schedule_title || 
                          t("template.khmerLegacy.schedule") || 
                          "កម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍";

    // Calendar computation for Save The Date
    const weddingDate = React.useMemo(() => {
        if (!wedding.date) return new Date();
        const d = new Date(wedding.date);
        return isNaN(d.getTime()) ? new Date() : d;
    }, [wedding.date]);

    const calendarData = React.useMemo(() => {
        const year = weddingDate.getFullYear();
        const month = weddingDate.getMonth();
        const selectedDay = weddingDate.getDate();

        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        const monthName = `${monthNames[month]} ${year}`;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // Day of week for 1st of month: Mon=0, ..., Sun=6
        const startDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

        return {
            monthName,
            daysInMonth,
            startDayIndex,
            selectedDay,
        };
    }, [weddingDate]);

    // Group activities by header (e.g. Day 1, Day 2)
    const scheduleGroups = React.useMemo(() => {
        const groups: { header?: typeof activities[0]; items: typeof activities }[] = [];
        let currentGroup: { header?: typeof activities[0]; items: typeof activities } = { items: [] };

        activities.forEach((act) => {
            const isHeader = act.icon === "header" || (!act.time && !act.description && activities.length > 1);
            if (isHeader) {
                if (currentGroup.items.length > 0 || currentGroup.header) {
                    groups.push(currentGroup);
                }
                currentGroup = { header: act, items: [] };
            } else {
                currentGroup.items.push(act);
            }
        });

        if (currentGroup.items.length > 0 || currentGroup.header) {
            groups.push(currentGroup);
        }

        return groups;
    }, [activities]);

    if (!activities || activities.length === 0) return null;

    return (
        <section id="schedule-khmer" className="py-12 md:py-20 px-4 sm:px-6 md:px-12 bg-white relative overflow-hidden font-kantumruy">
            {/* Background ambient gold radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="max-w-xl mx-auto relative z-10 space-y-12">
                {/* 1. Title Section */}
                <RevealSection>
                    <div className="text-center space-y-2.5 mb-8 md:mb-12">
                        <h2 className="font-khmer-moul text-xl sm:text-2xl md:text-3xl text-gold-gradient text-gold-embossed tracking-wide leading-relaxed py-1">
                            {scheduleTitle}
                        </h2>
                        <div className="w-20 md:w-28 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mx-auto" />
                    </div>
                </RevealSection>

                {/* 2. Traditional Timeline / Activities List Grouped by Day */}
                <div className="space-y-8 sm:space-y-10">
                    {scheduleGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-4 sm:space-y-5">
                            {/* Header for this Day/Section */}
                            {group.header && (
                                <RevealSection delay={0.05}>
                                    <div className="text-center py-2 relative z-10">
                                        <div className="inline-flex items-center justify-center gap-2 sm:gap-3 max-w-full px-2">
                                            <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37] shrink-0" />
                                            <h3 className="font-khmer-moul text-xs sm:text-sm md:text-base text-gold-gradient text-gold-embossed tracking-wide px-1">
                                                {group.header.title}
                                            </h3>
                                            <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37] shrink-0" />
                                        </div>
                                        {group.header.description && (
                                            <p className="font-kantumruy text-[11px] sm:text-xs text-stone-500 font-normal pt-1">
                                                {group.header.description}
                                            </p>
                                        )}
                                    </div>
                                </RevealSection>
                            )}

                            {/* Timeline Activities for this Section */}
                            {group.items.length > 0 && (
                                <div className="relative pl-1 sm:pl-2">
                                    {/* Continuous Vertical Line ONLY running between activities of this section */}
                                    <div className="absolute left-[38px] sm:left-[42px] top-3 bottom-3 w-[1.5px] bg-[#C5A027]/40 -translate-x-1/2 pointer-events-none" />

                                    <div className="space-y-4 sm:space-y-5">
                                        {group.items.map((item, actIdx) => {
                                            const IconComp = getActivityIcon(item.title, item.icon);

                                            return (
                                                <RevealSection key={actIdx} delay={actIdx * 0.03}>
                                                    <div className="flex items-center gap-3 sm:gap-4 group">
                                                        {/* Left Golden Outline Icon */}
                                                        <div className="w-8 sm:w-9 flex items-center justify-center shrink-0 text-[#B8860B] drop-shadow-sm group-hover:scale-110 transition-transform">
                                                            <IconComp size={18} className="stroke-[1.6]" />
                                                        </div>

                                                        {/* Node Dot on Vertical Line */}
                                                        <div className="relative flex items-center justify-center shrink-0 z-10">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-[#C5A027] border-2 border-white shadow-[0_0_6px_rgba(197,160,39,0.6)] group-hover:scale-125 transition-transform" />
                                                        </div>

                                                        {/* Right Activity Content (Time ៖ Title) */}
                                                        <div className="flex-1 pl-1 sm:pl-2 text-left">
                                                            <div className="font-kantumruy text-xs sm:text-sm font-bold text-[#805C00] leading-relaxed">
                                                                {item.time ? (
                                                                    <>
                                                                        <span className="text-[#805C00]">{item.time}</span>
                                                                        <span className="mx-1 sm:mx-1.5 text-[#B8860B]/70 font-normal">៖</span>
                                                                        <span className="text-[#5a3e00] font-semibold">{item.title}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-[#5a3e00] font-bold">{item.title}</span>
                                                                )}
                                                            </div>
                                                            {item.description && (
                                                                <p className="font-kantumruy text-[11px] sm:text-xs text-stone-500 leading-normal pt-0.5 font-normal">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </RevealSection>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 3. Save The Date Calendar Block (Matching Reference Image) */}
                <RevealSection delay={0.2}>
                    <div className="pt-6 sm:pt-10 border-t border-[#D4AF37]/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center bg-[#FAF9F6] p-4 sm:p-6 rounded-3xl border border-[#D4AF37]/25 shadow-[0_10px_30px_rgba(212,175,55,0.06)]">
                            {/* Left Couple Photo */}
                            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-md border-2 border-white relative group">
                                {galleryImages[0] ? (
                                    <img 
                                        src={galleryImages[0]} 
                                        alt="Save The Date Couple" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                                        <Heart className="w-10 h-10 text-[#805C00]/30" />
                                    </div>
                                )}
                            </div>

                            {/* Right Calendar */}
                            <div className="space-y-3 text-center sm:text-left">
                                <div className="space-y-1 text-center">
                                    <h3 className="font-playfair italic text-2xl sm:text-3xl text-gold-gradient font-bold leading-tight">
                                        Save the Date
                                    </h3>
                                    <p className="font-playfair text-[10px] sm:text-xs tracking-[0.25em] text-[#805C00] font-black uppercase">
                                        {calendarData.monthName}
                                    </p>
                                </div>

                                <div className="w-full h-[1px] bg-[#D4AF37]/40 my-2" />

                                {/* Days of Week Header */}
                                <div className="grid grid-cols-7 text-center font-playfair text-[9px] sm:text-[10px] text-stone-500 font-bold py-1">
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                    <span>Sun</span>
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 text-center font-playfair text-[10px] sm:text-xs gap-y-1.5 py-1">
                                    {Array.from({ length: calendarData.startDayIndex }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
                                        const dayNum = i + 1;
                                        const isWeddingDay = dayNum === calendarData.selectedDay;

                                        return (
                                            <div key={`day-${dayNum}`} className="flex items-center justify-center h-6 sm:h-7">
                                                {isWeddingDay ? (
                                                    <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7">
                                                        <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-red-600 text-red-600 absolute" />
                                                        <span className="relative z-10 text-[9px] sm:text-[10px] font-bold text-white leading-none pt-0.5">
                                                            {dayNum < 10 ? `0${dayNum}` : dayNum}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-stone-700 font-medium">
                                                        {dayNum < 10 ? `0${dayNum}` : dayNum}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </div>
        </section>
    );
}
