import type { Metadata } from "next";
import { Kantumruy_Pro, Moul, Great_Vibes } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import SmoothScroll from "@/components/layout/SmoothScroll";

const kantumruy = Kantumruy_Pro({ weight: ["400", "700"], subsets: ["khmer", "latin"], variable: "--font-kantumruy" });
const moul = Moul({ weight: "400", subsets: ["khmer"], variable: "--font-moul" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-great-vibes" });

export const metadata: Metadata = {
  title: "MONEA - មនោសញ្ចេតនានៃក្តីស្រឡាញ់",
  description: "MONEA Wedding Digital - បង្កើតធៀបអញ្ជើញឌីជីថលដ៏ប្រណីត និងគ្រប់គ្រងមង្គលការរបស់អ្នក។",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MONEA",
  }
};

import { AnimationProvider } from "@/components/providers/AnimationProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { LoadingBar } from "@/components/ui/LoadingBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
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
          greatVibes.variable
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
                <LoadingBar />
                {children}
              </AnimationProvider>
            </LoadingProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
