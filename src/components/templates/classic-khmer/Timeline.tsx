import React from 'react';
import { WeddingData } from "../types";
import { m } from 'framer-motion';

export default function Timeline({ wedding }: { wedding: WeddingData }) {
    // Default events from user request, used if no dynamic activities are present
    const defaultEvents = [
        { time: "០៧:០០ នាទីព្រឹក", title: "ជួបជុំភ្ញៀវកិត្តិយស និងបងប្អូន", icon: "👨👩👧👦" },
        { time: "០៧:៣០ នាទីព្រឹក", title: "ពិធីហែជំនូន (កំណត់)", icon: "🎁" },
        { time: "០៨:៣០ នាទីព្រឹក", title: "ពិធីបំពាក់ចិញ្ចៀន", icon: "💍" },
        { time: "០៩:០០ នាទីព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", icon: "✂️" },
        { time: "១០:៣០ នាទីព្រឹក", title: "ពិធីផ្ទះសែន និងសំពះផ្ទឹម", icon: "🙏" },
        { time: "១២:០០ ថ្ងៃត្រង់", title: "អញ្ជើញភ្ញៀវកិត្តិយសពិសាអាហារ", icon: "🍽️" },
        { time: "០៥:០០ នាទីល្ងាច", title: "អញ្ជើញភ្ញៀវកិត្តិយសពិសាអាហារ", icon: "🍷" },
        { time: "០៩:០០ នាទីយប់", title: "ពិធីរាំលេងកម្សាន្ត", icon: "💃" },
    ];

    // Map dynamic activities to this structure if available, otherwise use default
    const events = wedding.activities && wedding.activities.length > 0
        ? wedding.activities.map(act => ({
            time: act.time,
            title: act.description || "",
            icon: "✨" // Default icon for dynamic events
        }))
        : defaultEvents;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 50 } }
    };

    return (
        <div className="py-12 bg-purple-50">
            <m.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-khmer text-2xl md:text-3xl text-center text-red-900 font-bold mb-8 md:mb-10 px-4"
            >
                កម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍
            </m.h2>
            <m.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4 font-khmer"
            >
                {events.map((event, index) => (
                    <m.div
                        variants={item}
                        key={index}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border-l-4 border-wedding-gold cursor-default"
                    >
                        <div className="text-4xl">{event.icon}</div>
                        <div>
                            <p className="text-wedding-gold font-bold">{event.time}</p>
                            <p className="text-gray-700">{event.title}</p>
                        </div>
                    </m.div>
                ))}
            </m.div>
        </div>
    );
}
