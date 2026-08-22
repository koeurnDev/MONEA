import PageTransition from "@/components/layout/PageTransition";
import SmoothScroll from "@/components/layout/SmoothScroll";
import dynamic from "next/dynamic";
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { TrustedPartners, Footer } from "@/components/landing/StaticSections";
import { FloatingContactButton } from "@/components/landing/FloatingContactButton";

// Dynamically import below-the-fold sections
const Features = dynamic(() => import("@/components/landing/LandingSections").then(mod => mod.Features));
const HowItWorks = dynamic(() => import("@/components/landing/LandingSections").then(mod => mod.HowItWorks));
const Statistics = dynamic(() => import("@/components/landing/LandingSections").then(mod => mod.Statistics));
const Pricing = dynamic(() => import("@/components/landing/LandingSections").then(mod => mod.Pricing));
const Testimonials = dynamic(() => import("@/components/landing/LandingSections").then(mod => mod.Testimonials));
const FAQ = dynamic(() => import("@/components/landing/LandingSections").then(mod => mod.FAQ));
const FinalCTA = dynamic(() => import("@/components/landing/LandingSections").then(mod => mod.FinalCTA));
 
// --- Main Landing Page ---
// This is now a Server Component, drastically reducing the main bundle size.
export default function LandingPage() {
  return (
    <SmoothScroll>
      <PageTransition>
        <div className="flex flex-col min-h-screen will-change-transform relative">
          <NavBar />
          <Hero />
          <TrustedPartners />
          <Features />
          <Statistics />
          <HowItWorks />
          <Pricing />
          <Testimonials />
          <FAQ />
          <FinalCTA />
          <Footer />
          <FloatingContactButton />
        </div>
      </PageTransition>
    </SmoothScroll>
  );
}
