import type { Metadata } from "next";
import { Kantumruy_Pro, Moul, Great_Vibes, Playfair_Display, Dancing_Script, Suwannaphum } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/layout/PageTransition";
import SmoothScroll from "@/components/layout/SmoothScroll";

const kantumruy = Kantumruy_Pro({ weight: ["400", "700"], subsets: ["khmer", "latin"], variable: "--font-kantumruy" });
const moul = Moul({ weight: "400", subsets: ["khmer"], variable: "--font-moul" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-great-vibes" });
const playfair = Playfair_Display({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-playfair" });
const dancingScript = Dancing_Script({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-dancing" });
const suwannaphum = Suwannaphum({ weight: ["400", "700"], subsets: ["khmer"], variable: "--font-suwannaphum" });

export const metadata: Metadata = {
  title: "MONEA - មនោសញ្ចេតនានៃក្តីស្រឡាញ់",
  description: "MONEA Wedding Digital - បង្កើតធៀបអញ្ជើញឌីជីថលដ៏ប្រណីត និងគ្រប់គ្រងមង្គលការរបស់អ្នក។",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  }
};

import { AnimationProvider } from "@/components/providers/AnimationProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          kantumruy.variable,
          moul.variable,
          greatVibes.variable,
          playfair.variable,
          dancingScript.variable,
          suwannaphum.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimationProvider>
            {children}
          </AnimationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
