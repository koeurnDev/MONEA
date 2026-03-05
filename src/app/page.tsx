import PageTransition from "@/components/layout/PageTransition";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Features, HowItWorks, Statistics, Pricing, Testimonials, FAQ, FinalCTA } from "@/components/landing/LandingSections";
import { TrustedPartners, Footer } from "@/components/landing/StaticSections";
import { FloatingContactButton } from "@/components/landing/FloatingContactButton";

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
