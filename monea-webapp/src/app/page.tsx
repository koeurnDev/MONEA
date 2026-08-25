import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTransition from "@/components/layout/PageTransition";
import SmoothScroll from "@/components/layout/SmoothScroll";
// next/dynamic replaced with React.lazy;
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/landing/StaticSections";
import { FloatingContactButton } from "@/components/landing/FloatingContactButton";

// Dynamically import below-the-fold sections
const Features = lazy(() => import("@/components/landing/LandingSections").then(m => ({ default: (m as any).Features })));
const HowItWorks = lazy(() => import("@/components/landing/LandingSections").then(m => ({ default: (m as any).HowItWorks })));
 
// --- Main Landing Page ---
// This is now a Server Component, drastically reducing the main bundle size.

// Section skeleton loader — smooth shimmer while each section loads
function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`w-full ${height} flex items-center justify-center`}>
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-white/20 dark:border-t-white animate-spin" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Monea - រៀបចំមង្គលការ និងកម្មវិធីផ្សេងៗយ៉ាងងាយស្រួល</title>
        <meta name="description" content="Monea ជួយអ្នកបង្កើតលិខិតអញ្ជើញឌីជីថល គ្រប់គ្រងភ្ញៀវ និងកត់ត្រាចំណងដៃបានយ៉ាងងាយស្រួលនិងមានប្រសិទ្ធភាព។" />
        <meta property="og:title" content="Monea - Digital Invitation &amp; Guest Management" />
        <meta property="og:description" content="Monea ជួយអ្នកបង្កើតលិខិតអញ្ជើញឌីជីថល គ្រប់គ្រងភ្ញៀវ និងកត់ត្រាចំណងដៃបានយ៉ាងងាយស្រួលនិងមានប្រសិទ្ធភាព។" />
        <meta property="og:image" content="/og-image.png" />
      </Helmet>
      <SmoothScroll>
      <PageTransition>
        <div className="flex flex-col min-h-screen will-change-transform relative">
          <NavBar />
          {/* Hero loads immediately — no lazy */}
          <Hero />
          {/* Each section loads independently — no full-page freeze */}
          <Suspense fallback={<SectionSkeleton height="h-[28rem]" />}>
            <Features />
          </Suspense>
          <Suspense fallback={<SectionSkeleton height="h-[28rem]" />}>
            <HowItWorks />
          </Suspense>
          <Footer />
          <FloatingContactButton />
        </div>
      </PageTransition>
    </SmoothScroll>
    </>
  );
}
