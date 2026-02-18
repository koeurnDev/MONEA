"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CountdownSection({ targetDate, eventType }: { targetDate: string | Date, eventType?: string }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(targetDate).getTime() - now;

            if (distance < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    const TimeBox = ({ val, label }: { val: number, label: string }) => (
        <div className="flex flex-col items-center mx-2">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-white/10 backdrop-blur-md shadow-lg rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-xl md:text-3xl font-bold text-white font-kantumruy drop-shadow-md">{String(val).padStart(2, '0')}</span>
            </div>
            <span className="text-[10px] md:text-sm text-pink-200 mt-2 font-khmer drop-shadow-sm">{label}</span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="py-10 flex flex-col items-center"
        >
            <h3 className="text-sm md:text-lg font-kantumruy text-pink-300 mb-6 uppercase tracking-widest drop-shadow-md font-bold">
                {eventType === 'anniversary' ? "រាប់ថយក្រោយដល់ថ្ងៃខួប" : "រាប់ថយក្រោយដល់ថ្ងៃពិសេស"}
            </h3>
            <div className="flex justify-center flex-wrap gap-2">
                <TimeBox val={timeLeft.days} label="ថ្ងៃ" />
                <TimeBox val={timeLeft.hours} label="ម៉ោង" />
                <TimeBox val={timeLeft.minutes} label="នាទី" />
                <TimeBox val={timeLeft.seconds} label="វិនាទី" />
            </div>
        </motion.div>
    );
}
