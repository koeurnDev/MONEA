import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Auth layout — wraps sign-in, sign-up, forgot-password pages.
 * Seamless full-screen layout with zero outer border or margin.
 */
export default function AuthLayout() {
  return (
    <ToastProvider>
      <div className="w-full min-h-screen relative text-foreground font-kantumruy overflow-x-hidden bg-background">
        <Outlet />
      </div>
    </ToastProvider>
  );
}
