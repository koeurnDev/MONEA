import * as React from "react";
// Full rebuild trigger v2.1
import type { Metadata, Viewport } from "next";
import { Kantumruy_Pro, Moul, Great_Vibes, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import SmoothScroll from "@/components/layout/SmoothScroll";

const kantumruy = Kantumruy_Pro({
  weight: ["400", "700"],
  subsets: ["khmer", "latin"],
  variable: "--font-kantumruy",
  display: 'swap',
  preload: true
});
const moul = Moul({
  weight: "400",
  subsets: ["khmer"],
  variable: "--font-moul",
  display: 'swap',
  preload: true
});
const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],














































































  variable: "--font-great-vibes",
  display: 'swap',
  preload: true
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: "MONEA - បង្កើតធៀបអញ្ជើញមង្គលការឌីជីថលដ៏ប្រណីត",
  description: "MONEA Wedding Digital - បង្កើតធៀបអញ្ជើញឌីជីថលដ៏ប្រណីត និងគ្រប់គ្រងមង្គលការរបស់អ្នកជាមួយបច្ចេកវិទ្យាចុងក្រោយ។",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://monea.com'),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "MONEA - មនោសញ្ចេតនានៃក្តីស្រឡាញ់",
    description: "បង្កើនភាពប្រណីតនៃពិធីមង្គលការរបស់អ្នកជាមួយធៀបអញ្ជើញឌីជីថលបែបបច្ចេកវិទ្យា។",
    url: "/",
    siteName: 'MONEA Digital Wedding',
    images: [
      {
        url: '/og-main.jpg',
        width: 1200,
        height: 630,
        alt: 'MONEA Premium Invitations',
      },
    ],
    locale: 'km_KH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MONEA - Professional E-Invitations',
    description: 'Transform your wedding invitations into a digital masterpiece.',
    images: ['/og-main.jpg'],
    creator: '@monea',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MONEA",
  }
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

import { AnimationProvider } from "@/components/providers/AnimationProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { getLocale } from "@/i18n/server";
import Script from "next/script";
import SystemStatusListener from "@/components/layout/SystemStatusListener";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getLocale();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          kantumruy.variable,
          moul.variable,
          greatVibes.variable,
          outfit.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SWRProvider>
            <LoadingProvider>
              <AnimationProvider>
                <LanguageProvider initialLocale={locale}>
                  <SystemStatusListener />
                  <LoadingBar />
                  {children}
                </LanguageProvider>
                <Script
                  id="sw-registration"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
                      if ('serviceWorker' in navigator) {
                        const registerSW = () => {
                          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                              for(let registration of registrations) {
                                registration.unregister();
                                console.log('[SW] Unregistered existing service worker for localhost');
                              }
                            });
                          } else {
                            navigator.serviceWorker.register('/sw.js').catch(function(err) {
                              console.error('ServiceWorker registration failed: ', err);
                            });
                          }
                        };

                        if (document.readyState === 'complete') {
                          setTimeout(registerSW, 2000);
                        } else {
                          window.addEventListener('load', () => setTimeout(registerSW, 2000));
                        }
                      }
                    `,
                  }}
                />
              </AnimationProvider>
            </LoadingProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
