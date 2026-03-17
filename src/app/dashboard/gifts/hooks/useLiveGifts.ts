"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGiftsData } from "./useGiftsData";

const loadConfetti = () => import("canvas-confetti");

export function useLiveGifts() {
    const {
        wedding,
        gifts,
        stats,
        isLoading: loading,
        error
    } = useGiftsData({ refreshInterval: 3000, limit: 50 });

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastGiftId, setLastGiftId] = useState<string | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isScrolling, setIsScrolling] = useState(true);
    const [userInteracting, setUserInteracting] = useState(false);
    const [showNewGiftFlash, setShowNewGiftFlash] = useState(false);

    const listRef = useRef<HTMLDivElement>(null);
    const latestGift = gifts[0];
    const recentGifts = gifts.slice(1);

    const playNotificationSound = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 2.0);
        } catch (e) { }
    }, [soundEnabled]);

    const triggerPremiumConfetti = async () => {
        const confetti = (await loadConfetti()).default;
        const duration = 5 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#D4AF37', '#FFD700', '#FFFFFF']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#D4AF37', '#FFD700', '#FFFFFF']
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    };

    // Handle new gift detection
    useEffect(() => {
        if (latestGift?.id && latestGift.id !== lastGiftId) {
            setLastGiftId(latestGift.id);
            if (lastGiftId !== null) {
                triggerPremiumConfetti();
                playNotificationSound();
                setShowNewGiftFlash(true);
                setTimeout(() => setShowNewGiftFlash(false), 8000);

                // Reset scroll to top
                if (listRef.current) listRef.current.scrollTop = 0;
                setIsScrolling(false);
                setTimeout(() => setIsScrolling(true), 12000);
            }
        }
    }, [latestGift, lastGiftId, playNotificationSound]);

    // Auto-scrolling logic
    useEffect(() => {
        let animationFrameId: number;
        const scrollAmount = 0.3;

        const scroll = () => {
            if (listRef.current && isScrolling && !userInteracting && gifts.length > 5) {
                if (listRef.current.scrollTop + listRef.current.clientHeight >= listRef.current.scrollHeight - 1) {
                    listRef.current.scrollTop = 0;
                } else {
                    listRef.current.scrollTop += scrollAmount;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isScrolling, userInteracting, gifts.length]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const startPresentation = () => {
        setHasStarted(true);
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            setIsFullscreen(true);
        }
    };

    return {
        wedding,
        gifts,
        latestGift,
        recentGifts,
        stats,
        loading,
        error,
        isFullscreen,
        soundEnabled,
        setSoundEnabled,
        hasStarted,
        showNewGiftFlash,
        listRef,
        setUserInteracting,
        toggleFullscreen,
        startPresentation
    };
}
