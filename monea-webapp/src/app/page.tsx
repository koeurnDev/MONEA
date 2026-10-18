import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from 'react-helmet-async';
import PageTransition from "@/components/layout/PageTransition";
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { TemplatesShowcase } from "@/components/landing/sections/TemplatesShowcase";

const Features = lazy(async () => {
  const module = await import("@/components/landing/sections/Features");
  return { default: module.Features };
});
const HowItWorks = lazy(async () => {
  const module = await import("@/components/landing/sections/HowItWorks");
  return { default: module.HowItWorks };
});
const FAQ = lazy(async () => {
  const module = await import("@/components/landing/sections/FAQ");
  return { default: module.FAQ };
});
const FinalCTA = lazy(async () => {
  const module = await import("@/components/landing/sections/FinalCTA");
  return { default: module.FinalCTA };
});
const LandingFooter = lazy(async () => {
  const module = await import("@/components/landing/StaticSections");
  return { default: module.Footer };
});

function DeferredLandingContent() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <Features />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
      <LandingFooter />
    </Suspense>
  );
}

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>ធៀបការឌីជីថល | TheapKa Digital - Online Invitation Khmer</title>
        <meta name="description" content="បង្កើតធៀបអញ្ជើញមង្គលការឌីជីថលបានយ៉ាងងាយស្រួល ភ្ជាប់ Google Maps, KHQR និង Telegram ក្នុងពេលតែមួយជាមួយ MONEO។" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href="https://moneoez.com/" />
        <link rel="alternate" hrefLang="km" href="https://moneoez.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://moneoez.com/" />
        <meta property="og:title" content="ធៀបការឌីជីថល | TheapKa Digital - Online Invitation Khmer" />
        <meta property="og:description" content="បង្កើតធៀបអញ្ជើញមង្គលការឌីជីថលបានយ៉ាងងាយស្រួល ភ្ជាប់ Google Maps, KHQR និង Telegram ក្នុងពេលតែមួយ។" />
        <meta property="og:site_name" content="MONEO" />
        <meta property="og:url" content="https://moneoez.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://moneoez.com/icons/logomoneo.jpg" />
        <meta property="og:image:alt" content="MONEO — ធៀបអញ្ជើញមង្គលការឌីជីថលនៅកម្ពុជា" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://moneoez.com/" />
        <meta name="twitter:title" content="ធៀបការឌីជីថល | TheapKa Digital - Online Invitation Khmer" />
        <meta name="twitter:description" content="បង្កើតធៀបអញ្ជើញមង្គលការឌីជីថលបានយ៉ាងងាយស្រួល ភ្ជាប់ Google Maps, KHQR និង Telegram ក្នុងពេលតែមួយ។" />
        <meta name="twitter:image" content="https://moneoez.com/icons/logomoneo.jpg" />
        <meta name="twitter:image:alt" content="MONEO — ធៀបអញ្ជើញមង្គលការឌីជីថលនៅកម្ពុជា" />
      </Helmet>

      <PageTransition>
        <div className="monea-landing relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
          <NavBar />
          <main>
            <Hero />
            <TemplatesShowcase />
            <DeferredLandingContent />
          </main>
        </div>
      </PageTransition>
    </>
  );
}
