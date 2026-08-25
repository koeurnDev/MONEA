import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Auth layout — wraps sign-in, sign-up, forgot-password pages.
 * Luxurious, theme-adaptive wedding aesthetic with gentle ambient glows.
 */
export default function AuthLayout() {
  return (
    <ToastProvider>
      <div className="min-h-screen w-full relative flex items-center justify-center bg-[#FAF8F5] dark:bg-[#09090b] text-foreground font-kantumruy overflow-x-hidden transition-colors duration-300">
        {/* Soft Ambient Wedding Glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Champagne & Soft Rose Ambient Glows */}
          <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-rose-500/10 dark:bg-rose-600/15 blur-[130px]" />
          <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-amber-500/10 dark:bg-amber-600/10 blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-rose-400/5 dark:bg-rose-900/10 blur-[150px]" />
          
          {/* Subtle Elegance Grid / Dot Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
        </div>

        {/* Content Viewport */}
        <div className="relative z-10 w-full flex items-center justify-center p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </ToastProvider>
  );
}
